'use strict'

const config = require('config')

const debug = config.get('postgres.debug') === 'true'

const pg = require('knex')({
  client: 'pg',
  connection: config.get('postgres.databaseUri'),
  debug
})

const init = async function () {
  return null
}

module.exports = {
  init,
  pg
}
