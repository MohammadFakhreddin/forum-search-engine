import Os from 'os'
import Path from 'path'

const dbName = 'iran_forums'

const oneMinute = 60 * 1000
const oneHour = 60 * 60 * 1000
const oneDay = oneHour * 24

export const EnvironmentVariables  = {
  port:  '8082',
  isDev:  true,
  isTest:  false,
  logFolder: Path.join(__dirname, '../log'),
  exceptionAddress: Path.join(__dirname, '../log/exceptions.log'),
  logAddress: Path.join(__dirname, '../log/logs.log'),
  isWindows: /^win/.test(Os.platform()),
  isMac: /^darwin/.test(Os.platform()),
  devMongoUrl: `mongodb://127.0.0.1:27018/${dbName}?connectTimeoutMS=10000`,
  prodMongoUrl: `mongodb://127.0.0.1:27018/${dbName}?connectTimeoutMS=10000`,
  pythonScriptAddress: Path.join(__dirname, '../python'),
  pythonScriptName: 'MTokenizer.py'
}

export const NetworkVariables = {
  timeout: 4000
}

export const ProcessVariables = {
  tokenizerInterval: oneMinute * 1, // oneHour * 2,
  droneInterval: oneMinute * 2, // oneHour * 4,
  crawlerInterval: oneMinute * 4, // oneHour * 8,
  rootUrlsReCrawlTime: oneDay * 2
}

export const SecurityVariables = {
  bcryptRounds: 10,
  sessionSecret: '',
  tokenLifeTime: 60 * 60 * 24, // Means one day,,
  tokenHeader: 'messenger-app', // TODO change it,
  otpCodeLifeTime: 60 * 10 * 1000,
  otpCodeMinimumResendTime: 60 * 5 * 1000,
  validOrigin: 'http://localhost:3000'
}

export const LocalEvents = {
  roleIsReady : 'role-ready'
}

export const RootUrls = [
  'https://www.ninisite.com/',
  'http://porsak.ir/'
]

export const PythonExecuterAddress = (
  EnvironmentVariables.isMac === true
  // tslint:disable-next-line:max-line-length
  ? '/usr/local/Cellar/python/3.6.5_1/Frameworks/Python.framework/Versions/3.6/Resources/Python.app/Contents/MacOS/Python'
  : null
)
