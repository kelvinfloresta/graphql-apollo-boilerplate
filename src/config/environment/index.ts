import { importSafeEslint } from '../../utils/Import.utils'
import { InitConfig } from 'interfaces/environment/Environment.interface'

const ENV_NAME = process.env.NODE_ENV || 'development'
const fileName = 'config.' + ENV_NAME
const { config: Environment } = importSafeEslint(__dirname, fileName)

export default Environment as InitConfig
