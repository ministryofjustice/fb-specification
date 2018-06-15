const test = require('tape')
const glob = require('glob-promise')
const path = require('path')
const validateSchema = require('../lib/validate-schema')

const schemas = glob.sync('specifications/**/*.schema.json')
  .map(schema => path.resolve(schema))

schemas.forEach(schema => {
  const schemaName = schema.replace(/.*\//, '').replace(/\.schema\.json/, '')
  test(schemaName, t => {
    t.plan(1)

    const options = {}
    options.specs = [{path: path.resolve(__dirname, '..'), $idRoot: 'http://gov.uk/schema/v1.0.0'}]
    options.path = schema.replace(/\/[^/]+$/, '')

    return validateSchema(schema, options)
      .then(results => {
        t.is(results, undefined, 'should have no errors')
      })
  })
})
