import Os from 'os'
import Path from 'path'

const dbName = 'iran_forums'

export const EnvironmentVariables  = {
  port:  '8082',
  isDev:  true,
  isTest:  false,
  logFolder: Path.join(__dirname, '../log'),
  exceptionAddress: Path.join(__dirname, '../log/exceptions.log'),
  logAddress: Path.join(__dirname, '../log/logs.log'),
  isWindows: /^win/.test(Os.platform()),
  devMongoUrl: `mongodb://127.0.0.1:27018/${dbName}?connectTimeoutMS=10000`,
  prodMongoUrl: `mongodb://127.0.0.1:27018/${dbName}?connectTimeoutMS=10000`,
  pythonScriptAddress: Path.join(__dirname, './python/Normalizer.py')
}

export const NetworkVariables = {
  timeout: 4000
}

export const ProcessVariables = {
  tokenizerInterval: 60 * 4 * 1000, // Every 4 hour
  droneInterval: 60 * 6 * 1000, // Every 6 hour
  crawlerInterval: 60 * 5 * 1000, // Every 5 hour,
  rootUrlsReCrawlTime: 60 * 24 * 2 * 1000 // Every 2 day
}

export const SecurityVariables = {
  bcryptRounds: 10,
  sessionSecret: '',
  tokenLifeTime: 60 * 60 * 24, // Means one day,,
  tokenHeader: 'messenger-app', // TODO change it,
  otpCodeLifeTime: 60 * 10 * 1000,
  otpCodeMinimumResendTime: 60 * 5 * 1000
}

export const LocalEvents = {
  roleIsReady : 'role-ready'
}

export const RootUrls = [
  'https://www.ninisite.com/',
  'http://porsak.ir/'
]
