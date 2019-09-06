import { GraphQLResolveInfo } from 'graphql'
import UserModel from '../../model/User.model'
import { GraphqlContext } from 'interface/graphql/GraphqlContext.interface'
import { getAttributes } from '../../utils/Graphql.utils'

export const resolver = {

  User: {
  },

  Query: {
    User: async (_parent: any, args: { id: string }, _context: GraphqlContext, info: GraphQLResolveInfo) => {
      return UserModel.findByPk(args.id, { attributes: getAttributes(info, UserModel) })
    },
    Users: async (_parent: any, _args: any, _context: GraphqlContext, info: GraphQLResolveInfo) => {
      const attributes = getAttributes(info, UserModel)
      return UserModel.findAll({ attributes }) // TODO Filter
    }
  },

  Mutation: {
    SaveUser: async (_parent: any, args: { input: any }) => {
      return UserModel.create(args.input)
    },

    DeleteUser: async (_parent: any, { id }: any) => {
      return UserModel.destroy({ where: { id } })
    },

    UpdateUser: async (_parent: any, { id, ...rest }: any) => {
      return UserModel.update(rest, { where: { id } })
    }
  }
}
