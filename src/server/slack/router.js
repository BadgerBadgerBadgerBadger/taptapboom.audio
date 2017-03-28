'use strict'

const express = require('express')
const _ = require('lodash')
const request = require('request-promise')

const Logger = require('src/util/logger')
const Constants = require('src/constants')
const Controller = require('src/server/slack/controller')
const Serializer = require('src/server/slack/serializer')
const Slack = require(`src/slack`)
const Spotify = require('src/spotify')

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
        return _displayHelp()

      case 'add':
        return _searchMusicFromSpotify(req.body.response_url, query)

      default:
        return {text: `I don't support that yet 😕 If you think I should, tweet out to @scionofbytes 🐥`}
    }
  })()
    .then(result => res.send(result))
})

router.post('/interactive', (req, res) => {

  return (async function () {

    res.send()
    Slack.pushToUri(req.body.response_url, {text: Constants.MESSAGING.WAIT_FOR_IT})

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
        const artists = Spotify.constructArtistName(track.artists)

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
    .then(result => Slack.pushToUri(req.body.response_url, result))
})

/**
 * Searches Spotify with the given query and sends a serialized list of the same to the repsonse_url.
 *
 * @param {String} response_url
 * @param {String} query
 * @returns {Promise}
 * @private
 */
async function _searchMusicFromSpotify(response_url, query) {
  (async function () {

    const results = await Spotify.search(query)
    const serialized = Serializer.serializeSearchResults(query, results)

    const response = Object.assign(serialized, {delete_original: true, response_type: 'in_channel'})

    await Slack.pushToUri(response_url, response)
  })()
}

function _displayHelp() {
  return {text: `Use "add" followed by your search query to look for songs.`}
}

module.exports = router
