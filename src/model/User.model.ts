import db from '../config/database'
import { genSaltSync, hashSync, compareSync } from 'bcryptjs'
import Sequelize = require('sequelize')
export type Role = 'ADMIN' | 'USER'
const Roles: Role[] = ['ADMIN', 'USER']

class User extends Sequelize.Model {
  public id!: string
  public password!: string
  public role!: Role

  public static associations: {
  }

  public passwordMatch (encodedPassword: string, password: string): boolean {
    return compareSync(password, encodedPassword)
  }

  public hasRole (role: string | Role): boolean {
    return this.role === role
  }
}

User.init({
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV1
  },
  role: {
    values: Roles,
    type: Sequelize.ENUM,
    allowNull: false,
    defaultValue: 'USER'
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    unique: 'emailUnique',
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
  hooks: {

    beforeCreate (user): void {
      const salt = genSaltSync()
      const passwordEncrypted = hashSync(user.password, salt)
      user.password = passwordEncrypted
    },

    beforeUpdate (user): void {
      if (user.changed('password')) {
        const salt = genSaltSync()
        const newPass = hashSync(user.password, salt)
        user.password = newPass
      }
    }
  },
  paranoid: true,
  sequelize: db
})

// Relations

export default User
