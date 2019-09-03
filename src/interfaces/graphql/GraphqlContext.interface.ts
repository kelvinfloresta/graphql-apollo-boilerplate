import { IDataLoaderFactory } from 'interfaces/dataloader/IDataLoader'
import AuthUser from 'interfaces/AuthUser.interface'

export interface GraphqlContext {
  authUser?: AuthUser
  dataLoaders: IDataLoaderFactory
}
