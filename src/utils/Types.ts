export interface IErrResPromise  {
  err?,
  res
}

export interface IGraphQlPromise {
  statusCode: number,
  res?: any
}

export type ErrResCallback = (err: Error, res: any) => void

export type OnGraphQlPromiseFulfilled = (data: IGraphQlPromise) => void

export type OnErrResPromiseFulfilled = (data: IErrResPromise) => void

export type OnPromiseRejected = (error: string) => void

export interface ITokenData {
  id: string,
}

export interface ITokenObj {
  exp: number,
  data: ITokenData,
  accessType: number,
  iat: number
}

export interface IReq {
  headers: any,
  body: any,
  tokenData: ITokenData
}

export type ClusterRole = 'app' | 'crawler' | 'tokenizer' | 'drone'
