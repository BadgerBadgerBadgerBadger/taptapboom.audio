'use strict'

const express = require('express')

// const Serializer = require('src/server/admin/serializer')
const Spotify = require('src/spotify')

const router = express.Router({ mergeParams: true })

router.get('/spotify/search', (req, res) => {
  Spotify.search(req.query.q)
    // .then(Serializer.serializeSearchResults)
    .then(res.json.bind(res))
    .catch(err => res.send(err))
})

module.exports = router
