'use strict'

const express = require('express')

const Constants = require('src/constants')
const Spotify = require('src/spotify')
const Kv = require('src/kv')
const Logger = require('src/util/logger')

const debug = Logger.getDebug('authorization')
const router = express.Router({mergeParams: true})

router.get('/', (req, res) => {
  return (async function () {

    let accessToken = Spotify.client.getAccessToken()

    if (accessToken) {
      debug(`Found Spotify access token in memory.`)
    } else {
      accessToken = await Kv.getAsync(Constants.STORAGE_KEY.SPOTIFY.ACCESS_TOKEN)
      Spotify.client.setAccessToken(accessToken)
    }

    if (!accessToken) {
      debug(`Spotify access token not found in storage or memory. Beginning oAuth.`)
      return res.redirect('/api/auth/spotify/authorize')
    }

    return res.send(`Looks like you're good to go!`)
  })()
})

router.get('/authorize', (req, res) => {

  const scopes = [
    'playlist-read-private', 'playlist-read-collaborative',
    'playlist-modify-public', 'playlist-modify-private'
  ]
  const state = Date.now().toString()
  const authoriseURL = Spotify.client.createAuthorizeURL(scopes, state)

  res.redirect(authoriseURL)
})

router.get('/callback', (req, res) => {
  return (async function () {

    await Spotify.authorize(req.query.code)
    return res.redirect('/api/auth')
  })()
    .catch(err => res.send(err))
})

module.exports = router
