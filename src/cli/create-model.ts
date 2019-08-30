import promptConfirm from './confirm'
import promptAddAttribute, { buildAttributes, buildSequelizeAttributes } from './add-attributes'
import promptSchema, { createSchema, buildSchemaFields } from './add-schema'
import { loadTemplate, MODEL_DIR, INTERFACE_DIR } from '.'
import { createResolver } from './add-resolver'
import { capitalize } from 'lodash'
import inquirer = require('inquirer')
import fs = require('fs')
import path = require('path')

const QUESTIONS = [
  {
    name: 'model-name',
    type: 'input',
    message: 'Model name:',
    validate: function (input) {
      if (/[a-z]/.test(input) && capitalize(input) === input) return true
      else return 'Project name may only include letters and must be capitalized'
    }
  }
]

export default async function promptCreateModel (): Promise<void> {
  const answers = await inquirer.prompt(QUESTIONS)
  const modelName = answers['model-name']

  const answerAttributes = await promptAddAttribute()
  const attributes = buildAttributes(answerAttributes)
  const sequelizeAttributes = buildSequelizeAttributes(answerAttributes)

  const schemaConfirm = await promptConfirm('Want define input/type fields?')
  if (schemaConfirm) {
    var schemaAnswer = await promptSchema(answerAttributes)
  }
  const confirmResolver = await promptConfirm('Want generate resolver file?')

  log(modelName, answerAttributes, schemaAnswer.typeFields, schemaAnswer.inputFields)

  const confirm = await promptConfirm()
  if (confirm) {
    createModel(modelName, attributes, sequelizeAttributes)
    updateImodels(modelName)
  }
  if (confirm && confirmResolver) {
    createResolver(modelName)
  }
  if (confirm && schemaConfirm) {
    const typeFields = buildSchemaFields(schemaAnswer.typeFields)
    const inputFields = buildSchemaFields(schemaAnswer.inputFields)
    createSchema(modelName, typeFields, inputFields)
  }
}

function createModel (modelName: string, attributes, sequelizeAttributes): void {
  const content = loadTemplate('model', { modelName, attributes, sequelizeAttributes })
  const fileName = modelName + '.model.ts'
  const filePath = path.join(MODEL_DIR, fileName)
  fs.writeFileSync(filePath, content, 'utf8')
}

function log (modelName, answerAttributes, typeFields, inputFields): void {
  console.log('Model Name:', modelName)
  console.log('Attributes:', answerAttributes)
  console.log('Type Fields:', typeFields.map(e => e.name as string))
  console.log('Input Fields:', inputFields.map(e => e.name as string))
}

function updateImodels (modelName): void {
  const regex = /(?<=IModels extends Models \{)(.|\s)*?(?=\})/
  const filePath = path.join(INTERFACE_DIR, 'IModels.ts')
  const oldContent = fs.readFileSync(filePath, 'utf8')
  const newProp = `readonly ${modelName}: ${modelName}Model`
  const [oldProps] = oldContent.match(regex)
  let newContent = oldContent.replace(regex, `${oldProps}  ${newProp}\n`)

  const newImport = `import { ${modelName}Model } from 'src/model/${modelName}.model'\n`
  newContent = newImport + newContent
  fs.writeFileSync(filePath, newContent, 'utf8')
}
