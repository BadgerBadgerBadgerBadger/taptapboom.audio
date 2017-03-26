'use strict'

const co = require('bluebird').coroutine
const express = require('express')
const request = require('request-promise')

const Spotify = require('src/spotify/app')

const router = express.Router({ mergeParams: true })

router.post('/playlist', (req, res) => {
  return co(function* () {

    yield Spotify.setPlaylist(req.body['spotify-playlist'])
    res.redirect('/api/auth')
  })()
})

module.exports = router
