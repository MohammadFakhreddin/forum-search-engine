import { ProcessVariables } from './Config'
import { Level1ScrapDb } from './db_models/level1_scrap/Level1ScrapSchema'
import { Level2ScrapDb } from './db_models/level2_scrap/Level2ScrapSchema'
import { Logger } from './utils/Logger'
import { PythonMethods } from './utils/PythonMethods'
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
      let checkedDocumentsCount = 0
      for (const scrap of scraps) {
        checkedDocumentsCount++
        if (checkedDocumentsCount > ProcessVariables.tokenizerMaximumDocCount) {
          break
        }
        const tokenizeResult = await PythonMethods.tokenize(scrap.body)
        if (tokenizeResult.err) {
          Logger.error('Tokenizer:Error in tokenize method:' + JSON.stringify(tokenizeResult.err))
        } else {
          if (CommonValidator.isEmptyArray(tokenizeResult.res) === false) {
            const createLevel2SchemaResult = await Level2ScrapDb.createNewLevel2Schema(
              scrap.url,
              tokenizeResult.res,
              scrap.previewTitle,
              scrap.previewBody
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
    Logger.log('Tokenizer:Successfully finished,Waiting for start of interval')
    this.isBusy = false
  }
}
