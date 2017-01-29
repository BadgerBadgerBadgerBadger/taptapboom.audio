'use strict'

const debug = require('debug')('taptapboom:storage')
const co = require('bluebird').coroutine
const _ = require('lodash')

const Util = require('src/util')
const MongoDb = require('src/db/mongo')

class Storage {

  constructor(storageId, collection, schema) {

    const mongoClient = MongoDb.getClient()

    this.collection = mongoClient.collection(collection)
    this.schema = schema
    this.id = storageId
    this.data = {}
  }

  set(key, value) {
    debug(`Setting on key: ${key}, value: ${value}`)
    _.set(this.data, key, value)

    return this
  }

  getId() {
    return this.id
  }

  get(path) {
    return _.get(this.data, path)
  }

  toObject() {
    return Util.clone(this.data)
  }

  toJSON() {
    return JSON.stringify(this.toObject())
  }

  fetch() {

    const self = this

    return co(function* () {

      self.data = yield self.collection.findOne({_id: self.id})
      return self
    })()
  }

  save() {

    const self = this

    return co(function* () {
      debug(`Starting storage of ${JSON.stringify(self.data)} for ${self.id}`)
      yield self.collection.updateOne(
        { _id: self.id },
        { $set: self.data },
        { upsert: true }
      )

      return self
    })()
  }

  getSchema() {
    return this.schema
  }
}

module.exports = Storage
