import { GraphQLString } from 'graphql'
import * as PythonShell from 'python-shell'
import { EnvironmentVariables } from '../../Config'
import { CommonValidator } from '../../utils/RegexValidator'
import { StatusCodes } from '../../utils/StatusCodes'
import * as Types from '../../utils/Types'
import { Level2ScrapDb } from './Level2ScrapSchema'
import { Level2ScrapSearchOutputType } from './Level2ScrapTypeQL'

export class Level2ScrapQueries {
  public static search = {
    type: Level2ScrapSearchOutputType,
    args: {text: {type: GraphQLString}},
    resolve: (root, {text}: {text: string}) => {
      return new Promise((resolve: Types.OnGraphQlPromiseFulfilled, reject: Types.OnPromiseRejected) => {
        if (CommonValidator.isNullOrEmpty(text)) {
          resolve({
            statusCode: StatusCodes.search_is_empty
          })
          return
        }
        const options = {
          args: text,
          mode: 'json',
          scriptPath: EnvironmentVariables.pythonScriptAddress
        }
        PythonShell.run(EnvironmentVariables.pythonScriptName, options, async (pythonErr, pythonRes) => {
          if (pythonErr) {
            reject(pythonErr)
            return
          }
          const tokens: string[] = pythonRes
          const searchResult = await Level2ScrapDb.findIScrapsByToken(tokens)// TODO It must apply weight
          if (searchResult.err) {
            reject(searchResult.err)
            return
          }
          resolve({
            statusCode: StatusCodes.ok,
            res: tokens
          })
        })
      })
    }
  }
}
