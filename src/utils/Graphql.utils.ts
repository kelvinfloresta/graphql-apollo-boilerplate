import UserService from '../services/User.service'
import { GraphqlContext } from 'interfaces/graphql/GraphqlContext.interface'
import DataLoaderFactory from '../dataloader/DataLoaderFactory'

export async function getContext ({ req }): Promise<GraphqlContext> {
  const token = req.headers.authorization || ''
  const authUser = await UserService.findByToken(token)
  const dataLoaders = DataLoaderFactory()
  return { authUser, dataLoaders }
}
