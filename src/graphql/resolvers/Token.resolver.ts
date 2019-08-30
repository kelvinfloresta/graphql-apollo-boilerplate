import * as jwt from 'jsonwebtoken'
import UserService from '../../services/User.service'
import environment from '../../config/environment'
const { JWT_SECRET } = environment

export const resolver = {
  Mutation: {
    createToken: async (parent, { email, password }) => {
      const user = await UserService.login({ email, password })
      const payload = { id: user.id }

      return {
        token: jwt.sign(payload, JWT_SECRET)
      }
    }
  }
}
