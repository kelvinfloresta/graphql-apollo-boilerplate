import { Role } from 'model/User.model'

export default interface AuthUser {
  id: string
  role: Role | string
}
