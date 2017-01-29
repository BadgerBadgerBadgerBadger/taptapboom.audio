'use strict'

const debug = require('debug')('taptapboom:db:mongo')
const config = require('config')
const co = require('bluebird').coroutine

const MongoClient = require('mongodb').MongoClient
const Logger = require('src/util/logger')

let mongoClient = null

function init() {
  return co(function* () {

    const connectionUrl =
      `mongodb://${config.get('mongo.host')}:${config.get('mongo.port')}/${config.get('mongo.db')}`

    mongoClient = yield MongoClient.connect(connectionUrl)
    Logger.info(`MongoDb connection established to ${connectionUrl}.`)

    return mongoClient
  })()
}

module.exports = {
  getClient: () => mongoClient,
  init
}
