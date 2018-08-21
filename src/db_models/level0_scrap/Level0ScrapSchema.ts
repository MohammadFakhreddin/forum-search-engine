import Mongoose from 'mongoose'
import { ILevel0Scrap } from '../../models/ILevel0Scrap'
import * as Types from './../../utils/Types'

const Level0ScrapSchema = new Mongoose.Schema({
  url: {type: String, required: true},
  checkedForUrl: {type: Boolean, default: false},
  checkedForLevel1: {type: Boolean, default: false},
  rootUrl: {type: String, required: true}
})

Level0ScrapSchema.set('autoIndex', false)

Level0ScrapSchema.index({
  checked: 1
})

Level0ScrapSchema.statics.createNewLevel0Scrap = function(
  url: string,
  rootUrl: string
): Promise<Types.IErrResPromise> {
  return new Promise((resolve) => {
    this.create({
      url,
      checkedForUrl: false,
      checkedForLevel1: false
    }, (err, res) => resolve({err, res}))
  })
}

Level0ScrapSchema.statics.findUnCheckedForUrlSchemas = function(): Promise<Types.IErrResPromise> {
  return new Promise((resolve) => {
    this.find({
      checkedForUrl: false
    }, (err, res) => resolve({err, res}))
  })
}

Level0ScrapSchema.statics.findUnCheckedForLevel1Schemas = function(): Promise<Types.IErrResPromise> {
  return new Promise((resolve) => {
    this.find({
      checkedForLevel1: false
    }, (err, res) => resolve({err, res}))
  })
}

Level0ScrapSchema.statics.findByIdAndUpdateAsync = function(
  objectId: string,
  updateFieldsAndValues: any,
  options: any = null
): Promise<Types.IErrResPromise> {
  return new Promise((resolve) => {
    this.findById(
      objectId,
      updateFieldsAndValues,
      options,
      (err, res) => resolve({err, res})
    )
  })
}

Level0ScrapSchema.statics.findAsync = function(
  query: any
): Promise<Types.IErrResPromise> {
  return new Promise((resolve) => {
    this.find(query, (err, res) => resolve({err, res}))
  })
}

Level0ScrapSchema.statics.findOneAndUpdateAsync = function(
  query: any,
  updateFieldsAndValues: any,
  options?: any
): Promise<Types.IErrResPromise> {
  return new Promise((resolve) => {
    this.findByIdAndUpdate(query, updateFieldsAndValues, options, (err, res) => resolve({err, res}))
  })
}

export const Level0ScrapDb: ILevel0ScrapSchema = Mongoose.model('level0', Level0ScrapSchema)

export interface ILevel0ScrapSchema extends Mongoose.Model<Mongoose.Document> {
  findUnCheckedForUrlSchemas?: () => Promise<{
    err: any,
    res: ILevel0Scrap[]
  }>,
  findUnCheckedForLevel1Schemas?: () => Promise<{
    err: any,
    res: ILevel0Scrap[]
  }>,
  findByIdAndUpdateAsync?: (
    objectId: string,
    updateFieldsAndValues: any,
    options?: any
  ) => Promise<{
    err: any,
    res: ILevel0Scrap
  }>,
  findAsync?: (
    query: any
  ) => Promise<{
    err: any,
    res: ILevel0Scrap[]
  }>,
  createNewLevel0Scrap?(
    url: string,
    rootUrl: string
  ): Promise<Types.IErrResPromise>,
  findOneAndUpdateAsync?(
    query: any,
    updateFieldsAndValues: any,
    options?: any
  ): Promise<{
    err: any,
    res: ILevel0Scrap
  }>
}
