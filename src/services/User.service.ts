import UserModel from '../model/User.model'
import * as jwt from 'jsonwebtoken'
import AuthUser from 'interfaces/AuthUser.interface'

// TODO: Move Environment
const JWT_SECRET = 'teste'

const UserService = {
  async login ({ email, password }) {
    const user = await UserModel.findOne({
      where: { email },
      attributes: ['id', 'password']
    })

    if (!user) {
      throw new Error('Wrong email or password')
    }

    const passwordEncrypted = user.get('password')
    if (!user.passwordMatch(passwordEncrypted, password)) {
      throw new Error('Wrong email or password')
    }

    return user
  },
  async findById (id: string) {
    return UserModel.findByPk(id)
  },
  async findByToken (token: string): Promise<AuthUser> {
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
