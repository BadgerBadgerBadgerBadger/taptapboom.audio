'use strict'

const co = require('bluebird').coroutine
const config = require('config')
const express = require('express')

const router = express.Router({ mergeParams: true })
const Logger = require('src/util/logger')
const SpotifyRouter = require('src/server/authorization/spotify')
const SlackRouter = require('src/server/authorization/slack')
const Slack = require('src/slack')
const Spotify = require('src/spotify/app')

router.get('/', (req, res) => {
  return co(function* () {

    let spotifyPlaylists = null
    const selectedPlaylist = yield Spotify.getSelectedPlaylist()
    const slackState = Slack.getState()
    const spotifyState = Spotify.getState()

    if (spotifyState.connected) {
      spotifyPlaylists = (yield Spotify.getAvailablePlaylists(yield Spotify.getUser()))
    }

    res.render('connect.html', {
      config: {
        slack: {
          clientId: config.get('slack.clientId')
        }
      },
      connected: {
        spotify: spotifyState.connected,
        spotifyPlaylist: spotifyState.connectedPlaylist,
        slack: slackState.connected
      },
      spotify: {
        selectedPlaylist,
        playlists: spotifyPlaylists
      }
    })
  })()
    .catch(err => {
      Logger.error(err)
    })
})

router.use('/spotify', SpotifyRouter)
router.use('/slack', SlackRouter)

module.exports = router
