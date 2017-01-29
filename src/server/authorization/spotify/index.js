'use strict'

const debug = require('debug')('taptapboom:authorization:spotify')
const express = require('express')
const co = require('bluebird').coroutine
const moment = require('moment')

const SpotifyUser = require('src/storage/spotifyUser')
const SlackTeam = require('src/storage/slackTeam')
const Constants = require('src/constants')
const Spotify = require('src/spotify/app')
const Redis = require('src/db/redis')

const router = express.Router({ mergeParams: true })

router.get('/', (req, res, next) => {
  return co(function* () {
    return res.redirect('/api/auth/spotify/authorize')
  })()
    .catch(next)
})

router.get('/authorize', (req, res, next) => {
  return co(function* () {

    const scopes = ['playlist-modify-public', 'playlist-modify-private']
    const state  = Date.now()
    const authoriseUri = Spotify.createAuthorizeURL(scopes, state)

    debug(`Authorization Uri generated: ${authoriseUri}`)

    res.redirect(authoriseUri)
  })()
    .catch(next)
})

router.get('/callback', (req, res, next) => {
  return co(function* () {

    debug(`Spotify callback called with ${JSON.stringify(req.query)}`)
    const code = req.query.code
    const state = req.query.state

    const slackTeam = new SlackTeam(state)
    yield slackTeam.fetch()

    const data = yield Spotify.authorizationCodeGrant(code)
    const tokensReceivedAt = new Date()
    debug(`Spotify access and refresh tokens received: ${JSON.stringify(data)}`)

    const spotifyUserData = yield Spotify.getUserDataFromAccessToken(data.body.access_token)
    debug(`Spotify user retrieved: ${JSON.stringify(spotifyUserData)}`)

    const spotifyUser = new SpotifyUser(spotifyUserData.id)
    spotifyUser.set('authorization', {
      accessToken: data.body.access_token,
      refreshToken: data.body.refresh_token,

      /*
        Add the amount of time given for expiration to the time when the tokens were received
        to get the time at which tokens will expire. This function should not take 60 seconds to
        run but taking an apocalyptic cased scenario, we're deduction 60 seconds from the expiration
        time. This means all tokens will expire 60 seconds earlier than usual.
       */
      validTill: moment(tokensReceivedAt).add('seconds', data.body.expires_in - 60).toDate()
    })

    yield spotifyUser.save()

    slackTeam.set('spotify.user', spotifyUser.getId())
    yield slackTeam.save()

    return res.redirect('/')
  })()
    .catch(next)
})

module.exports = router
