import { Dialect } from 'sequelize/types'

export interface DatabaseConfig {
  DROP_DATABASE?: boolean
  ALTER_TABLE?: boolean
  DIALECT: Dialect
  DATABASE_NAME: string
  USERNAME: string
  PASSWORD: string
  PORT: number
  HOST: string
}

export interface InitConfig {
  DATABASE: DatabaseConfig
  SERVER_PORT: number
  JWT_SECRET: string
  TYPESCRIPT: boolean
}
