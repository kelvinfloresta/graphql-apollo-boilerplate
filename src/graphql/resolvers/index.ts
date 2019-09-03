import * as fs from 'fs'
import { merge } from 'lodash'
import Environment from '../../config/environment'
import { importSafeEslint } from '../../utils/Import.utils'

const resolvers: any[] = []

const filter = Environment.TYPESCRIPT ? '.resolver.ts' : '.resolver.js'
const filterLenght = filter.length * -1

fs.readdirSync(__dirname)
  .filter(file => {
    return file.indexOf('.') !== 0 && file.slice(filterLenght) === filter
  })
  .forEach(file => {
    const { resolver = {} } = importSafeEslint(__dirname, file)
    resolvers.push(resolver)
  })

const resolversMerged = merge(resolvers)

export default resolversMerged
