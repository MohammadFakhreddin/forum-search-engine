import Mongoose from 'mongoose'
import { ILevel2Scrap } from '../../models/ILevel2Scrap'
import * as Types from './../../utils/Types'

const tokenAndOrderSchema = new Mongoose.Schema({
  token: {type: String},
  order: {type: Number}
})

const Level2ScrapSchema = new Mongoose.Schema({
  tokenAndOrder: [tokenAndOrderSchema],
  url: {type: String, trim: true, default: ''},
  previewTitle: {type: String, default: ''},
  previewBody: {type: String, default: ''}
})

Level2ScrapSchema.set('autoIndex', false)

Level2ScrapSchema.index({
  'tokenAndOrder.token': 1,
  '_id': 1
})

Level2ScrapSchema.index({
  tokens: 1
})

Level2ScrapSchema.statics.findAsync = function(query: any): Promise<{
  err: any,
  res: ILevel2Scrap[]
}> {
  return new Promise((resolve) => {
    this.find(query, (err, res) => resolve({err, res}))
  })
}

Level2ScrapSchema.statics.createNewLevel2Schema = function(
  url: string,
  tokens: string[],
  previewTitle: string,
  previewBody: string
): Promise<Types.IErrResPromise> {
  return new Promise((resolve) => {
    const tokenAndOrder = []
    for (let i = 0; i < tokens.length; i++) {
      tokenAndOrder.push({
        token: tokens[i],
        order: i
      })
    }
    this.create({
      url,
      tokenAndOrder,
      previewTitle,
      previewBody
    }, (err, res) => resolve({err, res}))
  })
}

Level2ScrapSchema.statics.findByIdAndUpdateAsync = function(
  objectId: string,
  updateFieldsAndValues: any
): Promise<Types.IErrResPromise> {
  return new Promise((resolve) => {
    this.findByIdAndUpdate(
      objectId,
      updateFieldsAndValues,
      (err, res) => resolve({err, res})
    )
  })
}

export const Level2ScrapDb: ILevel2ScrapSchema = Mongoose.model('level2', Level2ScrapSchema)

export interface ILevel2ScrapSchema extends Mongoose.Model<Mongoose.Document> {
  findAsync?: (query: any) => Promise<{
    err: any,
    res: ILevel2Scrap[]
  }>,
  createNewLevel2Schema?: (
    url: string,
    tokens: string[],
    previewTitle: string,
    previewBody: string
  ) => Promise<{err: any, res: ILevel2Scrap}>,
  findByIdAndUpdateAsync?(
    objectId: string,
    updateFieldsAndValues: any
  ): Promise<{err: any, res: ILevel2Scrap}>
}
