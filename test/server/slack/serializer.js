'use strict'

import test from 'ava'

const should = require('chai').should()
const sinon = require('sinon')

const ColorUtil = require('src/util/color')
const SerializerFixtures = require('test/fixtures/slack/serializer')

const Serializer = require('src/server/slack/serializer')

test('serializeSearchResults() returns `no results found` msg for empty results', () => {
  const query = 'query'
  const results = []

  const res = Serializer.serializeSearchResults(query, results)

  should.exist(res)

  const EXPECTED_RESULT = {
    response_type: 'in_channel',
    text: `Sorry. We couldn't find any results for that 😞`,
    attachments: []
  }

  res.should.deep.equal(EXPECTED_RESULT)
})

test('serializeSearchResults() serializers and appends skip attachment at the end for results', () => {
  const FIXTURE_SAMPLE_A = SerializerFixtures.getSampleA()

  sinon.stub(ColorUtil, 'getRandomColor', () => FIXTURE_SAMPLE_A.COMMON_COLOR)

  const query = FIXTURE_SAMPLE_A.QUERY
  const results = FIXTURE_SAMPLE_A.SPOTIFY_RESULTS
  const EXPECTED_RESULT = FIXTURE_SAMPLE_A.SERIALIZER_RESULT

  const res = Serializer.serializeSearchResults(query, results)

  should.exist(res)
  res.should.deep.equal(EXPECTED_RESULT)

  ColorUtil.getRandomColor.restore()
})
