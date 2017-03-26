'use strict'

const co = require('bluebird').coroutine
const config = require('config')

const Constants = require('src/constants')
const Kv = require('src/kv')
const Logger = require('src/util/logger')
const spotifyClient = require('src/spotify/client')

const debug = Logger.getDebug('spotify-app')

const local = {
  state: {
    connectedPlaylist: false,
    connected: false
  },
  user: null,
  playlist: null
}

function authorize(code) {
  return co(function* () {

    const data = yield spotifyClient.authorizationCodeGrant(code)
    debug(`Spotify access and refresh tokens received.`)

    spotifyClient.setAccessToken(data.body['access_token'])
    spotifyClient.setRefreshToken(data.body['refresh_token'])

    yield Promise.all([
      Kv.setAsync(Constants.STORAGE_KEY.SPOTIFY.ACCESS_TOKEN, data.body['access_token']),
      Kv.setAsync(Constants.STORAGE_KEY.SPOTIFY.REFRESH_TOKEN, data.body['refresh_token']),
      getUser()
    ])
    debug(`Spotify access and refresh tokens stored. User data updated.`)

    local.state.connected = true
  })()
}

function init() {
  return co(function* () {

    const refreshTokenFromStorage = yield Kv.getAsync(Constants.STORAGE_KEY.SPOTIFY.REFRESH_TOKEN)

    if (!refreshTokenFromStorage) {
      return
    }

    debug(`Retrieved refresh token from storage.`)
    spotifyClient.setRefreshToken(refreshTokenFromStorage)

    local.playlist = JSON.parse(yield Kv.getAsync(Constants.STORAGE_KEY.SPOTIFY.PLAYLIST))
    local.user = JSON.parse(yield Kv.getAsync(Constants.STORAGE_KEY.SPOTIFY.USER))

    yield refreshTokens()
    local.state.connected = true

    if (!local.user) {
      yield getUser()
    }

    if (local.playlist) {
      local.state.connectedPlaylist = true
    }

  })()
}

function refreshTokens() {
  return co(function* () {

    debug(`Refreshing tokens.`)
    const data = yield spotifyClient.refreshAccessToken()
    debug(`Refreshed tokens.`)
    spotifyClient.setAccessToken(data.body['access_token'])
    yield Kv.setAsync(Constants.STORAGE_KEY.SPOTIFY.ACCESS_TOKEN, data.body['access_token'])

    if (data['refresh_token']) {
      debug(`New refresh token received.`)
      spotifyClient.setRefreshToken(data.body['refresh_token'])

      yield Kv.setAsync(Constants.STORAGE_KEY.SPOTIFY.REFRESH_TOKEN, data.body['refresh_token'])
    }
  })()
}

function getUser() {
  return co(function* () {

    if (local.user) {
      return local.user
    }

    local.user = JSON.parse(yield Kv.getAsync(Constants.STORAGE_KEY.SPOTIFY.USER))

    if (!local.user) {
      local.user = (yield spotifyClient.getMe()).body
      yield Kv.setAsync(Constants.STORAGE_KEY.SPOTIFY.USER, JSON.stringify(local.user))
    }

    return local.user
  })()
}

function search(queryString) {
  return spotifyClient.searchTracks(queryString)
    .then(r => {

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

  debug(`Making request.`, `playlistUser: ${local.user.id}`, `playlistId: ${local.playlist.id}`, `trackId: ${trackId}`)
  debug(local.user.id, local.playlist.id, [`spotify:track:${trackId}`])

  return spotifyClient.addTracksToPlaylist(local.user.id, local.playlist.id, [`spotify:track:${trackId}`])
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

function getAvailablePlaylists() {
  return spotifyClient.getUserPlaylists(local.user.id)
    .then(res => res.body.items)
}

function getSelectedPlaylist() {
  return co(function* () {

    if (local.playlist) {
      return local.playlist
    }

    local.playlist = JSON.parse(yield Kv.getAsync(Constants.STORAGE_KEY.SPOTIFY.PLAYLIST))
    return local.playlist
  })()
}

function setPlaylist(playlistId) {
  return co(function* () {

    const playlist = (yield spotifyClient.getPlaylist(local.user.id, playlistId)).body

    local.playlist = {
      id: playlist.id,
      name: playlist.name
    }

    local.state.connectedPlaylist = true
    yield Kv.setAsync(Constants.STORAGE_KEY.SPOTIFY.PLAYLIST, JSON.stringify(local.playlist))
  })()
    .catch(Logger.error.bind(Logger))
}

function getArtistsFromTrack(track) {

  const majorArtist = track.artists.shift()
  let artistsName = majorArtist.name

  for (const artist of track.artists) {
    artistsName += ` ft. ${artist.name}`
  }

  return artistsName
}

function getState() {
  return local.state
}

module.exports = {
  authorize,
  getUser,
  getAvailablePlaylists,
  getSelectedPlaylist,
  setPlaylist,
  init,
  getState,
  refreshTokens,
  client: spotifyClient,
  search,
  addTrackToTargetPlaylist,
  getTrackFromId,
  getArtistsFromTrack
}
