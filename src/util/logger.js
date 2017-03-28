'use strict'

const config = require('config')
const debug = require('debug')
const bunyan = require('bunyan')

const appName = config.get('app.name')
const isProduction = process.env.NODE_ENV === 'production';
const logOptions = { name: appName };

// Activate this logger only for development and leave the original for production
if (!isProduction) {

  const spawn = require('child_process').spawn;
  let bunyanCLI = spawn('bunyan', ['--color'], { stdio: ['pipe', process.stdout] });

  logOptions.stream = bunyanCLI.stdin;
}

const logger = require('bunyan').createLogger(logOptions);

logger.getDebug = key => {
  return debug(`${appName}:${key}`)
}

module.exports = logger
