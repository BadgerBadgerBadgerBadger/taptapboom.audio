'use strict'

const _ = require('lodash')

const SERIALIZER_SAMPLE_A = {
  QUERY: 'Aristocrats',
  SPOTIFY_RESULTS: [
    {
      "album": {
        "images": [
          {
            "height": 640,
            "url": "https://i.scdn.co/image/254a53e0c96b969e716003738a11ca53e983868c",
            "width": 640
          },
          {
            "height": 300,
            "url": "https://i.scdn.co/image/1388a0f43bb650cae770867645bd24cb0cd7ab17",
            "width": 300
          }
        ]
      },
      "artists": [
        {
          "name": "The Aristocrats"
        }
      ],
      "external_urls": {
        "spotify": "https://open.spotify.com/track/5TzCDKy1ZmFZdW8100A8p9"
      },
      "id": "5TzCDKy1ZmFZdW8100A8p9",
      "name": "Bad Asteroid"
    }
  ],
  COMMON_COLOR: '#79C33E',
  SERIALIZER_RESULT: {
    "response_type": "in_channel",
    "text": "Here's what we found for: *Aristocrats*",
    "attachments": [
      {
        "color": "#79C33E",
        "thumb_url": "https://i.scdn.co/image/254a53e0c96b969e716003738a11ca53e983868c",
        "title": "Bad Asteroid - The Aristocrats",
        "title_link": "https://open.spotify.com/track/5TzCDKy1ZmFZdW8100A8p9",
        "callback_id": "song_search",
        "actions": [
          {
            "name": "add_song",
            "text": "Add to Playlist",
            "type": "button",
            "value": "5TzCDKy1ZmFZdW8100A8p9"
          }
        ]
      },
      {
        "attachment_type": "default",
        "fallback": "You were unable to skip.",
        "callback_id": "song_search",
        "actions": [
          {
            "name": "skip_search",
            "text": "Skip",
            "type": "button",
            "value": "skip"
          }
        ]
      }
    ]
  }
}

const SKIP_ATTACHMENT = {
  attachment_type: 'default',
  fallback: 'You were unable to skip.',
  callback_id: 'song_search',
  actions: [
    {
      name: 'skip_search',
      text: 'Skip',
      type: 'button',
      value: 'skip'
    }
  ]
}

function getSampleA() {
  return _.cloneDeep(SERIALIZER_SAMPLE_A)
}

function getSkipAttachment() {
  return _.cloneDeep(SKIP_ATTACHMENT)
}

module.exports = {
  getSampleA,
  getSkipAttachment
}
