#!/usr/bin/env node

import Cluster from 'cluster'
import * as Http from 'http'
import {App} from '../App'
import {EnvironmentVariables, LocalEvents} from '../Config'
import { Crawler } from '../Crawler'
import { Drone } from '../Drone'
import { Tokenizer } from '../Tokenizer'
import {Logger} from '../utils/Logger'
import {MongodbConnectionHandler} from '../utils/MongodbConnectionHandler'
import * as Types from '../utils/Types'

const setEnv =  (env) => {
  switch (env) {
    case 'dev':
      EnvironmentVariables.isDev = true
      EnvironmentVariables.isTest = false
      break
    case 'prod':
      EnvironmentVariables.isDev = false
      EnvironmentVariables.isTest = false
      break
    case 'test':
      EnvironmentVariables.isDev = true
      EnvironmentVariables.isTest = true
      break
  }
}

setEnv(process.argv[2] || 'dev')

if (Cluster.isWorker) {
  const onRoleReady = (role: Types.ClusterRole): void => {
    switch (role) {
      case 'app':
      const onError = (error) => {
        if (error.syscall !== 'listen') {
          throw error
        }
        const bind = typeof port === 'string'
          ? 'Pipe ' + port
          : 'Port ' + port

        // handle specific listen errors with friendly messages
        switch (error.code) {
          case 'EACCES':
            Logger.error(bind + ' requires elevated privileges')
            process.exit(1)
          case 'EADDRINUSE':
            Logger.error(bind + ' is already in use')
            process.exit(1)
          default:
            throw error
        }
      }
      /**
       * Normalize a port into a number, string, or false.
       */
      const normalizePort = (value: string) => {
        const localPort = parseInt(value, 10)
        if (isNaN(localPort)) {
          // named pipe
          return value
        }
        if (localPort >= 0) {
          // localPort number
          return localPort
        }
        return false
      }
      const port = normalizePort(process.env.PORT || EnvironmentVariables.port)
      App.set('port', port)
      MongodbConnectionHandler.connect((db) => {
        if (db != null) {
          const server = Http.createServer(App)
          server.listen(Number(port), '0.0.0.0', null, null)
          server.on('error', onError)
          server.on('listening', () => {
            const addr = server.address()
            const bind = typeof addr === 'string'
              ? 'pipe ' + addr
              : 'port ' + addr.port
            Logger.log(`Process ${process.pid} is listening to  ${bind} as app`)
          })
        } else {
          Logger.error('App:Cannot connect to mongodb exiting')
          process.exit(-1)
        }
      })
      break
      case 'tokenizer':
      MongodbConnectionHandler.connect((db) => {
        if (db != null) {
          Logger.log(`Process ${process.pid} acting as tokenizer`)
          // tslint:disable-next-line:no-unused-expression
          new Tokenizer()
        } else {
          Logger.error('Tokenizer:Cannot connect to mongodb exiting')
          process.exit(-1)
        }
      })
      break
      case 'crawler':
      MongodbConnectionHandler.connect((db) => {
        if (db != null) {
          Logger.log(`Process ${process.pid} acting as crawler`)
          // tslint:disable-next-line:no-unused-expression
          new Crawler()
        } else {
          Logger.error('Crawler:Cannot connect to mongodb exiting')
          process.exit(-1)
        }
      })
      break
      case 'drone':
      MongodbConnectionHandler.connect((db) => {
        if (db != null) {
          Logger.log(`Process ${process.pid} acting as drone`)
          // tslint:disable-next-line:no-unused-expression
          new Drone()
        } else {
          Logger.error('Drone:Cannot connect to mongodb exiting')
          process.exit(-1)
        }
      })
      break
      default:
      Logger.error('Unknown rule detected')
    }
  }
  process.on('message', (packet: ILocalProcessMessage) => {
    if (packet.event === LocalEvents.roleIsReady) {
      onRoleReady(packet.data)
    }
  })
} else {
  const runCluster = (): Cluster.Worker => {
    return Cluster.fork()
  }
  const findWorkerRole = (worker: Cluster.Worker): Types.ClusterRole => {
    if (worker.process.pid === tokenCluster.process.pid) {
      return 'tokenizer'
    } else if (worker.process.pid === appCluster.process.pid) {
      return 'app'
    } else if (worker.process.pid === droneCluster.process.pid) {
      return 'drone'
    } else if (worker.process.pid === crawlerCluster.process.pid) {
      return 'crawler'
    }
    return null
  }
  let appCluster = runCluster()
  // let droneCluster = runCluster()
  // let crawlerCluster = runCluster()
  // let tokenCluster = runCluster()
  let droneCluster = {process: {pid: -1}}
  let crawlerCluster = {process: {pid: -2}}
  let tokenCluster = {process: {pid: -3}}
  Cluster.on('online', (worker) => {
    Logger.log('Worker ' + worker.process.pid + ' is online', __filename)
    const role = findWorkerRole(worker)
    if (role == null) {
      Logger.error('Unknown worker detected')
      return
    }
    worker.process.send({event: LocalEvents.roleIsReady, data: role})
  })
  Cluster.on('exit', (deadWorker) => {
    Logger.log('Worker ' + deadWorker.process.pid + ' has stopped working', __filename)
    if (!EnvironmentVariables.isDev) {
      const role = findWorkerRole(deadWorker)
      if (role == null) {
        Logger.error('Unknown worker detected', __filename)
        return
      }
      const newWorker = runCluster()
      switch (role) {
        case 'app':
        appCluster = newWorker
        break
        case 'tokenizer':
        tokenCluster = newWorker
        break
        case 'crawler':
        crawlerCluster = newWorker
        break
        case 'drone':
        droneCluster = newWorker
        break
        default:
        Logger.error('Unknown role detected', __filename)
      }
    }
  })
}

process.on('uncaughtException', (exception) => {
  if (EnvironmentVariables.isDev) {
    throw exception
  } else {
    const contents = Date.now().toString() + '\n' + exception.stack.toString()
    Logger.error(contents, __filename)
  }
})
