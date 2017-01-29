'use strict'

const debug = require('debug')('taptapboom:controller:slack')
const express = require('express')
const _ = require('lodash')
const request = require('request-promise')
const co = require('bluebird').coroutine

const Logger = require('src/util/logger')
const Constants = require('src/constants')
const Controller = require('src/server/slack/controller')
const Spotify = require('src/spotify/app')
const Serializer =  require('src/server/slack/serializer')
const SlackTeam = require('src/storage/slackTeam')
const SpotifyUser = require('src/storage/spotifyUser')

const router = express.Router({ mergeParams: true })

router.use(Controller.authorizeSlack)

router.post('/command', (req, res) => {
  return co(function* () {

    debug(`Command body received: ${JSON.stringify(req.body)}`)
    const body = _.get(req, 'body')

    const slackTeam = new SlackTeam(body.team_id)
    yield slackTeam.fetch()
    debug(`Team data fetched: ${slackTeam.toJSON()}`)

    const spotifyUserId = slackTeam.get('spotify.user')

    if (!spotifyUserId) {

      const teamName = slackTeam.get('teamName')
      const authorizationUri = Spotify.createAuthorizeURL(slackTeam.getId())

      return res.json({ 
        text: Constants.MESSAGING.SLACK.getSpotifyAccountNotYetAdded(teamName, authorizationUri)
      })
    }

    const tokens = body.text.split(' ')
    const command = tokens.shift()
    const query = tokens.join(' ')

    switch (command) {
      case 'ping':
        return res.json({
          text: 'pong'
        })

      case 'help':
        return _displayHelp(req.body, query, res)

      case 'add':
        return _searchMusicFromSpotify(req.body, query, res)

      case 'nowplaying':
        return res.json('l')

      default:
        return res.json({ text: `We don't support that yet.` })
    }
  })()
})

router.post('/interactive', (req, res) => {

  return co(function* () {
    const callbackId = req.body.callback_id

    switch (callbackId) {
      case Constants.SLACK.INTERACTIVE.SONG_SEARCH.CALLBACK_ID:

        debug(`CallbackId received: ${Constants.SLACK.INTERACTIVE.SONG_SEARCH.CALLBACK_ID}, `+
          `with data: ${JSON.stringify(req.body)}`)

        const teamId = req.body.team.id
        const slackTeam = new SlackTeam(teamId)
        yield slackTeam.fetch()

        const spotifyUserId = slackTeam.get('spotify.user')

        if (!spotifyUserId) {

          const teamName = slackTeam.get('teamName')
          const authorizationUri = Spotify.createAuthorizeURL(slackTeam.getId())

          return res.json({
            text: Constants.MESSAGING.SLACK.getSpotifyAccountNotYetAdded(teamName, authorizationUri)
          })
        }

        res.json({ text: Constants.MESSAGING.WAIT_FOR_IT })

        const action = _.get(req, 'body.actions')[0]
        debug(`Action received: ${JSON.stringify(action)}`)
        const trackId = action.value
        const track = yield Spotify.getTrackFromId(trackId)
        const trackName = track.name

        const result = yield Spotify.addTrackToTargetPlaylist(spotifyUserId, trackId)

        if (result.status !== Constants.RESULT.STATUS.SUCCESS) {
          return { text: Constants.MESSAGING.UH_OH }
        }

        return { text: Constants.MESSAGING.SPOTIFY.getSONG_SUCCESSFULLY_ADDED(trackName) }

      default:
        Logger.error(`Unsupported callbackId received: ${callbackId}.`)
        return { text: Constants.MESSAGING.UH_OH }
    }
  })()
    .then(res => request({ uri: req.body.response_url, method: 'POST', json: res }))
})

function _searchMusicFromSpotify(requestBody, query, res) {
  return co(function* () {

    res.json({ text: Constants.MESSAGING.WAIT_FOR_IT })

    const results = yield Spotify.search(query)
    const serialized = Serializer.serializeSearchResults(query, results.items)

    yield request({ uri: requestBody.response_url, method: 'POST', json: serialized })
  })()
}

function _displayHelp(req, query, res) {
  res.json({
    text: 'massive'
  })
}

module.exports = router
