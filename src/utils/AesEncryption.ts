import CryptoJS from 'crypto-js'
import {Logger} from './Logger'

let key = '6Le0DgMTl;dmwaANokdEEial'
let iv  = 'mHGFxENnZdwaldsaLyANoi.e'
key = CryptoJS.enc.Base64.parse(key)
iv = CryptoJS.enc.Base64.parse(iv)

export class AesEncryption {
  public static encrypt(rawValue: string): string {
    try {
      const encryptedValue = CryptoJS.AES.encrypt(
        rawValue,
        key,
        {
          iv
        }
      ).toString()
      return encryptedValue
    } catch (exception) {
      Logger.error(exception, __filename)
      return null
    }
  }
  public static decrypt(encryptedValue: string): string {
    try {
      const decryptedValue = CryptoJS.AES.decrypt(
        encryptedValue,
        key,
        {
          iv
        }
      ).toString(CryptoJS.enc.Utf8)
      return decryptedValue
    } catch (exception) {
      Logger.error(exception, __filename)
      return null
    }
  }
}
