import { BatchParam } from './BatchFactory'
import DataLoader from 'dataLoader'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dataLoaderOptions = { cacheKeyFn: (param: BatchParam) => param.key + param.attributes.reduce((acc, el) => acc + el) }

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function DataLoaderFactory () {
  return {
  }
}

export class DataLoaderSafeNull<V> extends DataLoader<BatchParam, V> {
  public async loadSafeNull (params: BatchParam): Promise<V | null> {
    const key = params.key
    if (key === null || key === undefined) {
      return null
    }

    return super.load(params)
  }
}
