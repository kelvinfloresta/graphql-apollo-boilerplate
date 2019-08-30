import { Sequelize, Dialect } from 'sequelize'
import { isProduction } from '../../utils'

const {
  DATABASE_NAME,
  USERNAME,
  PASSWORD,
  PORT: port,
  HOST: host,
  DIALECT: dialect
} = {
  // TODO: Move Environment
  DATABASE_NAME: '',
  USERNAME: 'root',
  PASSWORD: 'root',
  PORT: 3306,
  HOST: 'localhost',
  DIALECT: 'mysql' as Dialect
}

const sequelize = new Sequelize(DATABASE_NAME, USERNAME, PASSWORD, {
  port,
  host,
  dialect,
  logging: isProduction() ? false : console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})

export default sequelize
