import {
  Mockgoose
} from 'mockgoose'
import Mongoose from 'mongoose'
import { EnvironmentVariables } from '../Config'
import { Logger } from './Logger'

const mockgoose = new Mockgoose(Mongoose)

export class MongodbConnectionHandler {
  public static connect = (callback: (db) => void) => {
    if (MongodbConnectionHandler.db != null) {
      callback(MongodbConnectionHandler.db)
      return
    }
    const connectMongoose = () => {
      Mongoose.connect((EnvironmentVariables.isDev)
        ? EnvironmentVariables.devMongoUrl
        : EnvironmentVariables.prodMongoUrl)
      MongodbConnectionHandler.db = Mongoose.connection
      MongodbConnectionHandler.db.on('error',  () => {
        Logger.error('Mongodb connection error', __filename)
        callback(null)
      })
      MongodbConnectionHandler.db.once('open', () => {
        Logger.log('Connection to mongodb is successful', __filename)
        callback(MongodbConnectionHandler.db)
      })
    }
    if (EnvironmentVariables.isTest) {
      mockgoose.prepareStorage().then(() => {
        connectMongoose()
      })
    } else {
      connectMongoose()
    }
  }
  private static db = null
}
