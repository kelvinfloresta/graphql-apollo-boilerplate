import promptCreateModel from './create-model'
import promptAddRelation from './add-relation'
import path = require('path')
import inquirer = require('inquirer')

export const SCHEMA_DIR = path.join(__dirname, '../graphql/schema')
export const RESOLVER_DIR = path.join(__dirname, '../graphql/resolvers')
export const MODEL_DIR = path.join(__dirname, '../model')
export const INTERFACE_DIR = path.join(__dirname, '../interface')
export const DATALOADER_DIR = path.join(__dirname, '../dataloader')
export const INDENT = '  '
export const ROOT_TEMPLATE_DIR = path.join(__dirname, 'templates')

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
