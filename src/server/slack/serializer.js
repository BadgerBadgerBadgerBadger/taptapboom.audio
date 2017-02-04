'use strict'

const _ = require('lodash')

const Constants = require('src/constants')

function serializeSearchResults(query, results) {

  if (!results.length) {
    const text = `Sorry. We couldn't find any results for that 😞` // :disappointed: emoji

    return { response_type: 'in_channel', text, attachments: [] }
  }

  const attachments = _.map(
    results,
    i => {

      let artists = _.map(i.artists, a => a.name)
      artists = artists.join(' ft. ')

      return {
        color: _getRandomColor(),
        thumb_url: i.album.images[0].url,

        title: `${i.name} - ${artists}`,
        title_link: i.external_urls.spotify,

        callback_id: Constants.SLACK.INTERACTIVE.SONG_SEARCH.CALLBACK_ID,
        actions: [
          {
            name: Constants.SLACK.INTERACTIVE.SONG_SEARCH.ACTION.ADD_SONG.NAME,
            text: Constants.SLACK.INTERACTIVE.SONG_SEARCH.ACTION.ADD_SONG.TEXT,
            type: 'button',
            value: i.id
          }
        ]
      }
    }
  )
    .slice(0, 5)

  attachments.push({
    attachment_type: 'default',
    fallback: Constants.SLACK.INTERACTIVE.SONG_SEARCH.ACTION.SKIP_SEARCH.FALLBACK_TEXT,
    callback_id: Constants.SLACK.INTERACTIVE.SONG_SEARCH.CALLBACK_ID,
    actions: [
      {
        name: Constants.SLACK.INTERACTIVE.SONG_SEARCH.ACTION.SKIP_SEARCH.NAME,
        text: Constants.SLACK.INTERACTIVE.SONG_SEARCH.ACTION.SKIP_SEARCH.TEXT,
        type: 'button',
        value: 'skip'
      }
    ]
  })

  const text = `Here's what we found for: *${query}*`

  return { response_type: 'in_channel', text, attachments }
}

function _getRandomColor() {

  const letters = '0123456789ABCDEF'
  let color = '#'
  color += _.times(6, () => letters[Math.floor(Math.random() * 16)]).join('')

  return color
}

module.exports = {
  serializeSearchResults
}
