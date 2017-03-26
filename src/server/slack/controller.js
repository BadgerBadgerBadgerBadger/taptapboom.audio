'use strict'

const _ = require('lodash')
const config = require('config')
const xform = require('x-www-form-urlencode')

function authorizeSlack(req, res, next) {

  const token = _getTokenFromRequest(req)

  const doesntMatchEitherToken = (token !== config.get('slack.verificationToken') && 
  token !== config.get('slack.verificationToken'))

  if (!token || doesntMatchEitherToken) {
    return next(new Error('Invalid Slack Token!'))
  }

  next()
}

function _getTokenFromRequest(req) {

  let token = _.get(req, 'body.token')

  if (!token && req.body.payload) {
    let payload = JSON.parse(xform.decode(req.body.payload))
    token = _.get(payload, 'token')
    req.body = payload
  }

  return token
}

module.exports = {
  authorizeSlack
}
