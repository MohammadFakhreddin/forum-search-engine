import { GraphQLInt, GraphQLNonNull, GraphQLString } from 'graphql'
import { ILevel2Scrap } from '../../models/ILevel2Scrap'
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
    args: {
      text: {type: new GraphQLNonNull(GraphQLString)},
      pageNumber: {type: new GraphQLNonNull(GraphQLInt)},
      pageSize: {type: new GraphQLNonNull(GraphQLInt)}
    },
    resolve: (root, {text, pageNumber, pageSize}: {text: string, pageNumber: number, pageSize: number}) => {
      return new Promise(async (resolve, reject: Types.OnPromiseRejected) => {
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
        const pendingExecution = Level2ScrapDb
          .aggregate([
            {$match: {'tokenAndOrder.token': {$in: tokenizeResult.res}}},
            {
              $project: {
                url: 1,
                previewTitle: 1,
                previewBody: 1,
                tokenAndOrder: 1,
                order: {
                  $size: {
                    $setIntersection: [
                      tokenizeResult.res,
                      '$tokenAndOrder.token'
                    ]
                  }
                }
              }
            },
            {
              $sort: { order: 1 }// It was -1 before
            }
          ])
          .skip((pageNumber - 1) * pageSize)
          .limit(pageSize)
        pendingExecution.exec((searchErr, searchRes: ILevel2Scrap[]) => {
          if (searchErr) {
            Logger.error(searchErr)
            reject(searchErr)
            return
          }
          resolve({
            statusCode: StatusCodes.ok,
            res: searchRes
          })
        })
      })
    }
  }
}
