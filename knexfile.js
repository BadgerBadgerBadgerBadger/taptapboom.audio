'use strict'

const config = require('config')

const debug = config.get('postgres.debug') === 'true'

const knexConfig = {
  client: 'pg',
  connection: config.get('postgres.databaseUri'),
  debug
}

module.exports = {
  development: knexConfig,
  staging: knexConfig,
  production: knexConfig,
  test: knexConfig
}
