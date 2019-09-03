import { gql } from 'apollo-server'

const UserSchema = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: String!
    updatedAt: String!
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
  }

  extend type Query {
    Users: [ User! ]!
    User(id: ID!): User
  }

  extend type Mutation {
    SaveUser(input: UserInput!): User
    UpdateUser(id: ID!, input: UserInput!): User
    DeleteUser(id: ID!): Boolean
  }
`

export default UserSchema
