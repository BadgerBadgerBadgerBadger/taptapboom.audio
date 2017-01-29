'use strict'

const Storage = require('src/storage')
const Schema = require('src/storage/slackTeam/schema')

const COLLECTION_NAME = 'slack.team'

class SlackTeam extends Storage {

  constructor(teamId) {
    super(teamId, COLLECTION_NAME, Schema)
  }
}

module.exports = SlackTeam
