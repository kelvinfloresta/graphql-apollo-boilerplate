import { InitConfig } from 'interfaces/environment/Environment.interface'

export const config: InitConfig = {
  SERVER_PORT: 4000,
  DROP_DATABASE: false,
  ALTER_TABLE: true,
  JWT_SECRET: 'teste',
  TYPESCRIPT: __filename.slice(-3) === '.ts'
}
