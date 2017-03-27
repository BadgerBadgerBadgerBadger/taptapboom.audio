'use strict'

const _ = require('lodash')
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

async function authorize(code) {

  const options = {
    uri: 'https://slack.com/api/oauth.access',
    qs: {
      code,
      client_id: config.get('slack.clientId'),
      client_secret: config.get('slack.clientSecret')
    },
    json: true
  }

  const response = await request(options)
  const accessToken = _.get(response, 'access_token')

  await Kv.setAsync(Constants.STORAGE_KEY.SLACK.ACCESS_TOKEN, accessToken)

  local.state.connected = true
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

async function init() {

  debug('Fetching slack token from storage.')
  const accessTokenFromStorage = await Kv.getAsync(Constants.STORAGE_KEY.SLACK.ACCESS_TOKEN)

  if (!accessTokenFromStorage) {
    debug(`Slack token not found in storage.`)
    return
  }

  debug(`Slack token found in storage.`)
  const isSlackConnected = await testAuth(accessTokenFromStorage)

  if (isSlackConnected) {
    local.state.connected = true
  }
}

module.exports = {
  authorize,
  getState,
  init
}
