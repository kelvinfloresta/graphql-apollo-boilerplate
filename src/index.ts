import { ApolloServer } from 'apollo-server'
import typeDefs from './graphql/schema'
import DataLoaderFactory from './dataloader/DataLoaderFactory'
import UserService from './services/User.service'
import resolversMerged from './graphql/resolvers'
import sequelize from './config/database/sequelize.database'
import { displayStart } from './utils'
import environment from './config/environment'
const { ALTER_TABLE } = environment

async function getContext ({ req }): Promise<any> {
  const token = req.headers.authorization || ''
  const authUser = await UserService.findByToken(token)
  const dataLoaders = DataLoaderFactory()
  return { authUser, dataLoaders }
}

const server = new ApolloServer({
  typeDefs,
  context: getContext,
  resolvers: resolversMerged
})

sequelize.sync({ alter: ALTER_TABLE }).then(() => {
  server.listen()
    .then(({ url }) => {
      displayStart(url)
    })
})
