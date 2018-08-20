import {EnvironmentVariables} from '../Config'
EnvironmentVariables.isTest = true
EnvironmentVariables.isDev = true
import {MongodbConnectionHandler} from '../utils/MongodbConnectionHandler'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

describe('Testing login register process', () => {
  beforeAll((done) => {
    MongodbConnectionHandler.connect((db) => {
      done()
    })
  }, 60000 * 60)
  // const agent = SuperTest(App)
  // tslint:disable-next-line:no-empty
  it('Testing something', (done) => {})
})
