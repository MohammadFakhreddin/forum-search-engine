import { Router } from 'express'
import GraphQLHTTP from 'express-graphql'
import {
  GraphQLObjectType,
  GraphQLSchema
} from 'graphql'
import { EnvironmentVariables } from '../Config'
import { ErrorHandler } from './ErrorHandler'

const rootQuery = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
  })
})

const rootMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
  })
})

const noAuthSchema = new GraphQLSchema({
  query: rootQuery,
  mutation: rootMutation
})

const router = Router()

router.use('/', GraphQLHTTP({
  schema: noAuthSchema,
  graphiql: EnvironmentVariables.isDev,
  formatError: ErrorHandler.formatError
}))

export const NoAuthRoute = router
