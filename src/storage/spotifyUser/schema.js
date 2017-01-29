'use strict'

const Joi = require('joi')

const schema = {
  displayName: Joi.string().required(),
  spotifyUri: Joi.string().uri().required(),

  authorization: Joi.object({
    accessToken: Joi.string().required(),
    refreshToken: Joi.string().required(),
    validTill: Joi.string().isoDate().required(),
  }).required()
}

module.exports = schema
