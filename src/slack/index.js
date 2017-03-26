'use strict'

const _ = require('lodash')
const co = require('bluebird').coroutine
const config = require('config')
const request = require('request-promise')

const Constants = require('src/constants')
const Kv = require('src/kv')
const Logger = require('src/util/logger')

const debug = Logger.getDebug('slack')

const local = {
  state: {
    connected: false
  }
}

function authorize(code) {
  return co(function* () {

    const options = {
      uri: 'https://slack.com/api/oauth.access',
      qs: {
        code,
        client_id: config.get('slack.clientId'),
        client_secret: config.get('slack.clientSecret')
      },
      json: true
    }

    const response = yield request(options)
    const accessToken = _.get(response, 'access_token')

    yield Kv.setAsync(Constants.STORAGE_KEY.SLACK.ACCESS_TOKEN, accessToken)

    local.state.connected = true
  })()
}

function getState() {
  return local.state
}

function testAuth(token) {

  const options = {
    uri: `${Constants.SLACK.API_URL}/auth.test`,
    method: 'POST',
    qs: {
      token
    },
    json: true
  }

  return request(options)
    .then(res => {
      if (!res.ok) {
        Logger.error(`Auth test failed with: ${res.error}`)
        return false
      }

      return true
    })
}

function init() {
  return co(function* () {

    debug('Fetching slack token from storage.')
    const accessTokenFromStorage = yield Kv.getAsync(Constants.STORAGE_KEY.SLACK.ACCESS_TOKEN)

    if (!accessTokenFromStorage) {
      debug(`Slack token not found in storage.`)
      return
    }

    debug(`Slack token found in storage.`)
    const isSlackConnected = yield testAuth(accessTokenFromStorage)

    if (isSlackConnected) {
      local.state.connected = true
    }
  })()
}

module.exports = {
  authorize,
  getState,
  init
}
