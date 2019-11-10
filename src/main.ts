import { ApolloServer } from 'apollo-server'
import typeDefs from './graphql/schema'
import resolversMerged from './graphql/resolvers'
import environment from './config/environment'
import { getContext } from './utils/Graphql.utils'
import { displayStart } from './utils/Console.utils'
import db from './config/database'

const { DATABASE: { ALTER_TABLE } } = environment

const server = new ApolloServer({
  typeDefs,
  context: getContext,
  resolvers: resolversMerged
})

db
  .sync({ alter: ALTER_TABLE })
  .then(async () => {
    const { url } = await server.listen()
    displayStart(url)
  })
