import { GraphQLResolveInfo, FieldNode } from 'graphql'
import { get } from 'lodash'
import { Model } from 'sequelize/types'
import UserService from '../service/User.service'
import { GraphqlContext } from 'interface/graphql/GraphqlContext.interface'
import DataLoaderFactory from '../dataloader/DataLoaderFactory'

export async function getContext ({ req }): Promise<GraphqlContext> {
  const token = req.headers.authorization || ''
  const authUser = await UserService.findByToken(token)
  const dataLoaders = DataLoaderFactory()
  return { authUser, dataLoaders }
}

export function getAttributes (info: GraphQLResolveInfo, model: typeof Model): string[] {
  const fields: string[] = []

  const node: FieldNode[] = get(info, 'fieldNodes[0].selectionSet.selections', [])
  node.forEach(el => {
    const isNode = el.selectionSet !== undefined
    const fieldName = el.name.value

    if (!isNode) {
      return fields.push(fieldName)
    }

    const possibleForeignKey = fieldName + 'Id'
    const isForeignKey = model.rawAttributes.hasOwnProperty(possibleForeignKey)
    if (isForeignKey) {
      return fields.push(possibleForeignKey)
    }

    if (fieldName.endsWith('s')) {
      const fieldNameSingular = fieldName.slice(0, -1)
      const possibleRelation = model.associations[fieldNameSingular]
      const modelHaveKey = possibleRelation !== undefined && possibleRelation !== null
      modelHaveKey && fields.push(possibleRelation.foreignKey)
    }
  })

  return fields
}
