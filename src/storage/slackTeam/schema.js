'use strict'

const Joi = require('joi')

const schema = {
  teamName: Joi.string().required(),

  authorization: Joi.object({
    accessToken: Joi.string().required(),
    scope: Joi.string().required(),
    authorizingUser: Joi.string()
  }).required(),

  spotify: Joi.object({
    user: Joi.string()
  })
}

module.exports = schema
