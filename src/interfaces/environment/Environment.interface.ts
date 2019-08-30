export interface InitConfig {
  SERVER_PORT: number
  DEV_MODE?: boolean
  DROP_DATABASE?: boolean
  ALTER_TABLE?: boolean
  JWT_SECRET: string
  TYPESCRIPT: boolean
}
