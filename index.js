'use strict'

const co = require('bluebird').coroutine

const MongoDb = require('src/db/mongo')
const RedisDb = require('src/db/redis')
const Server = require('src/server')

co(function* () {

  yield MongoDb.init()
  yield RedisDb.init()
  Server.init()
})()

const server = require('./src/server')
