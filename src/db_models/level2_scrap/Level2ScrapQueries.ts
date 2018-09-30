import { GraphQLString } from 'graphql'
import { PythonMethods } from '../../utils/PythonMethods'
import { CommonValidator } from '../../utils/RegexValidator'
import { StatusCodes } from '../../utils/StatusCodes'
import * as Types from '../../utils/Types'
import { Logger } from './../../utils/Logger'
import { Level2ScrapDb } from './Level2ScrapSchema'
import { Level2ScrapSearchOutputType } from './Level2ScrapTypeQL'

export class Level2ScrapQueries {
  public static search = {
    type: Level2ScrapSearchOutputType,
    args: {text: {type: GraphQLString}},
    resolve: (root, {text}: {text: string}) => {
      return new Promise(async (resolve: Types.OnGraphQlPromiseFulfilled, reject: Types.OnPromiseRejected) => {
        if (CommonValidator.isNullOrEmpty(text)) {
          resolve({
            statusCode: StatusCodes.search_is_empty
          })
          return
        }
        const tokenizeResult = await PythonMethods.tokenize(text)
        if (tokenizeResult.err) {
          Logger.error(tokenizeResult.err)
          reject(tokenizeResult.err)
          return
        }
        if (CommonValidator.isEmptyArray(tokenizeResult.res)) {// If it has no token it's unnecessary to search
          resolve({
            statusCode: StatusCodes.ok,
            res: []
          })
          return
        }
        const searchResult = await Level2ScrapDb.findIScrapsByToken(tokenizeResult.res)
        if (searchResult.err) {
          Logger.error(searchResult.err)
          reject(searchResult.err)
          return
        }
        resolve({
          statusCode: StatusCodes.ok,
          res: searchResult.res
        })
      })
    }
  }
}
