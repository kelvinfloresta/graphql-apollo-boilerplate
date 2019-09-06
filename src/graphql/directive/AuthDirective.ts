import { SchemaDirectiveVisitor } from 'graphql-tools'
import { defaultFieldResolver } from 'graphql'
import UserService from '../../service/User.service'
import { GraphqlContext } from 'interface/graphql/GraphqlContext.interface'
import { NotAuthorized } from 'utils/Error.utils'

export class AuthDirective extends SchemaDirectiveVisitor {
  public visitObject (type): void {
    this.ensureFieldsWrapped(type)
    type._requiredAuthRole = this.args.requires
  }

  // Visitor methods for nested types like fields and arguments
  // also receive a details object that provides information about
  // the parent and grandparent types.
  public visitFieldDefinition (field, details): void {
    this.ensureFieldsWrapped(details.objectType)
    field._requiredAuthRole = this.args.requires
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public ensureFieldsWrapped (objectType) {
    // Mark the GraphQLObjectType object to avoid re-wrapping:
    if (objectType._authFieldsWrapped) return
    objectType._authFieldsWrapped = true

    const fields = objectType.getFields()

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName]
      const { resolve = defaultFieldResolver } = field

      field.resolve = async function (...args) {
        // Get the required Role from the field first, falling back
        // to the objectType if no Role is required by the field:
        const requiredRole = field._requiredAuthRole || objectType._requiredAuthRole

        if (!requiredRole) {
          return resolve.apply(this, args)
        }

        const context: GraphqlContext = args[2]
        if (!context.authUser) {
          throw new NotAuthorized('not authorized')
        }

        const user = await UserService.findById(context.authUser.id)
        if (!user || !user.hasRole(requiredRole)) {
          throw new NotAuthorized('not authorized')
        }

        return resolve.apply(this, args)
      }
    })
  }
}
