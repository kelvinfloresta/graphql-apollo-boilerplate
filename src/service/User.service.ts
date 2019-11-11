import UserModel from '../model/User.model'
import * as jwt from 'jsonwebtoken'
import AuthUser from 'interface/AuthUser.interface'
import environment from '../config/environment'
import { NotAuthorized } from '../utils/Error.utils'

const { JWT_SECRET } = environment

const UserService = {
  async login ({ email, password }: { email: string, password: string}) {
    const user = await UserModel.findOne({
      where: { email },
      attributes: ['id', 'password']
    })

    if (!user) {
      throw new NotAuthorized('Wrong email or password')
    }

    const passwordEncrypted = user.get('password')
    if (!user.passwordMatch(passwordEncrypted, password)) {
      throw new NotAuthorized('Wrong email or password')
    }

    return user
  },
  async findById (id: string) {
    return UserModel.findByPk(id)
  },
  async findByToken (token: string): Promise<AuthUser | undefined> {
    if (!token) return

    const decoded = jwt.verify(token, JWT_SECRET)
    const id = decoded['id']
    const user = await UserService.findById(id)
    if (!user) return

    const authUser: AuthUser = {
      id: user.id,
      role: user.role
    }
    return authUser
  }
}

export default UserService
