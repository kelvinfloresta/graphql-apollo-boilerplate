import { GraphQLResolveInfo } from 'graphql'
import { Model } from 'sequelize/types'
import UserService from '../services/User.service'
import { GraphqlContext } from 'interfaces/graphql/GraphqlContext.interface'
import DataLoaderFactory from '../dataloader/DataLoaderFactory'

export async function getContext ({ req }): Promise<GraphqlContext> {
  const token = req.headers.authorization || ''
  const authUser = await UserService.findByToken(token)
  const dataLoaders = DataLoaderFactory()
  return { authUser, dataLoaders }
}

export function getAttributes (info: GraphQLResolveInfo, model: typeof Model): string[] {
  const fields = []

  info.fieldNodes[0]
    .selectionSet
    .selections.forEach(el => {
      const isNode = el['selectionSet'] !== undefined
      const fieldName = el['name']['value'] as string

      if (!isNode) {
        fields.push(fieldName)
        return
      }

      const possibleForeignKey = fieldName + 'Id'
      const relation = model['attributes'][possibleForeignKey]
      const modelHaveKey = relation !== undefined && relation !== null

      if (modelHaveKey) {
        fields.push(possibleForeignKey)
      }

      if (!modelHaveKey && fieldName.endsWith('s')) {
        const fieldNameSingular = fieldName.slice(0, -1)
        const possibleForeignKey = fieldNameSingular + 'Id'
        const anotherPossibleRelation = model['attributes'][possibleForeignKey]
        const modelHaveKey = anotherPossibleRelation !== undefined && anotherPossibleRelation !== null
        modelHaveKey && fields.push(possibleForeignKey)
      }
    })

  return fields.length > 0 ? fields : null
}

export function getFieldsNode (info: GraphQLResolveInfo): string[] {
  const fields = info.fieldNodes[0]
    .selectionSet
    .selections.filter(el => el['selectionSet'] !== undefined)
    .map(el => el['name']['value'] as string)

  return fields.length > 0 ? fields : null
}
