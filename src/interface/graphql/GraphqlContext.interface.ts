import AuthUser from 'interface/AuthUser.interface'
import DataLoaderFactory from 'dataloader/DataLoaderFactory'

export interface GraphqlContext {
  authUser?: AuthUser
  dataLoaders: ReturnType<typeof DataLoaderFactory>
}
