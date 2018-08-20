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
  }
  public stop = () => {
    if (this.scrapperWatchDog != null) {
      clearInterval(this.scrapperWatchDog)
      this.scrapperWatchDog = null
    }
  }
  private afterSearch(): void {
    this.isBusy = false
  }
  private async searchForUnCheckedScraps() {
    if (this.isBusy) {
      Logger.log('Tokenizer last process is busy or crashed', __filename)
      return
    }
    this.isBusy = true
    const findUnCheckedSchemasResult = await Level1ScrapDb.findUnCheckedSchemas()
    if (findUnCheckedSchemasResult.err) {
      Logger.error(findUnCheckedSchemasResult.err)
      this.afterSearch()
      return
    }
    if (CommonValidator.isEmptyArray(findUnCheckedSchemasResult.res)) {
      Logger.log('No new unchecked schema detected', __filename)
      this.afterSearch()
      return
    }
    const scraps = findUnCheckedSchemasResult.res
    for (const scrap of scraps) {
      const tokenizeResult = await this.tokenize(scrap.title + ' ' + scrap.body)
      if (tokenizeResult.err) {
        Logger.error(tokenizeResult.err)
      } else {
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
  private tokenize(value: string): Promise<{
    err?: any,
    res?: string[]
  }> {
    return new Promise((resolve) => {
      const options = {
        args: value,
        mode: 'json'
      }
      PythonShell.run(EnvironmentVariables.pythonScriptAddress, options, async (pythonErr, pythonRes) => {
        if (pythonErr) {
          resolve({err: pythonErr})
          return
        }
        resolve({res: pythonRes})
      })
    })
  }
}
