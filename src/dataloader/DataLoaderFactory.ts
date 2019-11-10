import { makeBatchHasMany, makeBatchHasOne } from './BatchFactory'
import { IDataLoaderFactory, IDataLoaderParam } from 'interface/dataloader/DataLoader.interface'
import { Model, HasOne, HasMany } from 'sequelize/types'
import DataLoader = require('dataLoader')

const dataLoaderOptions = { cacheKeyFn: (param: IDataLoaderParam) => param.key }

export default function DataLoaderFactory (): IDataLoaderFactory {
  return {
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

export function makeDataLoaderHasOne<T extends Model> (
  association: HasOne
): DataLoaderSafeNull<IDataLoaderParam, T> {
  const batchFn = makeBatchHasOne(association)
  return new DataLoaderSafeNull<any, any>(batchFn, dataLoaderOptions)
}

export function makeDataLoaderHasMany<T extends Model> (
  association: HasMany
): DataLoaderSafeNull<IDataLoaderParam, T[][]> {
  const batchGeneratedMany = makeBatchHasMany(association)
  const batchFn = async (params: IDataLoaderParam[]): Promise<T[][][]> => batchGeneratedMany(params)

  return new DataLoaderSafeNull<IDataLoaderParam, T[][]>(batchFn, dataLoaderOptions)
}

export function makeDataLoader<TInstance extends Model> (
  model: Model<any, any>
): DataLoaderSafeNull<IDataLoaderParam, TInstance> {
  const batchGenerated = makeBatch<TInstance>(model)
  const batchFn = async (params: IDataLoaderParam[]): Promise<TInstance[]> => batchGenerated(params)

  return new DataLoaderSafeNull<IDataLoaderParam, TInstance>(batchFn, dataLoaderOptions)
}
