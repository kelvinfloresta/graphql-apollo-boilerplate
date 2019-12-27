import { loadResolver, importModelToContent } from './file.utils'
import { associationOptions as options, associationType } from './add-relation'
import { RESOLVER_DIR, INDENT } from 'cli'
import path = require('path')
import fs = require('fs')

export function addAssociationResolver (associationOptions: options): void {
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

function replaceResolverAssociation (oldContent: string, associationOptions: options): string {
  const { modelName, type, target } = associationOptions
  const regex = new RegExp(`(?<= {2}${modelName}: \\{)(.|\\s)*?(?=(\\S))`)
  const match = oldContent.match(regex) || []
  const oldResolverContent = match[0]
  const isEmpty = match[2] === '}'
  const comma = isEmpty ? '' : ','
  const isMany = type === associationType.hasMany
  const associationResolver = isMany ? buildResolerAssociationList(associationOptions) : buildResolerAssociation(associationOptions)
  const newResolverContent = `\n${INDENT}${INDENT}${associationResolver}${comma}${oldResolverContent}`
  const newContent = oldContent.replace(regex, newResolverContent)
  const newContentWithImport = importModelToContent(target, newContent)
  return newContentWithImport
}

function buildResolerAssociationList (associationOptions: options): string {
  const { modelName, target } = associationOptions
  const targetLowerCase = target.toLowerCase()
  const modelNameLowerCase = modelName.toLowerCase()
  const loaderName = `${modelNameLowerCase}${target}s`

  return `${target}s: async (${targetLowerCase}: ${target}, _args, { dataLoaders }: GraphqlContext, info: GraphQLResolveInfo) => {
      const key = ${targetLowerCase}.id
      const attributes = getAttributes(info, ${target})

      return dataLoaders.${loaderName}.load({ key, attributes })
    }`
}

function buildResolerAssociation (associationOptions: options): string {
  const { modelName, target } = associationOptions
  const modelNameLowerCase = modelName.toLowerCase()
  const loaderName = `${modelNameLowerCase}${target}`
  const parentKey = getParentKey(associationOptions)

  return `${target}: async (${modelNameLowerCase}: ${modelName}, _args, { dataLoaders }: GraphqlContext, info: GraphQLResolveInfo) => {
      const key = ${modelNameLowerCase}.${parentKey}
      const attributes = getAttributes(info, ${target})
      return dataLoaders.${loaderName}.load({ key, attributes })
    }`
}

function getParentKey ({ type, target }: options): string {
  switch (type) {
    case associationType.hasOne:
      return 'id'

    case associationType.belongsTo:
      return `${target}Id`
  }

  throw new Error('Invalid parameter')
}
