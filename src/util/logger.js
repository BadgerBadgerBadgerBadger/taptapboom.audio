'use strict'

const bunyan = require('bunyan')
const isProduction = process.env.NODE_ENV === 'production'
const logOptions = { name: "taptapboom-box" }

// Activate this logger only for development and leave the original for production.
if (!isProduction) {

  const spawn = require('child_process').spawn;

  let bunyanCLI = spawn('bunyan', ['--color'], { stdio: ['pipe', process.stdout] })

  logOptions.stream = bunyanCLI.stdin
}

const log = bunyan.createLogger(logOptions)

module.exports = log
