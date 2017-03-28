'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const config = require('config')
const cons = require('consolidate')

const AuthorizationRouter = require('src/server/authorization/router')
const AdminRouter = require('src/server/admin/router')
const Logger = require('src/util/logger')
const SlackRouter = require('src/server/slack/router')
const SpotifyRouter = require('src/server/spotify/router')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(morgan('dev'))

app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname + '/public')

app.get('/', (req, res) => {
  res.render('index.html', {
    app: {
      baseUri: config.get('app.baseUri')
    },
    slack: {
      clientId: config.get('slack.clientId'),
      oAuthState: config.get('slack.oAuthState')
    }
  })
})

app.use(express.static(__dirname + '/public'))

app.use('/api/auth', AuthorizationRouter)
app.use('/api/admin', AdminRouter)
app.use('/api/slack', SlackRouter)
app.use('/api/spotify', SpotifyRouter)

app.use((err, req, res, next) => {
  Logger.error(err, err.stack)
})

const port = config.get('server.port')

function init() {
  app.listen(port)
  Logger.info(`ExpressJS server running on port: ${port}`)

  return app
}

module.exports = {
  init
}
