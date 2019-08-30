import inquirer = require('inquirer')

const ATTRIBUTE_QUESTIONS = [
  {
    name: 'name',
    type: 'input',
    message: 'Attribute name:',
    validate: function (input) {
      if (/[a-z]/.test(input)) return true
      else return 'Project name may only include letters'
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

export default async function promptAddAttribute (attributes = []): Promise<any> {
  const { continue: hasMore, ...answers } = await inquirer.prompt(ATTRIBUTE_QUESTIONS)
  attributes.push(answers)
  if (hasMore) {
    await promptAddAttribute(attributes)
  }
  return attributes
}

export function buildAttributes (answerAttributes = []): string {
  return answerAttributes.map(entry => {
    const type = getAttributeType(entry.type)
    return `  ${entry.name}: ${type}`
  }).join('\n')
}

export function buildSequelizeAttributes (answerAttributes = []): string {
  return answerAttributes.map(props => {
    return `    ${props.name}: {
      type: ${getSequelizeAttributeType(props.type)},
      allowNull: ${props.allowNull}
    }`
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
}

function getSequelizeAttributeType (type: string): string {
  switch (type.toLocaleLowerCase()) {
    case 'string':
      return 'DataTypes.STRING'

    case 'float':
      return 'DataTypes.FLOAT'

    case 'decimal':
      return 'DataTypes.DECIMAL'

    case 'int':
      return 'DataTypes.INTEGER'

    case 'boolean':
      return 'DataTypes.BOOLEAN'
  }
}