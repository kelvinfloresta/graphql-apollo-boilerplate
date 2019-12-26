import { importSafeEslint } from '../../utils/Import.utils'
import { InitConfig } from 'interface/environment/Environment.interface'

const ENV_NAME = process.env.NODE_ENV || 'development'
const fileName = 'config.' + ENV_NAME
const { config: Environment } = importSafeEslint(__dirname, fileName)

export function isProduction (): boolean {
  return process.env.NODE_ENV === 'production'
}

export default Environment as InitConfig
