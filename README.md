# taptapboom.audio

[![Greenkeeper badge](https://badges.greenkeeper.io/ScionOfBytes/taptapboom.audio.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/ScionOfBytes/taptapboom.audio.svg?branch=master)](https://travis-ci.org/Nwinworks/taptapboom.audio)
[![Coverage Status](https://coveralls.io/repos/github/ScionOfBytes/taptapboom.audio/badge.svg?branch=master)](https://coveralls.io/github/Nwinworks/taptapboom.audio?branch=master)

## Things You'll Need To Do
- [Create a Spotify App](https://developer.spotify.com/my-applications/#!/applications/create)
- [Create a Slack App](https://api.slack.com/slack-apps)

## Now Do This
- Click this button: [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
- Enter your Spotify and Slack credentials (you'll have received them upon creating the apps).
- Pick a name for your Heroku app and fill the APP_BASE_URI using https://<name>.herokuapp.com
- Go to your Spotify and Slack apps and enter the following:
  - For Spotify, add as redirect uri https://<name>.herokuapp.com/api/auth/spotify/callback
  - For Slack:
    - Under *OAuth & Permissions*, add Redirect Url https://<name>.herokuapp.com/api/auth/slack/callback
    - Under *Slash Commands* create a new command. Call it whatever you want but taptapboom is a great name 😉. Add as Request Url: https://<name>.herokuapp.com/api/slack/command
    - Under *Interactive Messages* add Request Url: https://<name>.herokuapp.com/api/slack/interactive

If everything went right (when does it ever not?!), your app should be ready to rumble. You just need to go to https://<name>.herokuapp.com, click on `Start` and connect a Spotify and Slack account (yes, I know, but it's worth it, promise 😘!). Then pick a Spotify playlist to send songs to, hop into slack and start sending!
