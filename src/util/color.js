'use strict'

const _ = require('lodash')

/**
 * Returns random color in hexcode
 * @returns {string}
 */
function getRandomColor() {
  const letters = '0123456789ABCDEF'

  let color = '#'
  color += _.times(6, () => letters[Math.floor(Math.random() * 16)]).join('')

  return color
}

module.exports = {
  getRandomColor
}
