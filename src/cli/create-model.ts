import promptConfirm from './confirm'
import promptAddAttribute, { buildAttributes, buildSequelizeAttributes } from './add-attributes'
import promptSchema, { createSchema, buildSchemaFields } from './add-schema'
import { MODEL_DIR } from '.'
import { createResolver } from './add-resolver'
import { loadTemplate } from './file.utils'
import { capitalize } from 'utils/String.utils'
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

  const schemaConfirm = await promptConfirm('Want generate Graphql schema?')
  if (schemaConfirm) {
    var schemaAnswer = await promptSchema(answerAttributes)
  }
  const confirmResolver = await promptConfirm('Want generate Graphql resolver?')

  log(modelName, answerAttributes, schemaAnswer.typeFields, schemaAnswer.inputFields)

  const confirm = await promptConfirm()
  if (confirm) {
    createModel(modelName, attributes, sequelizeAttributes)
    // updateImodels(modelName)
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
