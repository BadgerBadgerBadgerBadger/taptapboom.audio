'use strict'

const pg = require('src/db/pg').pg
const Constants = require('src/constants')

const TABLE_NAME = Constants.KV_JSON.SQL_TABLE_NAME

/**
 * @param {String} key
 * @param {String} value
 * @returns {Promise}
 */
function setAsync(key, value) {

  const rawSql = `INSERT INTO ${TABLE_NAME} (k, v, l) ` +
                `VALUES ('${key}','${value}', '${(new Date().toISOString())}') ` +
                `ON CONFLICT (k) DO UPDATE SET v = '${value}' ` +
                `WHERE ${TABLE_NAME}.k = '${key}';`

  return pg.raw(rawSql)
}

/**
 * @param {String} key
 * @returns {Promise<String>}
 */
function getAsync(key) {
  return pg(TABLE_NAME)
    .where({ k: key })
    .select('v')
    .then(res => {

      if (!res[0]) {
        return null
      }

      return res[0].v
    })
}

module.exports = {
  setAsync,
  getAsync
}
