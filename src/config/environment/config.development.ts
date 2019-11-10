import { InitConfig } from 'interface/environment/Environment.interface'

export const config: InitConfig = {
  SERVER_PORT: 4000,
  DATABASE: {
    DATABASE_NAME: 'sistema-restaurante',
    USERNAME: 'root',
    PASSWORD: 'root',
    HOST: 'localhost',
    PORT: 3306,
    DIALECT: 'mysql',
    ALTER_TABLE: true,
    DROP_DATABASE: false
  },
  JWT_SECRET: 'development',
  TYPESCRIPT: __filename.slice(-3) === '.ts'
}
