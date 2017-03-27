'use strict'

const express = require('express')
const _ = require('lodash')
const request = require('request-promise')

const Logger = require('src/util/logger')
const Constants = require('src/constants')
const Controller = require('src/server/slack/controller')
const Spotify = require('src/spotify')
const Serializer = require('src/server/slack/serializer')

const debug = Logger.getDebug('controller-slack')
const router = express.Router({mergeParams: true})

router.use(Controller.authorizeSlack)

router.post('/command', (req, res) => {
  return (async function () {

    const text = _.get(req, 'body.text')

    const tokens = text.split(' ')
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
        return res.send('l')

      default:
        return res.json({text: `We don't support that yet.`})
    }
  })()
})

router.post('/interactive', (req, res) => {

  return (async function () {

    res.send({text: Constants.MESSAGING.WAIT_FOR_IT})

    const callbackId = req.body.callback_id

    switch (callbackId) {
      case Constants.SLACK.INTERACTIVE.SONG_SEARCH.CALLBACK_ID:

        debug(`CallbackId received: ${Constants.SLACK.INTERACTIVE.SONG_SEARCH.CALLBACK_ID}`)

        const action = _.get(req, 'body.actions')[0]
        debug(`Action received: ${JSON.stringify(action)}`)

        if (action.name === Constants.SLACK.INTERACTIVE.SONG_SEARCH.ACTION.SKIP_SEARCH.NAME) {
          return {delete_original: true}
        }

        const trackId = action.value
        const track = await Spotify.getTrackFromId(trackId)
        const trackName = track.name
        const artists = Spotify.getArtistsFromTrack(track)

        const result = await Spotify.addTrackToTargetPlaylist(trackId)

        if (result.status !== Constants.RESULT.STATUS.SUCCESS) {
          return {text: Constants.MESSAGING.UH_OH}
        }

        return {text: Constants.MESSAGING.SPOTIFY.getSONG_SUCCESSFULLY_ADDED(trackName, artists)}

      default:
        Logger.error(`Unsupported callbackId received: ${callbackId}.`)
        return {text: Constants.MESSAGING.UH_OH}
    }
  })()
    .then(res => request({uri: req.body.response_url, method: 'POST', json: res}))
})

async function _searchMusicFromSpotify(requestBody, query, res) {

  res.json({text: Constants.MESSAGING.WAIT_FOR_IT})

  const results = await Spotify.search(query)
  const serialized = Serializer.serializeSearchResults(query, results.items)

  await request({uri: requestBody.response_url, method: 'POST', json: serialized})
}

function _displayHelp(req, query, res) {
  res.json({
    text: 'massive'
  })
}

module.exports = router
