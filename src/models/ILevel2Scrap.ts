export interface ILevel2Scrap {
  _id: string,
  tokenAndOrder: Array<{
    token: string,
    order: number
  }>,
  url: string,
  previewTitle: string,
  previewBody: string
}
