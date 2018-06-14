const test = require('tape')
const path = require('path')

const schemaUtils = require('./schema-utils')

test('When ...', t => {
  t.plan(1)

  const {load} = schemaUtils(path.resolve(__dirname, '..', 'data', 'specs-a'))

  const expected = require(path.resolve(__dirname, '..', 'data', 'expected', 'specs-a-expected.json'))
  load().then(schemas => {
    t.deepEqual(schemas, expected, 'it should return the correctly expanded and dereferenced schemas')
  })
})
