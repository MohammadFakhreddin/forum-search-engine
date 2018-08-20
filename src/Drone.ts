import { ProcessVariables } from './Config'
import { Level0ScrapDb } from './db_models/level0_scrap/Level0ScrapSchema'

export class Drone {
  private isBusy = false
  private droneWatchDog: NodeJS.Timer = null
  public constructor() {
    this.droneWatchDog = setInterval(
      this.searchForUrls,
      ProcessVariables.droneInterval
    )
  }
  public stop = () => {
    if (this.droneWatchDog != null) {
      clearInterval(this.droneWatchDog)
      this.droneWatchDog = null
    }
  }
  private async searchForUrls() {

  }
}
