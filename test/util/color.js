'use strict'

import test from 'ava'

const should = require('chai').should()

const ColorUtil = require('src/util/color')

test('getRandomColor() returns color in valid hexcode format #RRGGBB', () => {
  const res = ColorUtil.getRandomColor()

  should.exist(res)

  res.should.match(/^#[A-Fa-f0-9]{6}$/)
})
