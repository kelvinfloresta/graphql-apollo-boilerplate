import { gql } from 'apollo-server'

const TokenSchema = gql`

  """Token Schema of application"""
  type Token {
    """Token of application"""
    token: String!
  }

  extend type Mutation {
    """Generate token for authentication"""
    createToken(email: String!, password: String!): Token
  }
`

export default TokenSchema
