import {
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'

const tokenAndOrderTypeQL = new GraphQLObjectType({
  name: 'tokenAndOrder',
  fields: {
    token: {type: GraphQLString},
    order: {type: GraphQLInt}
  }
})

const Level2ScrapSearchRes = new GraphQLObjectType({
  name: 'level2ScrapSearchRes',
  fields: {
    tokenAndOrder: {type: new GraphQLList(tokenAndOrderTypeQL)}
  }
})

export const Level2ScrapSearchOutputType = new GraphQLObjectType({
  name: 'level2ScrapTypeQl',
  fields: {
    res: {type: Level2ScrapSearchRes},
    statusCode: {type: GraphQLString}
  }
})
