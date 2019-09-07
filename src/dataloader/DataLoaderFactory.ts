import { makeBatchHasMany, makeBatchHasOne } from './BatchFactory'
import { IDataLoaderFactory, IDataLoaderParam } from 'interface/dataloader/DataLoader.interface'
import { Model } from 'sequelize/types'
import Client from '../model/Client.model'
import DataLoader = require('dataLoader')

const dataLoaderOptions = { cacheKeyFn: (param: IDataLoaderParam) => param.key }

export default function DataLoaderFactory (): IDataLoaderFactory {
  return {
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    // clientUserLoader: () => makeDataLoaderHasOne(Client.associations['User'])
  }
}

export class DataLoaderSafeNull<K, V> extends DataLoader<K, V> {
  public async loadSafeNull (params): Promise<V | null> {
    const key = params.key
    if (key === null || key === undefined) {
      return null
    }
    return super.load(params)
  }
}

// function makeDataLoaderHasOne<T extends Model> (
//   association
// ): DataLoaderSafeNull<IDataLoaderParam, T> {
//   const batchGenerated = makeBatchHasOne(association)
//   const batchFn = async (params: IDataLoaderParam[]): Promise<T[]> => batchGenerated(params)

//   return new DataLoaderSafeNull<any, any>(batchFn, dataLoaderOptions)
// }

// function makeDataLoaderHasMany<TInstance extends sequelize.Instance<any>> (
//   association: sequelize.IncludeAssociation
// ): DataLoaderSafeNull<IDataLoaderParam, TInstance[][]> {
//   const batchGeneratedMany = makeBatchHasMany<TInstance>(association)
//   const batchFn = async (params: IDataLoaderParam[]): Promise<TInstance[][][]> => batchGeneratedMany(params)

//   return new DataLoaderSafeNull<IDataLoaderParam, TInstance[][]>(batchFn, dataLoaderOptions)
// }

// function makeDataLoader<TInstance extends Model> (
//   model: Model<any, any>
// ): DataLoaderSafeNull<IDataLoaderParam, TInstance> {
//   const batchGenerated = makeBatch<TInstance>(model)
//   const batchFn = async (params: IDataLoaderParam[]): Promise<TInstance[]> => batchGenerated(params)

//   return new DataLoaderSafeNull<IDataLoaderParam, TInstance>(batchFn, dataLoaderOptions)
// }
