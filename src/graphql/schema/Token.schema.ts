import { gql } from 'apollo-server'

const TokenSchema = gql`
  """Token fo application"""
  type Token {
    token: String!
  }

  extend type Mutation {
    """Generate token for authentication"""
    createToken(email: String!, password: String!): Token
  }
`

export default TokenSchema
