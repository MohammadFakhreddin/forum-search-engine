import Os from 'os'
import Path from 'path'

const dbName = 'iran_forums'

export const Time = {
  oneMinute : 60 * 1000,
  oneHour : 60 * 60 * 1000,
  oneDay : 60 * 60 * 1000 * 24
}

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
  prodMongoUrl: `mongodb://mfsecure3:NdPa6rqgHhyj7j9k3azak@127.0.0.1:27017/${dbName}?connectTimeoutMS=10000`,
  pythonScriptAddress: Path.join(__dirname, '../python'),
  pythonScriptName: 'MTokenizer.py'
}

export const NetworkVariables = {
  timeout: 4000
}

export const ProcessVariables = {
  tokenizerInterval: Time.oneHour,
  crawlerInterval: Time.oneHour * 4,
  droneInterval: Time.oneDay / 4,
  rootUrlsReCrawlTime: Time.oneDay,
  tokenizerMaximumDocCount: 0,
  droneMaximumDocCount: 0,
  crawlerMaximumDocCount: 0
}

export const SecurityVariables = {
  bcryptRounds: 10,
  sessionSecret: '',
  tokenLifeTime: 60 * 60 * 24, // Means one day,,
  tokenHeader: 'messenger-app', // TODO change it,
  otpCodeLifeTime: 60 * 10 * 1000,
  otpCodeMinimumResendTime: 60 * 5 * 1000,
  validOrigin: '*'
}

export const LocalEvents = {
  roleIsReady : 'role-ready'
}

export const RootUrls = [
  'http://porsak.ir/',
  'https://www.applyabroad.org/forum/',
  'https://javabyab.com/',
  'https://www.tebyan.net/',
  'https://www.ninisite.com/'
]

export const ValidHosts = [
  ...RootUrls,
  'https://article.tebyan.net/'
]

export const PythonExecuterAddress = (
  EnvironmentVariables.isMac === true
  // tslint:disable-next-line:max-line-length
  ? '/usr/local/Cellar/python/3.6.5_1/Frameworks/Python.framework/Versions/3.6/Resources/Python.app/Contents/MacOS/Python'
  : EnvironmentVariables.isWindows === true
  ? null
  : '/usr/bin/python3'
)
