'use strict'

const _ = require('lodash')
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

async function authorize(code) {

  const data = await spotifyClient.authorizationCodeGrant(code)
  debug(`Spotify access and refresh tokens received.`)

  spotifyClient.setAccessToken(data.body['access_token'])
  spotifyClient.setRefreshToken(data.body['refresh_token'])

  await Promise.all([
    Kv.setAsync(Constants.STORAGE_KEY.SPOTIFY.ACCESS_TOKEN, data.body['access_token']),
    Kv.setAsync(Constants.STORAGE_KEY.SPOTIFY.REFRESH_TOKEN, data.body['refresh_token']),
    getUser()
  ])
  debug(`Spotify access and refresh tokens stored. User data updated.`)

  local.state.connected = true
}

async function init() {

  const refreshTokenFromStorage = await Kv.getAsync(Constants.STORAGE_KEY.SPOTIFY.REFRESH_TOKEN)

  if (!refreshTokenFromStorage) {
    return
  }

  debug(`Retrieved refresh token from storage.`)
  spotifyClient.setRefreshToken(refreshTokenFromStorage)

  local.playlist = JSON.parse(await Kv.getAsync(Constants.STORAGE_KEY.SPOTIFY.PLAYLIST))
  local.user = JSON.parse(await Kv.getAsync(Constants.STORAGE_KEY.SPOTIFY.USER))

  await refreshTokens()
  local.state.connected = true

  if (!local.user) {
    await getUser()
  }

  if (local.playlist) {
    local.state.connectedPlaylist = true
  }
}

async function refreshTokens() {

  debug(`Refreshing tokens.`)
  const data = await spotifyClient.refreshAccessToken()
  debug(`Refreshed tokens.`)
  spotifyClient.setAccessToken(data.body['access_token'])
  await Kv.setAsync(Constants.STORAGE_KEY.SPOTIFY.ACCESS_TOKEN, data.body['access_token'])

  if (data['refresh_token']) {
    debug(`New refresh token received.`)
    spotifyClient.setRefreshToken(data.body['refresh_token'])

    await Kv.setAsync(Constants.STORAGE_KEY.SPOTIFY.REFRESH_TOKEN, data.body['refresh_token'])
  }
}

async function getUser() {

  if (local.user) {
    return local.user
  }

  local.user = JSON.parse(await Kv.getAsync(Constants.STORAGE_KEY.SPOTIFY.USER))

  if (!local.user) {
    local.user = (await spotifyClient.getMe()).body
    await Kv.setAsync(Constants.STORAGE_KEY.SPOTIFY.USER, JSON.stringify(local.user))
  }

  return local.user
}

/**
 * @param {String} queryString
 * @returns {Promise<Object>}
 */
async function search(queryString) {

  const results = await spotifyClient.searchTracks(queryString)
  const items = _.get(results, `body.tracks.items`)

  if (_.isEmpty(items)) {
    return {status: Constants.RESULT.STATUS.FAILURE}
  }

  return {
    status: Constants.RESULT.STATUS.SUCCESS,
    items
  }
}

function addTrackToTargetPlaylist(trackId) {

  debug(`Making request.`, `playlistUser: ${local.user.id}`, `playlistId: ${local.playlist.id}`, `trackId: ${trackId}`)
  debug(local.user.id, local.playlist.id, [`spotify:track:${trackId}`])

  return spotifyClient.addTracksToPlaylist(local.user.id, local.playlist.id, [`spotify:track:${trackId}`])
    .then(r => {
      debug(JSON.stringify(r, null, 2))
      return {status: Constants.RESULT.STATUS.SUCCESS}
    })
    .catch(err => {
      Logger.error({err, stack: err.stack})
      return {result: Constants.RESULT.STATUS.FAILURE}
    })
}

async function getTrackFromId(trackId) {
  const response = await spotifyClient.getTracks([trackId])
  return response.body.tracks[0]
}

function getAvailablePlaylists() {
  return spotifyClient.getUserPlaylists(local.user.id)
    .then(res => res.body.items)
}

async function getSelectedPlaylist() {

  if (local.playlist) {
    return local.playlist
  }

  local.playlist = JSON.parse(await Kv.getAsync(Constants.STORAGE_KEY.SPOTIFY.PLAYLIST))
  return local.playlist
}

async function setPlaylist(playlistId) {

  try {
    const playlist = (await spotifyClient.getPlaylist(local.user.id, playlistId)).body

    local.playlist = {
      id: playlist.id,
      name: playlist.name
    }

    local.state.connectedPlaylist = true
    await Kv.setAsync(Constants.STORAGE_KEY.SPOTIFY.PLAYLIST, JSON.stringify(local.playlist))
  } catch (e) {
    Logger.error(e)
  }
}

/**
 * Given an array of Spotify artist objects, construct a composite artists name.
 *
 * @param {Object[]} artists
 */
function constructArtistName(artists) {

  const majorArtist = artists.shift()
  let artistsName = majorArtist.name

  for (const artist of artists) {
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
  constructArtistName
}
