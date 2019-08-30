// import { makeBatch, makeBatchHasMany, makeBatchHasOne } from './BatchFactory'
import { IDataLoaderFactory, IDataLoaderParam } from 'interfaces/dataloader/IDataLoader'
// import sequelize = require('sequelize')
// import DataLoader = require('dataLoader')

export default function DataLoaderFactory (): IDataLoaderFactory {
  return {
  }
}

// const dataLoaderOptions = { cacheKeyFn: (param: IDataLoaderParam) => param.key }

// export class DataLoaderSafeNull<K, V> extends DataLoader<K, V> {
//   public async loadSafeNull (params): Promise<V> {
//     const key = params.key
//     if (key === null || key === undefined) {
//       return null
//     }
//     return super.load(params)
//   }
// }

// function makeDataLoader<TInstance extends sequelize.Instance<any>> (
//   model: sequelize.Model<any, any>
// ): DataLoaderSafeNull<IDataLoaderParam, TInstance> {
//   const batchGenerated = makeBatch<TInstance>(model)
//   const batchFn = async (params: IDataLoaderParam[]): Promise<TInstance[]> => batchGenerated(params)

//   return new DataLoaderSafeNull<IDataLoaderParam, TInstance>(batchFn, dataLoaderOptions)
// }

// function makeDataLoaderHasOne<TInstance extends sequelize.Instance<any>> (
//   association: sequelize.IncludeAssociation
// ): DataLoaderSafeNull<IDataLoaderParam, TInstance> {
//   const batchGenerated = makeBatchHasOne<TInstance>(association)
//   const batchFn = async (params: IDataLoaderParam[]): Promise<TInstance[]> => batchGenerated(params)

//   return new DataLoaderSafeNull<IDataLoaderParam, TInstance>(batchFn, dataLoaderOptions)
// }

// function makeDataLoaderHasMany<TInstance extends sequelize.Instance<any>> (
//   association: sequelize.IncludeAssociation
// ): DataLoaderSafeNull<IDataLoaderParam, TInstance[][]> {
//   const batchGeneratedMany = makeBatchHasMany<TInstance>(association)
//   const batchFn = async (params: IDataLoaderParam[]): Promise<TInstance[][][]> => batchGeneratedMany(params)

//   return new DataLoaderSafeNull<IDataLoaderParam, TInstance[][]>(batchFn, dataLoaderOptions)
// }
