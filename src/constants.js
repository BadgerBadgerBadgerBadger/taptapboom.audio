'use strict'

module.exports = {
  KV_JSON: {
    SQL_TABLE_NAME: 'kv_json'
  },

  MESSAGING: {
    UH_OH: `Uh-oh! Looks like we broke something 😅`, // :sweat_smile: emoji
    WAIT_FOR_IT: `Wait for it...`,

    SPOTIFY: {
      getSONG_SUCCESSFULLY_ADDED: (trackName, trackArtist) => {
        return `*${trackName}* by *${trackArtist}* has been added to the playlist! 🙌` // :hooray: emoji
      }
    }
  },

  SLACK: {
    API_URL: `https://slack.com/api`,

    INTERACTIVE: {
      SONG_SEARCH: {
        CALLBACK_ID: 'song_search',
        ACTION: {
          ADD_SONG: {
            NAME: 'add_song',
            TEXT: 'Add to Playlist'
          },
          SKIP_SEARCH: {
            NAME: 'skip_search',
            TEXT: 'Skip',
            FALLBACK_TEXT: 'You were unable to skip.'
          }
        }
      }
    }
  },

  RESULT: {
    STATUS: {
      SUCCESS: 'success',
      FAILURE: 'failure'
    }
  },

  STORAGE_KEY: {
    SLACK: {
      ACCESS_TOKEN: 'slack:token:access'
    },

    SPOTIFY: {
      ACCESS_TOKEN: 'spotify:token:access',
      REFRESH_TOKEN: 'spotify:token:refresh',
      PLAYLIST: 'spotify:playlist',
      USER: 'spotify:user'
    }
  }
}
