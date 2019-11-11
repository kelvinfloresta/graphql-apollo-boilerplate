import { makeBatchHasMany, makeBatchHasOne, makeBatch } from './BatchFactory'
import { IDataLoaderParam } from 'interface/dataloader/DataLoader.interface'
import { Model, HasOne, HasMany } from 'sequelize/types'
import DataLoader = require('dataLoader')

const dataLoaderOptions = { cacheKeyFn: (param: IDataLoaderParam) => param.key }

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function DataLoaderFactory () {
  return {
  }
}

export class DataLoaderSafeNull<k, V> extends DataLoader<k, V> {
  public async loadSafeNull (params): Promise<V | null> {
    const key = params.key
    if (key === null || key === undefined) {
      return null
    }
    return super.load(params)
  }
}

export function makeDataLoaderHasOne (
  association: HasOne
): DataLoaderSafeNull<IDataLoaderParam, any> {
  const batchGenerated = makeBatchHasOne(association)
  const batchFn = async (params: IDataLoaderParam[]): Promise<any> => batchGenerated(params)
  return new DataLoaderSafeNull(batchFn, dataLoaderOptions)
}

export function makeDataLoaderHasMany<T extends Model> (
  association: HasMany
): DataLoaderSafeNull<IDataLoaderParam, T[][]> {
  const batchGeneratedMany = makeBatchHasMany(association)
  const batchFn = async (params: IDataLoaderParam[]): Promise<T[][][]> => batchGeneratedMany(params)

  return new DataLoaderSafeNull<IDataLoaderParam, T[][]>(batchFn, dataLoaderOptions)
}

export function makeDataLoader<T extends Model> (
  model: new () => T
): DataLoaderSafeNull<IDataLoaderParam, T> {
  const batchGenerated = makeBatch<T>(model)
  const batchFn = async (params: IDataLoaderParam[]): Promise<T[]> => batchGenerated(params)

  return new DataLoaderSafeNull<IDataLoaderParam, T>(batchFn, dataLoaderOptions)
}
