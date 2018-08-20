import Colors from 'colors'
import Fs from 'fs'
import {EnvironmentVariables} from '../Config'

if (!Fs.existsSync(EnvironmentVariables.logFolder)) {
  Fs.mkdirSync(EnvironmentVariables.logFolder)
}

export class Logger {
  public static removeLogs(): void {
    if (Fs.existsSync(EnvironmentVariables.logAddress)) {
      Fs.unlinkSync(EnvironmentVariables.logAddress)
    }
  }
  public static show(message: string= '', filename: string = ''): void {
    // tslint:disable-next-line:no-console
    console.log(Colors.green(Logger.formatMessage([message, filename])))
  }
  public static log(message: string= '', filename: string = ''): void {
    const value = Logger.formatMessage([message, filename])
    // tslint:disable-next-line:no-console
    console.log(Colors.white(value))
    if (!EnvironmentVariables.isDev || EnvironmentVariables.isTest) {
      if (Fs.existsSync(EnvironmentVariables.logAddress)) {
        Fs.appendFile(EnvironmentVariables.logAddress, value
          .concat('\n'), 'utf8', (err: NodeJS.ErrnoException) => {
            if (err) {
              // tslint:disable-next-line:no-console
              console.error(err)
            }
          })
      } else {
        Fs.writeFile(EnvironmentVariables.logAddress, value
          .concat('\n'), 'utf8', (err: NodeJS.ErrnoException) => {
            if (err) {
              // tslint:disable-next-line:no-console
              console.error(err)
            }}
          )
      }
    }
  }
  public static error(errorText: string= '', filename: string = ''): void {
    const value = Logger.formatMessage([errorText, filename])
    // tslint:disable-next-line:no-console
    console.log(Colors.red(value))
    if (!EnvironmentVariables.isDev || EnvironmentVariables.isTest) {
      if (Fs.existsSync(EnvironmentVariables.exceptionAddress)) {
        Fs.appendFileSync(EnvironmentVariables.exceptionAddress, value, 'utf8')
      } else {
        Fs.writeFileSync(EnvironmentVariables.exceptionAddress, value, 'utf8')
      }
    }
  }
  public static handleError(errorEvent: Error, filename: string = ''): void {
    const message = Logger.formatMessage([errorEvent.name, errorEvent.message, errorEvent.stack || '', filename])
    // tslint:disable-next-line:no-console
    console.error(Colors.red(message))
    if (!EnvironmentVariables.isDev || EnvironmentVariables.isTest) {
      if (Fs.existsSync(EnvironmentVariables.exceptionAddress)) {
        Fs.appendFileSync(EnvironmentVariables.exceptionAddress, message, 'utf8')
      } else {
        Fs.writeFileSync(EnvironmentVariables.exceptionAddress, message, 'utf8')
      }
    }
  }
  private static formatMessage(messageList: string[]= []): string {
    let result = ''
    for (const message of messageList) {
      result += message + '\n'
    }
    return result + '\n------------------------------------------\n'
  }
}
