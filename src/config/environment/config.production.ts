import { InitConfig } from 'interface/environment/Environment.interface'

export const config: InitConfig = {
  SERVER_PORT: 4000,
  DATABASE: {
    DATABASE_NAME: '',
    USERNAME: 'root',
    PASSWORD: 'root',
    HOST: '',
    PORT: 3306,
    DIALECT: 'mysql',
    ALTER_TABLE: false,
    DROP_DATABASE: false
  },
  JWT_SECRET: 'production', // Change this
  TYPESCRIPT: __filename.slice(-3) === '.ts'
}
