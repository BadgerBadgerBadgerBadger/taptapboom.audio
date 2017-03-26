'use strict'

const Constants = require('src/constants')

exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTableIfNotExists(Constants.KV_JSON.SQL_TABLE_NAME, function (table) {

      table.text('k').primary()
      table.text('v').notNullable()
      table.text('l').notNullable()
    })
  ])
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('jsonKv')
}
