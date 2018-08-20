/**
 * Created by M.Fakhreddin
 */
import JWT from 'jsonwebtoken'
import {
  EnvironmentVariables,
  SecurityVariables
} from '../Config'
import { Logger } from './Logger'
import { StatusCodes } from './StatusCodes'
import {
  IErrResPromise,
  ITokenData,
  ITokenObj,
  OnErrResPromiseFulfilled
} from './Types'

const createExpireTime =  (accessType: AccessTypes) => {// TODO Access type must have impact on token life time
  return Math.floor(Date.now() / 1000) + SecurityVariables.tokenLifeTime
}

export enum AccessTypes {
  user,
  unVerifiedUser
}

export class JwtHandler {
  public static sign(data: ITokenData, accessType: AccessTypes, callback: (err, token) => void) {
    return JWT.sign({
      exp: createExpireTime(accessType),
      data,
      accessType
    }, SecurityVariables.sessionSecret, callback)
  }
  public static verify(token: string): Promise<IErrResPromise> {
    return new Promise((resolve: OnErrResPromiseFulfilled) => {
      JWT.verify(token, SecurityVariables.sessionSecret, (err, res) => resolve({err, res}))
    })
  }
}

const accessTokenMiddleWare = (req, res, next, accessType) => {
  const token = req.headers[SecurityVariables.tokenHeader]
  const sendUnauthorizedError = (err?: NodeJS.ErrnoException) => {
    res.status(StatusCodes.unauthorized)
      .json((EnvironmentVariables.isDev)
      ? {err: err || 'Invalid access type'} : null)
  }
  if (token == null) {
    res.status(StatusCodes.unauthorized).json()
    return
  }
  JwtHandler.verify(token).then((verifyResult) => {
    const tokenObj = verifyResult.res as ITokenObj
    if (verifyResult.err) {
      sendUnauthorizedError(verifyResult.err)
    } else {
      if (tokenObj !== null && tokenObj.accessType === accessType) {
        switch (tokenObj.accessType) {
          case AccessTypes.unVerifiedUser:
          case AccessTypes.user:
            req.tokenData = tokenObj.data
            next()
            break
          default:
            Logger.error(__filename, 'Unknown access type detected')
            sendUnauthorizedError()
        }
      } else {
        sendUnauthorizedError()
      }
    }
  })
}

export const accessTokenUserMiddleware = (req, res, next) => {
  accessTokenMiddleWare(req, res, next, AccessTypes.user)
}

export const accessTokenUnVerifiedUserMiddleware = (req, res, next) => {
  accessTokenMiddleWare(req, res, next, AccessTypes.unVerifiedUser)
}
