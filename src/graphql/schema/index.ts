import * as fs from 'fs'
import Environment from 'config/environment'
import { importSafeEslint } from 'utils/Import.utils'
import { gql } from 'apollo-server'

let schemas = gql`
  type Query {
    """Work Around for empty Query, never use this"""
    _empty: String
  }

  type Mutation {
    """Work Around for empty Mutation, never use this"""
    _empty: String
  }
`

const filter = Environment.TYPESCRIPT ? '.schema.ts' : '.schema.js'
const filterLenght = filter.length * -1

fs.readdirSync(__dirname)
  .filter(file => {
    return file.indexOf('.') !== 0 && file.slice(filterLenght) === filter
  })
  .forEach(file => {
    const schema = importSafeEslint(__dirname, file).default
    schemas = gql`
      ${schema}
      ${schemas}
    `
  })

export default schemas
