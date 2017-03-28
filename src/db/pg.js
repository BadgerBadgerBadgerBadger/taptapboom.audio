'use strict'

const config = require('config')

const debug = config.get('postgres.debug') === 'true'

const pg = require('knex')({
  client: 'pg',
  connection: config.get('postgres.databaseUri'),
  debug
})

/**
 * Testing whether a connection has been successfully established. Kinda stupid but apparently all that knex has
 * to offer right now: https://github.com/tgriesser/knex/issues/407#issuecomment-52858626
 *
 * @returns {Promise<null>}
 */
const init = async function () {
  return pg.raw('select 1+1 as result')
}

module.exports = {
  init,
  pg
}
