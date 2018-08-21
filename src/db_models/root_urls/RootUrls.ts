import Mongoose from 'mongoose'
import { ProcessVariables } from '../../Config'
import { ILevel0Scrap } from '../../models/ILevel0Scrap'
import { IRootUrls } from '../../models/IRootUrls'
import * as Types from './../../utils/Types'

const RootUrlsSchema = new Mongoose.Schema({
  url: {type: String, required: true},
  lastChecked: {type: Date, default: new Date()}
})

RootUrlsSchema.set('autoIndex', false)

RootUrlsSchema.index({
  lastChecked: 1
})

RootUrlsSchema.statics.createNewRootUrl = function(
  url: string
): Promise<Types.IErrResPromise> {
  return new Promise((resolve) => {
    this.create({
      url,
      lastChecked: null
    }, (err, res) => resolve({err, res}))
  })
}

RootUrlsSchema.statics.findUnCheckedSchemas = function(): Promise<Types.IErrResPromise> {
  return new Promise((resolve) => {
    this.find({
      lastChecked: {
        $or: [
          {$lt: new Date(Date.now() - ProcessVariables.rootUrlsReCrawlTime)},
          {$eq: null}
        ]
      }
    }, (err, res) => resolve({err, res}))
  })
}

RootUrlsSchema.statics.findByIdAndUpdateAsync = function(
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

RootUrlsSchema.statics.findAsync = function(
  query: any
): Promise<Types.IErrResPromise> {
  return new Promise((resolve) => {
    this.find(query, (err, res) => resolve({err, res}))
  })
}

export const RootUrlsDb: IRootUrlsSchema = Mongoose.model('root_urls', RootUrlsSchema)

export interface IRootUrlsSchema extends Mongoose.Model<Mongoose.Document> {
  findUnCheckedSchemas?: () => Promise<{
    err: any,
    res: IRootUrls[]
  }>,
  findByIdAndUpdateAsync?: (
    objectId: string,
    updateFieldsAndValues: any
  ) => Promise<{
    err: any,
    res: IRootUrls
  }>,
  findAsync?: (
    query: any
  ) => Promise<{
    err: any,
    res: IRootUrls[]
  }>,
  createNewRootUrl?: (
    url: string
  ) => Promise<Types.IErrResPromise>
}
