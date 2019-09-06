import { IDataLoaderFactory } from 'interfaces/dataloader/DataLoader.interface'
import AuthUser from 'interfaces/AuthUser.interface'

export interface GraphqlContext {
  authUser?: AuthUser
  dataLoaders: IDataLoaderFactory
}
