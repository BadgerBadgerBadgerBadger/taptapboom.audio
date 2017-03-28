'use strict'

/*
 The goal with this module is to get around the fact that Heroku only provides postgres in its free tier
 and to get something like redis you'd have to submit your credit card data and such. I don't want people going
 through all that hassle. So I just built a simple KV layer on top of postgres. Thankfully upserts are supported
 so overriding in one call is pretty neat. Can't claim this is the most well-written KV layer so if anyone's got
 any better (or crazier) ideas, ping me.
 */

const pg = require('src/db/pg').pg
const Constants = require('src/constants')

const TABLE_NAME = Constants.KV_JSON.SQL_TABLE_NAME

/**
 * @param {String} key
 * @param {String} value
 * @returns {Promise}
 */
function setAsync(key, value) {

  const now = (new Date().toISOString())

  const rawSql = `INSERT INTO ${TABLE_NAME} (k, v, l) ` +
    `VALUES ('${key}','${value}', '${now}') ` +
    `ON CONFLICT (k) DO UPDATE SET v = '${value}' ` +
    `WHERE ${TABLE_NAME}.k = '${key}';`

  return pg.raw(rawSql)
}

/**
 * @param {String} key
 * @returns {Promise<String|null>}
 */
function getAsync(key) {
  return pg(TABLE_NAME)
    .where({k: key})
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
