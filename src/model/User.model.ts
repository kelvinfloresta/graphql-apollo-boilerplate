import { Model, UUIDV1, UUID, ENUM, STRING } from 'sequelize'
import { Role } from 'interfaces/models/UserModel.interface'
import sequelize from '../config/database/sequelize.database'
import { genSaltSync, hashSync, compareSync } from 'bcryptjs'

const RoleS: Role[] = ['ADMIN', 'USER']

class UserModel extends Model {
  public id!: string
  public password!: string
  public role!: Role

  public passwordMatch (encodedPassword: string, password: string): boolean {
    return compareSync(password, encodedPassword)
  }

  public hasRole (role: string | Role): boolean {
    return this.role === role
  }
}

UserModel.init({
  id: {
    primaryKey: true,
    type: UUID,
    defaultValue: UUIDV1
  },
  role: {
    values: RoleS,
    type: ENUM,
    allowNull: false,
    defaultValue: 'USER'
  },
  name: {
    type: STRING,
    allowNull: false
  },
  email: {
    type: STRING,
    unique: 'emailUnique',
    allowNull: false
  },
  password: {
    type: STRING,
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
  sequelize
})

export default UserModel
