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

/**
 * Makes an authorization call based on an oauth code and saves the returned tokens (on success)
 * to the database. Also updates module state to connected (on success).
 *
 * @param {String} code
 * @returns {Promise}
 */
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

/**
 * Verifies if the passed token is valid.
 *
 * @param {String} token
 * @returns {Promise<Boolean>}
 */
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

/**
 * Checks for access to slack by checking existence of tokens in database and verifying that they are still valid.
 * Sets the module's local state accordingly.
 *
 * @returns {Promise}
 */
async function init() {

  debug('Fetching slack token from storage.')
  const accessTokenFromStorage = await Kv.getAsync(Constants.STORAGE_KEY.SLACK.ACCESS_TOKEN)

  if (!accessTokenFromStorage) {
    debug(`Slack token not found in storage.`)
    return
  }

  debug(`Slack token found in storage.`)
  const isSlackConnected = await testAuth(accessTokenFromStorage)
  debug(`Valid slack token found. Connection to slack active.`)

  if (isSlackConnected) {
    local.state.connected = true
  }
}

async function pushToUri (uri, body) {
  return request({uri: uri, method: 'POST', json: body})
}

module.exports = {
  authorize,
  getState,
  init,
  pushToUri
}
