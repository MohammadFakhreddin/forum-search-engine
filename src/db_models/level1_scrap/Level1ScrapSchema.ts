import Mongoose from 'mongoose'
import { ILevel1Scrap } from '../../models/ILevel1Scrap'
import * as Types from './../../utils/Types'

const Level1ScrapSchema  = new Mongoose.Schema({
  title: {type: String, default: ''},
  body: {type: String, default: ''},
  url: {type: String, default: ''},
  checked: {type: Boolean, default: false},
  previewTitle: {type: String, default: ''},
  previewBody: {type: String, default: ''}
})

Level1ScrapSchema.set('autoIndex', false)

Level1ScrapSchema.index({
  checked: 1
})

Level1ScrapSchema.statics.findUnCheckedSchemas = function(): Promise<{
  err: any,
  res: ILevel1Scrap[]
}> {
  return new Promise((resolve) => {
    this.find({
      checked: false
    }, (err, res) => resolve({err, res}))
  })
}

Level1ScrapSchema.statics.findByIdAndUpdateAsync = function(
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

Level1ScrapSchema.statics.createNewLevel1ScrapSchema = function(
  title: string,
  body: string,
  url: string,
  previewTitle: string,
  previewBody: string
): Promise<Types.IErrResPromise> {
  return new Promise((resolve) => {
    this.create({
      title,
      body,
      url,
      checked: false,
      previewTitle,
      previewBody
    }, (err, res) => resolve({err, res}))
  })
}

Level1ScrapSchema.statics.findOneAndUpdateAsync = function(
  query: any,
  updateFieldsAndValues: any,
  options?: any
): Promise<Types.IErrResPromise> {
  return new Promise((resolve) => {
    this.findOneAndUpdate(query, updateFieldsAndValues, options, (err, res) => resolve({err, res}))
  })
}

export const Level1ScrapDb: ILevel1ScrapSchema = Mongoose.model('level1', Level1ScrapSchema)

export interface ILevel1ScrapSchema extends Mongoose.Model<Mongoose.Document> {
  findUnCheckedSchemas?: () => Promise<{
    err: any,
    res: ILevel1Scrap[]
  }>,
  findByIdAndUpdateAsync?: (
    objectId: string,
    updateFieldsAndValues: any
  ) => Promise<{
    err: any,
    res: ILevel1Scrap
  }>,
  findOneAndUpdateAsync?: (
    query: any,
    updateFieldsAndValues: any,
    options?: any
  ) => Promise<{
    err: any,
    res: ILevel1Scrap
  }>,
  createNewLevel1ScrapSchema?: (
    title: string,
    body: string,
    url: string,
    previewTitle: string,
    previewBody: string
  ) => Promise<Types.IErrResPromise>
}
