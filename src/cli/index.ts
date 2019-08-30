import promptCreateModel from './create-model'
import promptAddRelation from './add-relation'
import fs = require('fs')
import path = require('path')
import inquirer = require('inquirer')

export const SCHEMA_DIR = path.join(__dirname, '../graphql/schemas')
export const RESOLVER_DIR = path.join(__dirname, '../graphql/resolvers')
export const MODEL_DIR = path.join(__dirname, '../model')
export const INTERFACE_DIR = path.join(__dirname, '../interface')
export const DATALOADER_DIR = path.join(__dirname, '../dataloader')
const ROOT_TEMPLATE_DIR = path.join(__dirname, 'templates')

export function loadTemplate (templateName, params: { [index: string]: string }): string {
  const templatePath = path.join(ROOT_TEMPLATE_DIR, templateName)
  let content = fs.readFileSync(templatePath, 'utf8')
  Object.entries(params)
    .forEach(([key, value]) => {
      var re = new RegExp(`{{${key}}}`, 'g')
      content = content.replace(re, value)
    })
  return content
}

const QUESTIONS = [
  {
    name: 'command',
    type: 'list',
    choices: ['create-model', 'add-relation'],
    message: 'Select command:'
  }
]

inquirer.prompt(QUESTIONS)
  .then(({ command }) => {
    switch (command) {
      case 'create-model':
        promptCreateModel()
        break

      case 'add-relation':
        promptAddRelation()
        break

      default:
        console.log('Bye...')
        break
    }
  })
