import { BatchParam, makeBatchBelongsToMany } from './BatchFactory'
import DataLoader from 'dataLoader'
import Test from 'model/Test.model'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dataLoaderOptions = { cacheKeyFn: (param: BatchParam) => param.key + param.attributes.reduce((acc, el) => acc + el) }

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function DataLoaderFactory () {
  return {
    test: new DataLoader(makeBatchBelongsToMany(Test.associations.Users), dataLoaderOptions)
  }
}
