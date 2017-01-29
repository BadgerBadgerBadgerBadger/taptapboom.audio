'use strict'

const Promise = require('bluebird')
const co = Promise.coroutine
const redis = require('redis')
const config = require('config')

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype)

const Logger = require('src/util/logger')

const client = redis.createClient({
  host: config.get('redis.host')
})

module.exports = {
  init: co(function* () {

    yield client.pingAsync()
    Logger.info(`Redis connection established.`)
  }),

  client
}
