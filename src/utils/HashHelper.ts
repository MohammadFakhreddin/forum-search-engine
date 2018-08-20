import Bcrypt from 'bcryptjs'
import {SecurityVariables} from '../Config'
import {
  CommonValidator
} from './RegexValidator'
import * as Types from './Types'

export class HashHelper {
  public static hash(password: string): Promise<Types.IErrResPromise> {
    return new Promise((resolve: Types.OnErrResPromiseFulfilled) => {
      Bcrypt.hash(password, SecurityVariables.bcryptRounds, (err, res) => resolve({err, res}))
    })
  }
  public static compare(data: string, hashedValue: string): Promise<Types.IErrResPromise> {
    return new Promise((resolve: Types.OnErrResPromiseFulfilled) => {
      if (CommonValidator.isNullOrEmpty(data) === true &&
        CommonValidator.isNullOrEmpty(hashedValue) === false) {
        resolve({err: null, res: false})
        return
      }
      Bcrypt.compare(data, hashedValue, (err, res) => resolve({err, res}))
    })
  }
}
