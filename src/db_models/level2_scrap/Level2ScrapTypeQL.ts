import {
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'

const tokenAndOrderTypeQL = new GraphQLObjectType({
  name: 'tokenAndOrderTypeQL',
  fields: {
    token: {type: GraphQLString},
    order: {type: GraphQLInt}
  }
})

const Level2ScrapScrapTypeQL = new GraphQLObjectType({
  name: 'Level2ScrapScrapTypeQL',
  fields: {
    tokenAndOrder: {type: new GraphQLList(tokenAndOrderTypeQL)},
    url: {type: GraphQLString},
    previewTitle: {type: GraphQLString},
    previewBody: {type: GraphQLString}
  }
})

export const Level2ScrapSearchOutputType = new GraphQLObjectType({
  name: 'Level2ScrapSearchOutputType',
  fields: {
    res: {type: new GraphQLList(Level2ScrapScrapTypeQL)},
    statusCode: {type: GraphQLString}
  }
})
