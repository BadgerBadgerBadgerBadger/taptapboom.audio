'use strict'

const _ = require('lodash')

const Constants = require('src/constants')
const ColorUtil = require('src/util/color')
const Spotify = require('src/spotify')

/**
 * Serializes the spotify search response to be consumed by
 *
 * @param {String} query - Query made by the user.
 * @param {Object} results - The result of a Spotify search. Contains status and if success, an `items` array.
 * @returns {*}
 */
function serializeSearchResults(query, results) {

  if (results.status === `failure`) {

    const text = `Sorry. We couldn't find any results for that 😞`
    return {response_type: 'in_channel', text, attachments: []}
  }

  const colors = ColorUtil.generateGradient(Constants.SPOTIFY.NO_OF_RESULTS + 1) // +1 to account for the `Skip` button.

  const attachments = results.items
    .slice(0, Constants.SPOTIFY.NO_OF_RESULTS)
    .map(record => {

        const artists = Spotify.constructArtistName(record.artists)

        const response = {
          color: colors.shift(),

          title: `${record.name} - ${artists}`,
          title_link: record.external_urls.spotify,

          callback_id: Constants.SLACK.INTERACTIVE.SONG_SEARCH.CALLBACK_ID,
          actions: [
            {
              name: Constants.SLACK.INTERACTIVE.SONG_SEARCH.ACTION.ADD_SONG.NAME,
              text: Constants.SLACK.INTERACTIVE.SONG_SEARCH.ACTION.ADD_SONG.TEXT,
              type: `button`,
              value: record.id
            }
          ]
        }

        if (_.get(record, 'album.images[0].url')) {
          response.thumb_url = record.album.images[0].url
        }

        return response
      }
    )

  attachments.push({
    color: colors.shift(),
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

  const text = `Here's what we found for: *${query}* :`

  return {text, attachments}
}

module.exports = {
  serializeSearchResults
}
