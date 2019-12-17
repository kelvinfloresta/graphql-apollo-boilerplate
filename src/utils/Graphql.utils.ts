import { GraphQLResolveInfo } from 'graphql'
import { get } from 'lodash'
import { Model } from 'sequelize/types'
import UserService from '../service/User.service'
import { GraphqlContext } from 'interface/graphql/GraphqlContext.interface'

export async function getContext ({ req }): Promise<GraphqlContext> {
  const token = req.headers.authorization || ''
  const authUser = await UserService.findByToken(token)
  return { authUser }
}

export function getAttributes (info: GraphQLResolveInfo, model: typeof Model): string[] {
  const fields: string[] = []

  const node = get(info, 'fieldNodes[0].selectionSet.selections', [])
  node.forEach((el: any) => {
    const isNode = el['selectionSet'] !== undefined
    const fieldName = el['name']['value'] as string

    if (!isNode) {
      fields.push(fieldName)
      return
    }

    const possibleForeignKey = fieldName + 'Id'
    const relation = model.associations[possibleForeignKey]
    const modelHaveKey = relation !== undefined && relation !== null

    if (modelHaveKey) {
      fields.push(possibleForeignKey)
    }

    if (!modelHaveKey && fieldName.endsWith('s')) {
      const fieldNameSingular = fieldName.slice(0, -1)
      const possibleRelation = model.associations[fieldNameSingular]
      const modelHaveKey = possibleRelation !== undefined && possibleRelation !== null
      modelHaveKey && fields.push(possibleRelation.foreignKey)
    }
  })

  return fields
}
