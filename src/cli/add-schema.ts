import promptSelectFields from './select-input-fields'
import { loadTemplate, SCHEMA_DIR } from '.'
import fs = require('fs')
import path = require('path')

export default async function promptSchema (answerAttributes): Promise<any> {
  const answerTypeFields = await promptSelectFields(answerAttributes, 'type')
  const answerInputFields = await promptSelectFields(answerAttributes, 'input')
  const typeFields = answerAttributes.filter(att => answerTypeFields.includes(att.name))
  const inputFields = answerAttributes.filter(att => answerInputFields.includes(att.name))
  return { typeFields, inputFields }
}

export async function createSchema (modelName: string, typeFields, inputFields): Promise<void> {
  const content = loadTemplate('schema', { modelName, typeFields, inputFields })
  const fileName = modelName + '.schema.ts'
  const filePath = path.join(SCHEMA_DIR, fileName)
  fs.writeFileSync(filePath, content, 'utf8')
}

export function buildSchemaFields (answerTypeFields): string {
  return answerTypeFields
    .filter(entry => entry.type !== 'UUID')
    .map(entry => {
      const type = getSchemaType(entry.type)
      const notNull = entry.allowNull ? '' : '!'
      return `    ${entry.name}: ${type}${notNull}`
    }).join('\n')
}

function getSchemaType (type: string): string {
  switch (type.toLowerCase()) {
    case 'string':
      return 'String'

    case 'float':
      return 'Float'

    case 'decimal':
      return 'Float'

    case 'int':
      return 'Int'

    case 'boolean':
      return 'Boolean'
  }
}
