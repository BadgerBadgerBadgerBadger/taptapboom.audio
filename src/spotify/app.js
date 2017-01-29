'use strict'

const co = require('bluebird').coroutine
const config = require('config')
const debug = require('debug')('spotify-app')

const Constants = require('src/constants')
const Redis = require('src/db/redis')
const Logger = require('src/util/logger')
const spotifyClient = require('src/spotify/client')

function init() {
  return co(function* () {

    const refreshTokenFromStorage = yield Redis.client.getAsync(Constants.STORAGE_KEY.SPOTIFY.REFRESH_TOKEN)

    if (refreshTokenFromStorage) {

      debug(`Retrieved refresh token from storage.`)
      spotifyClient.setRefreshToken(refreshTokenFromStorage)

      yield refreshTokens()
    }
  })()
}

function refreshTokens() {
  return co(function* () {

    debug(`Refreshing tokens.`)
    const data = yield spotifyClient.refreshAccessToken()
    debug(`Refreshed tokens: ${JSON.stringify(data)}`)
    spotifyClient.setAccessToken(data.body['access_token'])

    if (data['refresh_token']) {
      debug(`New refresh token received.`)
      spotifyClient.setRefreshToken(data.body['refresh_token'])
      yield Redis.client.setAsync(Constants.STORAGE_KEY.SPOTIFY.REFRESH_TOKEN, data.body['refresh_token'])
    }
  })()
}

function search(queryString) {
  return spotifyClient.searchTracks(queryString)
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

function addTrackToTargetPlaylist(trackId) {

  debug(`Making request.`, `playlistUser: ${config.get('spotify.playlistUser')}`, 
    `playlistId: ${config.get('spotify.targetPlaylist')}`, 
    `trackId: ${trackId}`
  )

  return spotifyClient.addTracksToPlaylist(
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

function getTrackFromId(trackId) {
  return co(function* () {
    const response = yield spotifyClient.getTracks([trackId])
    return response.body.tracks[0]
  })()
}

module.exports = {
  init,
  refreshTokens,
  client: spotifyClient,
  search,
  addTrackToTargetPlaylist,
  getTrackFromId
}
