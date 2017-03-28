'use strict'

const _ = require('lodash')
const tinygradient = require('tinygradient')

/**
 * Returns random color in hex code.
 *
 * @returns {String}
 */
function getRandomColor() {

  const letters = '0123456789ABCDEF'

  let color = '#'
  color += _.times(6, () => letters[Math.floor(Math.random() * 16)]).join('')

  return color
}

/**
 * Generate a gradient of n colors between two random colors. If the `asc` parameter is set to true, the color gradient
 * is from lighter to darker.
 *
 * @param [n=2]
 * @param [asc=false]
 * @returns {String[]} - Array of colors represented as hex codes.
 */
function generateGradient(n = 2, asc = false) {

  const start = getRandomColor()
  const stop = getRandomColor()

  /*
    Generate a gradient between the start and stop colors with n stops and return the string version (which is the
    hex code with # like `#FFF000` that we want).
   */
  return tinygradient(start, stop)
    .rgb(n)
    .map(c => c.toHex())
}

module.exports = {
  generateGradient,
  getRandomColor
}
