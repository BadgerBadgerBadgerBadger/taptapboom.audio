'use strict'

const Promise = require('bluebird')
const config = require('config')

const debug = config.get('postgres.debug') === 'true'

const pg = require('knex')({
  client: 'pg',
  connection: config.get('postgres.databaseUri'),
  debug
})

const init = function () {
  return Promise.resolve()
}

module.exports = {
  init,
  pg
}
