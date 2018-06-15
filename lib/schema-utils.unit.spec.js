const test = require('tape')
const path = require('path')

const schemaUtils = require('./schema-utils')
const {FBLogger} = require('@ministryofjustice/fb-utils-node')
// FBLogger.verbose(true)

test('When ...', t => {
  t.plan(1)

  const {load} = schemaUtils([{
    path: path.resolve(__dirname, '..', 'data', 'specs-a'),
    $idRoot: 'http://gov.uk/schema/v1.0.0',
    protected: ['condition']
  }])

  const expected = require(path.resolve(__dirname, '..', 'data', 'expected', 'specs-a-expected.json'))
  load().then(schemas => {
    t.deepEqual(schemas, expected, 'it should return the correctly expanded and dereferenced schemas')
  })
})

test('When ...', t => {
  t.plan(1)

  const {load} = schemaUtils([{
    path: path.resolve(__dirname, '..', 'data', 'specs-b'),
    $idRoot: 'http://gov.uk/schema/v1.0.0/namespace'
  },
  {
    path: path.resolve(__dirname, '..', 'data', 'specs-a'),
    $idRoot: 'http://gov.uk/schema/v1.0.0',
    protected: ['condition']
  }])

  const expected = require(path.resolve(__dirname, '..', 'data', 'expected', 'specs-b-expected.json'))
  load().then(schemas => {
    FBLogger(schemas)
    t.deepEqual(schemas, expected, 'it should return the correctly expanded and dereferenced schemas')
  })
})
