import { IDataLoaderFactory } from '../dataloader/IDataLoader'
import AuthUser from '../AuthUser.interface'

export interface IGraphqlContext {
  authUser?: AuthUser
  dataLoaders: IDataLoaderFactory
}
