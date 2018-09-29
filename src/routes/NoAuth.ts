import { Router } from 'express'
import GraphQLHTTP from 'express-graphql'
import {
  GraphQLObjectType,
  GraphQLSchema
} from 'graphql'
import { EnvironmentVariables } from '../Config'
import { Level2ScrapQueries } from '../db_models/level2_scrap/Level2ScrapQueries'
import { ErrorHandler } from './ErrorHandler'

const rootQuery = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    search: Level2ScrapQueries.search
  })
})

const rootMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    search: Level2ScrapQueries.search
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
