import { INDENT } from '../cli'
import inquirer = require('inquirer')

const ATTRIBUTE_QUESTIONS = [
  {
    name: 'name',
    type: 'input',
    message: 'Attribute name:',
    validate: function (input: string) {
      if (/[a-z]/.test(input)) return true
      return 'Project name may only include letters'
    }
  },
  {
    name: 'type',
    type: 'list',
    choices: ['String', 'Float', 'Decimal', 'Int', 'Boolean'],
    message: 'Attribute type:'
  },
  {
    name: 'allowNull',
    type: 'confirm',
    message: 'Allow null?'
  },
  {
    name: 'continue',
    type: 'confirm',
    message: 'Add more attributes?'
  }
]

export default async function promptAddAttribute (attributes: any[] = []): Promise<any> {
  const { continue: hasMore, ...answers } = await inquirer.prompt(ATTRIBUTE_QUESTIONS)
  attributes.push(answers)
  if (hasMore) {
    await promptAddAttribute(attributes)
  }
  return attributes
}

export function buildAttributes (answerAttributes: any[] = []): string {
  return answerAttributes.map(entry => {
    const type = getAttributeType(entry.type)
    return `${INDENT}public ${entry.name}: ${type}`
  }).join('\n')
}

export function buildSequelizeAttributes (answerAttributes: any[] = []): string {
  return answerAttributes.map(props => {
    return `${INDENT}${props.name}: {
${INDENT}${INDENT}type: ${getSequelizeAttributeType(props.type)},
${INDENT}${INDENT}allowNull: ${props.allowNull}
${INDENT}}`
  }).join(',\n')
}

function getAttributeType (type: string): string {
  switch (type.toLocaleLowerCase()) {
    case 'string':
      return 'string'

    case 'float':
      return 'number'

    case 'decimal':
      return 'number'

    case 'int':
      return 'number'

    case 'boolean':
      return 'boolean'
  }

  throw new Error('Invalid parameter')
}

function getSequelizeAttributeType (type: string): string {
  switch (type.toLocaleLowerCase()) {
    case 'string':
      return 'Sequelize.STRING'

    case 'float':
      return 'Sequelize.FLOAT'

    case 'decimal':
      return 'Sequelize.DECIMAL'

    case 'int':
      return 'Sequelize.INTEGER'

    case 'boolean':
      return 'Sequelize.BOOLEAN'
  }

  throw new Error('Invalid parameter')
}
