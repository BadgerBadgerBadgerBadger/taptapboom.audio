'use strict'

const co = require('bluebird').coroutine
const config = require('config')
const debug = require('debug')('taptapboom:spotify-app')

const Constants = require('src/constants')
const Redis = require('src/db/redis')
const Logger = require('src/util/logger')
const SlackTeam = require('src/storage/slackTeam')

const SpotifyClient = require('src/spotify/client')

function refreshTokens() {
  return co(function* () {

    debug(`Refreshing tokens.`)
    const data = yield SpotifyClient.refreshAccessToken()
    debug(`Refreshed tokens: ${JSON.stringify(data)}`)
    SpotifyClient.setAccessToken(data.body['access_token'])

    if (data['refresh_token']) {
      debug(`New refresh token received.`)
      SpotifyClient.setRefreshToken(data.body['refresh_token'])
      yield Redis.client.setAsync(Constants.STORAGE_KEY.SPOTIFY.REFRESH_TOKEN, data.body['refresh_token'])
    }
  })()
}

function _search(queryString) {
  return SpotifyClient.singleton.searchTracks(queryString)
    .then(r => {

      debug(JSON.stringify(r, null, 2))

      const items = r.body.tracks.items
      const response = {
        status: 'success',
        items
      }

      if (!items.length) {
        response.status = 'failure'
      }

      return response
    })
    .catch(err => {
      Logger.error({ error: err, stack: err.stack })
      return { status: 'failure' }
    })
}

function _addTrackToTargetPlaylist(trackId) {

  debug(`Making request.`, `playlistUser: ${config.get('spotify.playlistUser')}`, 
    `playlistId: ${config.get('spotify.targetPlaylist')}`, 
    `trackId: ${trackId}`
  )

  return SpotifyClient.addTracksToPlaylist(
    config.get('spotify.playlistUser'),
    config.get('spotify.targetPlaylist'),
    `spotify:track:${trackId}`
  )
    .then(r => {
      debug(JSON.stringify(r, null, 2))
      return { status: Constants.RESULT.STATUS.SUCCESS }
    })
    .catch(err => {
      Logger.error({err, stack: err.stack})
      return { result: Constants.RESULT.STATUS.FAILURE }
    })
}

function _getTrackFromId(trackId) {
  return co(function* () {
    const response = yield SpotifyClient.singleton.getTracks([trackId])
    return response.body.tracks[0]
  })()
}

class Spotify {

  constructor(spotifyUserId) {
    this.id = spotifyUserId
    this.storage = new SpotifyStorage(spotifyUserId)
  }

  static createAuthorizeURL(state) {

    const scopes = ['playlist-modify-public', 'playlist-modify-private']
    state = state || Date.now()

    return SpotifyClient.singleton.createAuthorizeURL(scopes, state)
  }

  static authorizationCodeGrant() {
    return SpotifyClient.singleton.authorizationCodeGrant(...arguments)
  }

  static getUserDataFromAccessToken(accessToken) {
    return co(function* () {

      const client = SpotifyClient.new()
      client.setAccessToken(accessToken)

      const response = yield client.getMe()

      if (response.statusCode >= 200 && response.statusCode < 400) {
        return response.body
      }
    })()
  }

  static addTrackToTargetPlaylist(spotifyUserId, trackId) {
    return co(function* () {

      

    })()
  }

  static getTrackFromId(trackId) {
    return _getTrackFromId(trackId)
  }

  static search(queryString) {
    return _search(queryString)
  }
}

module.exports = Spotify
