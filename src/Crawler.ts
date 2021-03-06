import CrawlHandler from 'crawler'
import { ProcessVariables } from './Config'
import { Level0ScrapDb } from './db_models/level0_scrap/Level0ScrapSchema'
import { Level1ScrapDb } from './db_models/level1_scrap/Level1ScrapSchema'
import { Logger } from './utils/Logger'
import { CommonValidator } from './utils/RegexValidator'

export class Crawler {
  private isBusy = false
  private crawlerWatchDog: NodeJS.Timer = null
  private crawlHandler = null
  private onCrawlCompleteCallback: () => void = null
  public constructor() {
    this.crawlHandler = new CrawlHandler({
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json; charset=utf-8'
      },
      jQuery: true,
      jar: true,
      timeout: 4000,
      callback: this.onCrawlResIsReady
    })
    this.crawlHandler.on('drain', this.onDrainEvent)
    this.crawlerWatchDog = setInterval(
      this.crawlNewlyAddedUrls,
      ProcessVariables.crawlerInterval
    )
    this.crawlNewlyAddedUrls()
  }
  public stop = () => {
    if (this.crawlerWatchDog != null) {
      clearInterval(this.crawlerWatchDog)
      this.crawlerWatchDog = null
    }
  }
  public crawlNewlyAddedUrls = async () => {
    if (this.isBusy) {
      Logger.error('Last crawler is still busy aborting interval', __filename)
      return
    }
    this.isBusy = true
    const crawlProcess = async () => {
      const findUnCheckedSchemasResult = await Level0ScrapDb.findUnCheckedForLevel1Schemas()
      if (findUnCheckedSchemasResult.err) {
        Logger.error('Crawler:Error in finding unchecked urls\n'
            + JSON.stringify(findUnCheckedSchemasResult), __filename)
        return
      }
      if (CommonValidator.isEmptyArray(findUnCheckedSchemasResult.res) === true) {
        Logger.log('Crawler:No unchecked schema found', __filename)
        return
      }
      let crawledDocsCount = 0
      for (const level0Scrap of findUnCheckedSchemasResult.res) {
        crawledDocsCount++
        if (crawledDocsCount > ProcessVariables.crawlerMaximumDocCount) {
          break
        }
        await this.crawlForUrls(level0Scrap.url)
        const updateLevel0ScrapResult = await Level0ScrapDb.findByIdAndUpdateAsync(level0Scrap._id, {
          checkedForLevel1: true
        })
        if (updateLevel0ScrapResult.err) {
          Logger.error('Crawler:update level0Scrap\n' + JSON.stringify(updateLevel0ScrapResult.err), __filename)
        }
      }
    }
    await crawlProcess()
    Logger.log('Crawler:Crawl of newly added urls finished,Waiting for next interval')
    this.isBusy = false
  }
  private crawlForUrls(url: string) {
    return new Promise((resolve) => {
      this.onCrawlCompleteCallback = resolve
      this.crawlHandler.queue({
        uri: url
      })
    })
  }
  private onDrainEvent = (): void => {
    if (typeof this.onCrawlCompleteCallback === 'function') {
      this.onCrawlCompleteCallback()
    }
  }
  private onCrawlResIsReady = async (error, res, done) => {
    if (error) {
      Logger.error('Crawler:Crawl failed for url ' + res.options.uri + '\n' + JSON.stringify(error))
      done()
      return
    }
    const url: string = res.options.uri
    if (typeof res.$ !== 'function') {
      done()
      return
    }
    const pageTexts = res.$('body').text()
    const previewTitle = res.$('head > title').text()
    const previewBody = res.$('meta[name=description]').attr('content')
    // TODO Have to do something about title
    const findOneAndUpdateAsyncResult = await Level1ScrapDb.createNewLevel1ScrapSchema(
      previewTitle,
      pageTexts + '\n' + previewTitle + '\n' + previewBody,
      url,
      previewTitle,
      previewBody
    )
    if (findOneAndUpdateAsyncResult.err) {
      Logger.error('Crawler:Adding new level1SchemaFailed\n' + JSON.stringify(findOneAndUpdateAsyncResult.err))
    }
    done()
  }
}
