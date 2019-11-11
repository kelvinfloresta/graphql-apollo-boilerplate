import promptConfirm from './confirm'
import { MODEL_DIR, SCHEMA_DIR, RESOLVER_DIR, INDENT, importModelToContent } from './index'
import { capitalize } from 'utils/String.utils'
import { addDataloader } from './add-dataloader'
import inquirer = require('inquirer')
import fs = require('fs')
import path = require('path')

export default async function promptAddAssociation (): Promise<void> {
  const QUESTIONS = [
    {
      name: 'modelName',
      type: 'list',
      message: 'Select model:',
      choices: loadAllModelsName()
    }
  ]

  const { modelName } = await inquirer.prompt(QUESTIONS)
  const { target, type, allowNull, schema } = await promptAssociateTo(modelName)
  const associationOptions: associationOptions = { modelName, target, type, allowNull, schema }
  addModelAssociation(associationOptions)
  addSchemaAssociation(associationOptions)
  addDataloader(associationOptions)
  const confirmResolver = await promptConfirm('Want add resolver?')
  if (confirmResolver) {
    addAssociationResolver(associationOptions)
  }
}

async function promptAssociateTo (modelName): Promise<any> {
  const QUESTIONS = [
    {
      name: 'target',
      type: 'list',
      message: 'Select model:',
      choices: loadAllModelsName().filter(model => model !== modelName)
    },
    {
      name: 'type',
      type: 'list',
      message: 'Select model:',
      choices: ['belongsTo', 'hasOne', 'hasMany']
    },
    {
      name: 'allowNull',
      type: 'confirm',
      message: 'Allow null?'
    },
    {
      name: 'schema',
      type: 'checkbox',
      message: 'Add type/input to schema?',
      choices: [{ name: 'Input', value: true }, { name: 'type', value: true }]
    }
  ]
  const answer = await inquirer.prompt(QUESTIONS)
  const [input = false, type = false] = answer['schema']
  answer['schema'] = { input, type }
  return answer
}

function addModelAssociation (options: associationOptions): void {
  const oldModelContent = loadModel(options.modelName)
  const withModelRelation = addModelRelation(oldModelContent, options)
  const withAttributes = addModelAttribute(withModelRelation, options)
  replaceModelFile(options.modelName, withAttributes)
}

function addModelAttribute (fileContent: string, associationOptions: associationOptions): string {
  return ''
}

function addModelRelation (fileContent: string, associationOptions: associationOptions): string {
  const withImport = importModelToContent(associationOptions.target, fileContent)
  const WithRelation = buildModelRelation(withImport, associationOptions)
  const WithTypes = buildModelTypes(WithRelation, associationOptions)
  return WithTypes
}

function buildModelTypes (fileContent: string, associationOptions: associationOptions): string {
  const regex = new RegExp(`(?<=(public static associations: {))(.|\\s)*?(?=(}))`)
  const [oldContent] = fileContent.match(regex) || ['']
  const { target, modelName, type } = associationOptions
  const isMany = type.toLowerCase().includes('many')
  const attributeName = isMany ? target + 's' : target
  const newContent = `${oldContent}${INDENT}${attributeName}: Sequelize.${capitalize(type)}<${modelName}, ${target}>\n${INDENT}`

  return fileContent.replace(regex, newContent)
}

function buildModelRelation (fileContent: string, associationOptions: associationOptions): string {
  const regex = new RegExp(`(?<=(// Relations))(.|\\s)*?(?=(export default))`)
  const [oldContent] = fileContent.match(regex) || ['']
  const { target, modelName, type } = associationOptions
  const isSource = associationOptions.type.startsWith('has')
  const keyName = isSource ? 'sourceKey' : 'targetKey'
  const newContent = `${oldContent}${modelName}.${type}(${target}, {
${INDENT}${keyName}: 'id'
})

`
  return fileContent.replace(regex, newContent)
}

function replaceModelFile (modelName: string, newContent: string): void{
  const filePath = path.join(MODEL_DIR, modelName + '.model.ts')
  fs.writeFileSync(filePath, newContent, 'utf8')
}

function loadModel (modelName: string): string {
  const filePath = path.join(MODEL_DIR, modelName + '.model.ts')
  const content = fs.readFileSync(filePath, 'utf8')
  return content
}

function loadSchema (modelName: string): string {
  const filePath = path.join(SCHEMA_DIR, modelName + '.schema.ts')
  const content = fs.readFileSync(filePath, 'utf8')
  return content
}

// function replaceModelInterface (oldContent: string, associationOptions: associationOptions): string {
//   const regexModelInterface = /(?<=Instance> \{)(.|\s)*?(?=\})/
//   const [oldModelInterface] = oldContent.match(regexModelInterface) || ['Error']
//   const newModelInterface = `${oldModelInterface}  ${associationOptions.target}: Sequelize.IncludeAssociation\n`
//   return oldContent.replace(regexModelInterface, newModelInterface)
// }

// function replaceAttributesInterface (oldContent: string, { target, type }: associationOptions): string {
//   if (type.toLocaleLowerCase() !== 'belongsto') {
//     return oldContent
//   }
//   const regexModelInterface = /(?<=IBaseAttributes \{)(.|\s)*?(?=\})/
//   const [oldModelInterface] = oldContent.match(regexModelInterface) || ['Error']
//   const newModelInterface = `${oldModelInterface}  ${target}Id?: string\n`
//   return oldContent.replace(regexModelInterface, newModelInterface)
// }

function loadAllModelsName (): string[] {
  return fs.readdirSync(MODEL_DIR, 'utf8')
    .filter(model => model !== 'index.ts' && (model.indexOf('.') !== 0))
    .map(model => model.slice(0, model.length - 9))
}

function addSchemaAssociation (associationOptions: associationOptions): void {
  const { modelName } = associationOptions
  const content = loadSchema(modelName)
  const newSchemaTypeAssociation = replaceSchemaTypeAssociation(content, associationOptions)
  const newSchemaInputAssociation = replaceSchemaInputAssociation(newSchemaTypeAssociation, associationOptions)
  const filePath = path.join(SCHEMA_DIR, modelName + '.schema.ts')
  fs.writeFileSync(filePath, newSchemaInputAssociation, 'utf8')
}

function replaceSchemaInputAssociation (content, associationOptions: associationOptions): string {
  const { target, modelName, schema } = associationOptions
  const hasInput = content.indexOf('Input {') !== -1
  if (!schema.input || !hasInput) {
    return content
  }
  const regex = new RegExp(`(?<=input ${modelName}Input \\{)(.|\\s)*?(?=\\})`)
  const [oldSchemaAssociation] = content.match(regex)
  const targetType = getTargetSchemaType(associationOptions, true)
  const newAssociationContent = `${oldSchemaAssociation}${INDENT}${target}: ${targetType}\n${INDENT}`
  return content.replace(regex, newAssociationContent)
}

function replaceSchemaTypeAssociation (content, associationOptions: associationOptions): string {
  const { target, modelName, schema } = associationOptions
  if (!schema.type) {
    return content
  }
  const regex = new RegExp(`(?<=type ${modelName} \\{)(.|\\s)*?(?=createdAt)`)
  const [oldSchemaAssociation] = content.match(regex)
  const targetType = getTargetSchemaType(associationOptions)
  const newAssociationContent = `${oldSchemaAssociation}${target}: ${targetType}\n${INDENT}${INDENT}`
  return content.replace(regex, newAssociationContent)
}

function getTargetSchemaType ({ type, target, allowNull }: associationOptions, isInput = false): string {
  const isMany = type.toLowerCase().includes('many')
  const targetName = isInput ? 'ID' : target
  if (isMany) {
    return `[${targetName}!]!`
  }

  if (allowNull) {
    return targetName
  }

  return targetName + '!'
}

function addAssociationResolver (associationOptions: associationOptions): void {
  if (!associationOptions.schema.type) {
    return
  }
  const { modelName } = associationOptions
  const content = loadResolver(modelName)
  if (!content) {
    return
  }

  const newContent = replaceResolverAssociation(content, associationOptions)
  const filePath = path.join(RESOLVER_DIR, modelName + '.resolver.ts')
  fs.writeFileSync(filePath, newContent, 'utf8')
}

function loadResolver (modelName: string): string | undefined {
  const filePath = path.join(RESOLVER_DIR, modelName + '.resolver.ts')
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8')
    return content
  }
  console.error(`File not exists: ${filePath}`)
}

function replaceResolverAssociation (oldContent: string, associationOptions: associationOptions): string {
  const { modelName, type, target } = associationOptions
  const regex = new RegExp(`(?<= {2}${modelName}: \\{)(.|\\s)*?(?=(\\S))`)
  const match = oldContent.match(regex) || []
  const oldResolverContent = match[0]
  const isEmpty = match[2] === '}'
  const comma = isEmpty ? '' : ','
  const isMany = type.toLowerCase().includes('many')
  const associationResolver = isMany ? buildResolerAssociationList(associationOptions) : buildResolerAssociation(associationOptions)
  const newResolverContent = `\n${INDENT}${INDENT}${associationResolver}${comma}${oldResolverContent}`
  const newContent = oldContent.replace(regex, newResolverContent)
  const newContentWithImport = importModelToContent(target, newContent)
  return newContentWithImport
}

function buildResolerAssociationList (associationOptions: associationOptions): string {
  const { modelName, target } = associationOptions
  const targetLowerCase = target.toLowerCase()
  const loaderName = `${modelName.toLowerCase()}${target}Loader()`

  return `${target}s: async (${targetLowerCase}: ${target}, args, { dataLoaders }: GraphqlContext, info: GraphQLResolveInfo) => {
      const key = ${targetLowerCase}.id
      const attributes = getAttributes(info, ${target})

      const [result = []] = await dataLoaders.${loaderName}.loadSafeNull({ key, attributes })
      return result
    }`
}

function buildResolerAssociation (associationOptions: associationOptions): string {
  const { modelName, target } = associationOptions
  const modelNameLowerCase = modelName.toLowerCase()
  const loaderName = `${modelNameLowerCase}${target}Loader()`
  const parentKey = associationOptions.type.startsWith('has') ? 'id' : `${target}Id`

  return `${target}: async (${modelNameLowerCase}: ${modelName}, args, { dataLoaders }: GraphqlContext, info: GraphQLResolveInfo) => {
      const key = ${modelNameLowerCase}.${parentKey}
      const attributes = getAttributes(info, ${target})
      return dataLoaders.${loaderName}.loadSafeNull({ key, attributes })
    }`
}

export interface associationOptions {
  modelName: string
  target: string
  type: string
  allowNull: boolean
  schema: { type: boolean, input: boolean }
}
