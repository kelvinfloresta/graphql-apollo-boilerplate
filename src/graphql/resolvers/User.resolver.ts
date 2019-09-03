import { GraphQLResolveInfo } from 'graphql'
import UserModel from '../../model/User.model'
import { GraphqlContext } from 'interfaces/graphql/GraphqlContext.interface'
import { getAttributes } from '../../utils/Graphql.utils'

export const resolver = {

  User: {
  },

  Query: {
    User: async (parent, args, context: GraphqlContext, info: GraphQLResolveInfo) => {
      return UserModel.findByPk(args.id, { attributes: getAttributes(info, UserModel) })
    },
    Users: async (parent, args, context: GraphqlContext, info: GraphQLResolveInfo) => {
      const attributes = getAttributes(info, UserModel)
      return UserModel.findAll({ attributes }) // TODO Filter
    }
  },

  Mutation: {
    SaveUser: async (parent, args) => {
      return UserModel.create(args.input)
    },

    DeleteUser: async (parent, { id }) => {
      return UserModel.destroy({ where: { id } })
    },

    UpdateUser: async (parent, { id, ...rest }) => {
      return UserModel.update(rest, { where: { id } })
    }
  }
}
