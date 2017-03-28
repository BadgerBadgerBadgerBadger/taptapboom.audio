'use strict'

const express = require('express')
const request = require('request-promise')

const Spotify = require('src/spotify')

const router = express.Router({mergeParams: true})

router.post('/playlist', (req, res) => {
  return (async function () {

    await Spotify.setPlaylist(req.body['spotify-playlist'])
    res.redirect('/api/auth')
  })()
})

module.exports = router
