/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BatchParam,
  makeBatchBelongsTo,
  makeBatchBelongsToMany,
  makeBatchHasOne,
  makeBatchHasMany,
  makeBatch,
  makeBatchManyBelongsTo
} from './BatchFactory'
import DataLoader from 'dataloader'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dataLoaderOptions = { cacheKeyFn: (param: BatchParam) => param.key + param.attributes.reduce((acc, el) => acc + el) }

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function DataLoaderFactory () {
  return {
  }
}
