import * as PythonShell from 'python-shell'
import { EnvironmentVariables, ProcessVariables } from './Config'
import { Level1ScrapDb } from './db_models/level1_scrap/Level1ScrapSchema'
import { Level2ScrapDb } from './db_models/level2_scrap/Level2ScrapSchema'
import { Logger } from './utils/Logger'
import { CommonValidator } from './utils/RegexValidator'

export class Tokenizer {
  private scrapperWatchDog: NodeJS.Timer = null
  private isBusy = false
  public constructor() {
    this.scrapperWatchDog = setInterval(
      this.searchForUnCheckedScraps,
      ProcessVariables.tokenizerInterval
    )
    this.searchForUnCheckedScraps()
  }
  public stop = () => {
    if (this.scrapperWatchDog != null) {
      clearInterval(this.scrapperWatchDog)
      this.scrapperWatchDog = null
    }
  }
  private async searchForUnCheckedScraps() {
    if (this.isBusy) {
      Logger.log('Tokenizer:Last process is busy or crashed', __filename)
      return
    }
    this.isBusy = true
    const process = async () => {
      const findUnCheckedSchemasResult = await Level1ScrapDb.findUnCheckedSchemas()
      if (findUnCheckedSchemasResult.err) {
        Logger.error(findUnCheckedSchemasResult.err)
        return
      }
      if (CommonValidator.isEmptyArray(findUnCheckedSchemasResult.res)) {
        Logger.log('Tokenizer:No new unchecked schema detected', __filename)
        return
      }
      const scraps = findUnCheckedSchemasResult.res
      for (const scrap of scraps) {
        const tokenizeResult = await this.tokenize(scrap.body)
        if (tokenizeResult.err) {
          Logger.error('Tokenizer:Error in tokenize method:' + JSON.stringify(tokenizeResult.err))
        } else {
          Logger.log(JSON.stringify(tokenizeResult))
          if (CommonValidator.isEmptyArray(tokenizeResult.res) === false) {
            const createLevel2SchemaResult = await Level2ScrapDb.createNewLevel2Schema(
              scrap.url,
              tokenizeResult.res,
              scrap.title,
              scrap.body
            )
            if (createLevel2SchemaResult.err) {
              Logger.error(createLevel2SchemaResult.err)
            }
          }
          const updateLevel1ScrapSchemaResult = await Level1ScrapDb.findByIdAndUpdateAsync(scrap._id, {
            checked: true
          })
          if (updateLevel1ScrapSchemaResult.err) {
            Logger.error(updateLevel1ScrapSchemaResult.err)
          }
        }
      }
    }
    await process()
    this.isBusy = false
  }
  private tokenize(value: string): Promise<{
    err?: any,
    res?: string[]
  }> {
    return new Promise((resolve) => {
      const options = {
        args: [value],
        mode: 'text',
        scriptPath: EnvironmentVariables.pythonScriptAddress,
        pythonOptions: ['-u'],
        // tslint:disable-next-line:max-line-length
        pythonPath: '/usr/local/Cellar/python/3.6.5_1/Frameworks/Python.framework/Versions/3.6/Resources/Python.app/Contents/MacOS/Python'
      }
      PythonShell.run(EnvironmentVariables.pythonScriptName, options, async (pythonErr, pythonRes) => {
        if (pythonErr) {
          resolve({err: pythonErr})
          return
        }
        resolve({res: JSON.parse(pythonRes)})
      })
    })
  }
}
