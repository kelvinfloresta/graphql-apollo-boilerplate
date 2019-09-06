import { Role } from './models/UserModel.interface'

export default interface AuthUser {
  id: string
  role: Role | string
}
