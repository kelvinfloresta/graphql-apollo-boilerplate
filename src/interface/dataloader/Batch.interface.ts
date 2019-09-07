import { IDataLoaderParam } from './DataLoader.interface'

export type generateBatch<T> = (params: IDataLoaderParam[]) => Promise<T>
