import { ProcessVariables } from './Config'
import { Level0ScrapDb } from './db_models/level0_scrap/Level0ScrapSchema'
import { Level1ScrapDb } from './db_models/level1_scrap/Level1ScrapSchema'

export class Crawler {
  private isBusy = false
  private crawlerWatchDog: NodeJS.Timer = null
  public constructor() {
    this.crawlerWatchDog = setInterval(
      this.crawlNewlyAddedUrls,
      ProcessVariables.crawlerInterval
    )
  }
  public stop = () => {
    if (this.crawlerWatchDog != null) {
      clearInterval(this.crawlerWatchDog)
      this.crawlerWatchDog = null
    }
  }
  private async crawlNewlyAddedUrls() {

  }
}
