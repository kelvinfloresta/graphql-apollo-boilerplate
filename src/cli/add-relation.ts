import { INDENT } from './index'
import { capitalize } from 'utils/String.utils'
import { loadModel, replaceModelFile, loadAllModelsName, importModelToContent } from './file.utils'
import { addSchemaAssociation } from './add-relation-schema'
import promptConfirm from './confirm'
import { addDataloader } from './add-dataloader'
import { addAssociationResolver } from './add-relation-resolver'
import inquirer = require('inquirer')

export const associationType = {
  belongsTo: 'belongsTo',
  hasOne: 'hasOne',
  hasMany: 'hasMany',
  belongsToMany: 'belongsToMany'
}

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
  const confirmResolver = await promptConfirm('Want update Graphql resolver?')
  if (confirmResolver) {
    addAssociationResolver(associationOptions)
    addDataloader(associationOptions)
  }
}

async function promptAssociateTo (modelName: string): Promise<any> {
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
      message: 'Select *target* model:',
      choices: [
        associationType.belongsTo,
        associationType.hasOne,
        associationType.hasMany,
        associationType.belongsToMany
      ]
    },
    {
      name: 'allowNull',
      type: 'confirm',
      message: 'Allow null?'
    },
    {
      name: 'schema',
      type: 'checkbox',
      message: 'Want update Graphql schema?',
      choices: [{ name: 'Input', value: true }, { name: 'type', value: true }]
    }
  ]

  const answer = await inquirer.prompt(QUESTIONS)
  const [input = false, type = false] = answer['schema']
  answer['schema'] = { input, type }
  return answer
}

/**
 * Add relation between model and target passed in `options`.
 * After configure with relation and attributes, its write all changes in model file
 * @param {associationOptions} options
 */
function addModelAssociation (options: associationOptions): void {
  const oldModelContent = loadModel(options.modelName)
  const withModelRelation = addModelRelation(oldModelContent, options)
  const withForeignKey = addForeignKey(withModelRelation, options)
  replaceModelFile(options.modelName, withForeignKey)
}

function addForeignKey (fileContent: string, associationOptions: associationOptions): string {
  const isBelongsTo = associationType.belongsTo === associationOptions.type
  const keyName = isBelongsTo ? associationOptions.target + 'Id' : ''
  if (!keyName) {
    return fileContent
  }

  const regex = new RegExp(`(?<=(// foreignkeys))(.|\\s)*?(?=(  public static associations))`)
  const [oldContent] = fileContent.match(regex) || ['']
  const newContent = `${oldContent}${INDENT}public ${keyName}: string\n`

  return fileContent.replace(regex, newContent)
}

function addModelRelation (fileContent: string, associationOptions: associationOptions): string {
  const withImport = importModelToContent(associationOptions.target, fileContent)
  const WithRelation = buildModelRelation(withImport, associationOptions)
  const withAssociationsInterface = buildAssociationsInterface(WithRelation, associationOptions)
  return withAssociationsInterface
}

function buildModelRelation (fileContent: string, associationOptions: associationOptions): string {
  const regex = new RegExp(`(?<=(// Relations))(.|\\s)*?(?=(export default))`)
  const [oldContent] = fileContent.match(regex) || ['']
  const { target, modelName, type } = associationOptions
  const newContent = `${oldContent}${modelName}.${type}(${target}, {
  foreignKey: {
    allowNull: ${associationOptions.allowNull}
  }
})
`
  return fileContent.replace(regex, newContent)
}

function buildAssociationsInterface (fileContent: string, associationOptions: associationOptions): string {
  const regex = new RegExp(`(?<=(public static associations: {))(.|\\s)*?(?=(}))`)
  const [oldContent] = fileContent.match(regex) || ['']
  const { target, modelName, type } = associationOptions
  const isMany = type.toLowerCase().includes('many')
  const attributeName = isMany ? target + 's' : target
  const newContent = `${oldContent}${INDENT}${attributeName}: Sequelize.${capitalize(type)}<${modelName}, ${target}>\n${INDENT}`

  return fileContent.replace(regex, newContent)
}

export interface associationOptions {
  modelName: string
  target: string
  type: string
  allowNull: boolean
  schema: { type: boolean, input: boolean }
}
