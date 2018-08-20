import {EnvironmentVariables} from '../Config'
import {StatusCodes} from '../utils/StatusCodes'

export class ErrorHandler {
  public static formatError = (error) => {
    return {
      message: (EnvironmentVariables.isDev) ? error.message : null,
      statusCode: StatusCodes.internal,
      locations: (EnvironmentVariables.isDev) ? error.locations : null,
      path: (EnvironmentVariables.isDev) ? error.path : null
    }
  }
}
