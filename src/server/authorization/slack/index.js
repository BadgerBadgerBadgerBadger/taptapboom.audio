'use strict'

const debug = require('debug')('taptapboom:authorization:slack')
const express = require('express')
const _ = require('lodash')
const co = require('bluebird').coroutine
const request = require('request-promise')
const config = require('config')

const Logger = require('src/util/logger')
const Redis = require('src/db/redis')
const SlackTeam = require('src/storage/slackTeam')

const router = express.Router({ mergeParams: true })

router.get('/callback', (req, res, next) => {

  co(function* () {

    const code = req.query.code
    const state = req.query.state

    debug(`Params received from slack: ${JSON.stringify(req.query)}`)

    if (state !== config.get('slack.oAuthState')) {
      throw new Error(`Received state: ${state} does not match configured state.`)
    }

    const options = {
      uri: 'https://slack.com/api/oauth.access',
      qs: {
        code,
        client_id: config.get('slack.clientId'),
        client_secret: config.get('slack.clientSecret')
      }
    }

    const response = JSON.parse(yield request(options))
    debug(`Authorization response received from Slack: ${JSON.stringify(response)}`)

    const accessToken = _.get(response, 'access_token')
    const teamId = _.get(response, 'team_id')

    const slackTeam = (new SlackTeam(teamId))
      .set('teamName', _.get(response, 'team_name'))
      .set('authorization', {
        accessToken,
        scope:  _.get(response, 'scope'),
        authorizingUser: _.get(response, 'user_id')
      })

    yield slackTeam.save()

    res.sendStatus(200)
  })()
    .catch(next)
})

module.exports = router
