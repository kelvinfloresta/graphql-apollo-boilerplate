import { BatchParam } from './BatchFactory'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dataLoaderOptions = { cacheKeyFn: (param: BatchParam) => param.key + param.attributes.reduce((acc, el) => acc + el) }

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function DataLoaderFactory () {
  return {
  }
}
