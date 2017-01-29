'use strict'

const SpotifyWebApi = require('spotify-web-api-node')
const config = require('config')

const unauthorizedClientSingleton = new SpotifyWebApi({
  clientId : config.get('spotify.clientId'),
  clientSecret : config.get('spotify.clientSecret'),
  redirectUri : config.get('spotify.redirectUri')
})

module.exports = {
  singleton: unauthorizedClientSingleton,
  new: () => {
    return new SpotifyWebApi({
      clientId : config.get('spotify.clientId'),
      clientSecret : config.get('spotify.clientSecret'),
      redirectUri : config.get('spotify.redirectUri')
    })
  }
}
