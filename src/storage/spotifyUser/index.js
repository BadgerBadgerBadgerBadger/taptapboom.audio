'use strict'

const Storage = require('src/storage')
const Schema = require('src/storage/spotifyUser/schema')

const COLLECTION_NAME = 'spotify.user'

class SpotifyUser extends Storage {

  constructor(spotifyUserId) {
    super(spotifyUserId, COLLECTION_NAME, Schema)
  }
}

module.exports = SpotifyUser
