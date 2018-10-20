import CrawlHandler from 'crawler'
import { ProcessVariables, RootUrls, ValidHosts } from './Config'
import { Level0ScrapDb } from './db_models/level0_scrap/Level0ScrapSchema'
import { RootUrlsDb } from './db_models/root_urls/RootUrls'
import { Logger } from './utils/Logger'
import { CommonValidator } from './utils/RegexValidator'

export class Drone {
  private isBusy = false
  private droneWatchDog: NodeJS.Timer = null
  private crawlHandler = null
  private onCrawlCompleteCallback: () => void = null
  public constructor() {
    this.searchForUrls = this.searchForUrls.bind(this)
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
    RootUrlsDb.findAsync({}).then(async ({err, res}) => {
      if (err) {
        Logger.error('Drone:Cannot start drone\n' + JSON.stringify(err), __filename)
        return
      }
      if (CommonValidator.isEmptyArray(res)) {
        Logger.log('Drone:First time initiating,Saving root urls to db')
        for (const rootUrl of RootUrls) {
          const createRootUrlResult = await RootUrlsDb.createNewRootUrl(rootUrl)
          if (createRootUrlResult.err) {
            Logger.error('Error creating url ' + rootUrl +
              ' maybe restart is required\n' + JSON.stringify(err))
          }
        }
      }
      this.droneWatchDog = setInterval(
        this.searchForUrls,
        ProcessVariables.droneInterval
      )
      this.searchForUrls()
    })
  }
  public stop = () => {
    if (this.droneWatchDog != null) {
      clearInterval(this.droneWatchDog)
      this.droneWatchDog = null
    }
  }
  private async searchForUrls() {
    if (this.isBusy) {
      Logger.error('Drone:Last drone is still busy aborting interval', __filename)
      return
    }
    this.isBusy = true
    const searchProcess = async () => {
      Logger.log('Drone:Starting from unchecked root urls', __filename)
      {// Checking if root url needs scrapping
        const findUnCheckedSchemasResult = await RootUrlsDb.findUnCheckedSchemas()
        if (findUnCheckedSchemasResult.err) {
          Logger.error('Drone:Error in finding unchecked root urls\n'
            + JSON.stringify(findUnCheckedSchemasResult), __filename)
          return
        }
        if (CommonValidator.isEmptyArray(findUnCheckedSchemasResult.res) === false) {
          for (const rootUrl of findUnCheckedSchemasResult.res) {
            await this.crawlForUrls(rootUrl.url, rootUrl.url)
            const updateRootUrlResult = await RootUrlsDb.findByIdAndUpdateAsync(rootUrl._id, {
              lastChecked: new Date(),
              isFirstTimeCheck: false
            })
            if (updateRootUrlResult.err != null) {
              Logger.error('Drone:update root url error,\n' + JSON.stringify(updateRootUrlResult.err), __filename)
            }
          }
        } else {
          Logger.log('Drone:Root urls are already checked')
        }
      }
      {// Checking if level0Schema needs scrapping
        const findUnCheckedSchemasResult = await Level0ScrapDb.findUnCheckedForUrlSchemas()
        if (findUnCheckedSchemasResult.err) {
          Logger.error('Drone:Error in finding unchecked level0 schema\n'
            + JSON.stringify(findUnCheckedSchemasResult.err), __filename)
          return
        }
        if (CommonValidator.isEmptyArray(findUnCheckedSchemasResult.res) === false) {
          let currentScrapCount = 0
          for (const level0Scrap of findUnCheckedSchemasResult.res) {
            currentScrapCount++
            if (currentScrapCount > ProcessVariables.droneMaximumDocCount) {
              break
            }
            try {// Some links may not be html
              await this.crawlForUrls(level0Scrap.url, level0Scrap.rootUrl)
            } catch (exception) {
              Logger.handleError(exception)
            }
            const updateLevel0ScrapResult = await Level0ScrapDb.findByIdAndUpdateAsync(level0Scrap._id, {
              checkedForUrl: true
            })
            if (updateLevel0ScrapResult.err) {
              Logger.error('Drone:update level0Scrap\n' + JSON.stringify(updateLevel0ScrapResult.err), __filename)
            }
          }
        }
      }
    }
    await searchProcess()
    Logger.log('Drone:Search process complete,Waiting for start of another interval')
    this.isBusy = false
  }
  private crawlForUrls(url: string, rootUrl: string) {
    return new Promise((resolve) => {
      this.onCrawlCompleteCallback = resolve
      this.crawlHandler.queue({
        uri: url,
        rootUrl
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
      Logger.error('Drone:Crawl failed for url ' + res.options.uri + '\n' + JSON.stringify(error))
      done()
      return
    }
    const rootUrl: string = res.options.rootUrl
    if (typeof res.$ !== 'function') {
      done()
      return
    }
    const aElements = res.$('a')
    if (aElements != null && aElements.length !== 0) {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < aElements.length; i++) {
        let hrefLink = aElements[i].attribs.href
        if (CommonValidator.isNullOrEmpty(hrefLink) === false) {
          hrefLink = hrefLink.trim()
          let normalizedUrl = ''
          if (hrefLink.startsWith(rootUrl) && rootUrl !== hrefLink) {
            normalizedUrl = hrefLink
          // Means it's a redirect to another website
          } else if (hrefLink.startsWith('http') || hrefLink.startsWith('https')) {
            for (const validHost of ValidHosts) {
              if (hrefLink.startsWith(validHost)) {
                normalizedUrl = hrefLink
                break
              }
            }
          } else {
            normalizedUrl = rootUrl.concat(hrefLink)
          }
          if (CommonValidator.isNullOrEmpty(normalizedUrl.replace(' ', '')) === true) {
            continue
          }
          const findUrlResult = await Level0ScrapDb.findOneAsync({
            url: normalizedUrl
          })
          if (findUrlResult.err) {
            Logger.error('Drone:Finding similar url failed for url '
              + normalizedUrl + '\n' + JSON.stringify(findUrlResult.err)
            )
          } else if (findUrlResult.res == null)  {
            const createNewLinkResult = await Level0ScrapDb.createNewLevel0Scrap(
              normalizedUrl,
              rootUrl
            )
            if (createNewLinkResult.err) {
              Logger.error('Drone:Adding new link error\n' + JSON.stringify(createNewLinkResult.err))
            }
          }
        }
      }
    }
    done()
  }
}
