import Mongoose from 'mongoose'
import { ILevel0Scrap } from '../../models/ILevel0Scrap'
import * as Types from './../../utils/Types'

const Level0ScrapSchema = new Mongoose.Schema({
  url: {type: String, required: true},
  checked: {type: Boolean, default: false}
})

Level0ScrapSchema.set('autoIndex', false)

Level0ScrapSchema.index({
  checked: 1
})

Level0ScrapSchema.statics.create = function(
  url: string
): Promise<Types.IErrResPromise> {
  return new Promise((resolve) => {
    this.create({
      url,
      checked: false
    }, (err, res) => resolve({err, res}))
  })
}

Level0ScrapSchema.statics.findUnCheckedSchemas = function(): Promise<Types.IErrResPromise> {
  return new Promise((resolve) => {
    this.find({
      checked: false
    }, (err, res) => resolve({err, res}))
  })
}

Level0ScrapSchema.statics.findByIdAndUpdateAsync = function(
  objectId: string,
  updateFieldsAndValues: any
): Promise<Types.IErrResPromise> {
  return new Promise((resolve) => {
    this.findById(
      objectId,
      updateFieldsAndValues,
      (err, res) => resolve({err, res})
    )
  })
}

export const Level0ScrapDb: ILevel0ScrapSchema = Mongoose.model('level0', Level0ScrapSchema)

export interface ILevel0ScrapSchema extends Mongoose.Model<Mongoose.Document> {
  findUnCheckedSchemas?: () => Promise<{
    err: any,
    res: ILevel0Scrap
  }>,
  findByIdAndUpdateAsync?: (
    objectId: string,
    updateFieldsAndValues: any
  ) => Promise<{
    err: any,
    res: ILevel0Scrap
  }>
}
