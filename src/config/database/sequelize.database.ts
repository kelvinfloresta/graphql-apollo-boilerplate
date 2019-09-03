import { Sequelize } from 'sequelize'
import { isProduction } from '../../utils'
import environment from '../../config/environment'

const {
  DATABASE: {
    DATABASE_NAME,
    USERNAME,
    PASSWORD,
    PORT: port,
    HOST: host,
    DIALECT: dialect
  }
} = environment

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
