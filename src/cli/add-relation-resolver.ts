import { loadResolver, importModelToContent } from './file.utils'
import { associationOptions as options } from './add-relation'
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
  const isMany = type.toLowerCase().includes('many')
  const associationResolver = isMany ? buildResolerAssociationList(associationOptions) : buildResolerAssociation(associationOptions)
  const newResolverContent = `\n${INDENT}${INDENT}${associationResolver}${comma}${oldResolverContent}`
  const newContent = oldContent.replace(regex, newResolverContent)
  const newContentWithImport = importModelToContent(target, newContent)
  return newContentWithImport
}

function buildResolerAssociationList (associationOptions: options): string {
  const { modelName, target } = associationOptions
  const targetLowerCase = target.toLowerCase()

  return `${target}s: async (${targetLowerCase}: ${target}, args, { dataLoaders }: GraphqlContext, info: GraphQLResolveInfo) => {
      const key = ${targetLowerCase}.id
      const attributes = getAttributes(info, ${target})

      const [result = []] = await ${modelName}Service.loadSafeNull({ key, attributes })
      return result
    }`
}

function buildResolerAssociation (associationOptions: options): string {
  const { modelName, target } = associationOptions
  const modelNameLowerCase = modelName.toLowerCase()
  const loaderName = `${modelNameLowerCase}${target}Loader()`
  const parentKey = associationOptions.type.startsWith('has') ? 'id' : `${target}Id`

  return `${target}: async (${modelNameLowerCase}: ${modelName}, args, { dataLoaders }: GraphqlContext, info: GraphQLResolveInfo) => {
      const key = ${modelNameLowerCase}.${parentKey}
      const attributes = getAttributes(info, ${target})
      return dataLoaders.${loaderName}.loadSafeNull({ key, attributes })
    }`
}
