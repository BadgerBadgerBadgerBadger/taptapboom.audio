'use strict'

const co = require('bluebird').coroutine

const Spotify = require('src/spotify/app')
const Server = require('src/server')
const Logger = require('src/util/logger')

process.on('uncaughtException', err => {
  Logger.fatal('Uncaught exception', `error: ${err.message}`, {
    error: err,
    stack: err.stack
  })
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  Logger.fatal('unhandledRejection', '', {
    promise: promise,
    reason: reason
  })
  process.exit(1)
})

co(function* () {

  yield Spotify.init()
  Server.init()
})()
