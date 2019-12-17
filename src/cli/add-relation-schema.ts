import { associationOptions } from './add-relation'
import { INDENT, SCHEMA_DIR } from 'cli'
import { loadSchema } from './file.utils'
import fs = require('fs')
import path = require('path')

export function addSchemaAssociation (associationOptions: associationOptions): void {
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
