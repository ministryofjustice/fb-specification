const test = require('tape')
const glob = require('glob-promise')
const path = require('path')
const validateSchema = require('../lib/validateSchema')

const schemas = glob.sync('specifications/**/*.schema.json')
  .map(schema => path.resolve(schema))

schemas.forEach(schema => {
  const schemaName = schema.replace(/.*\//, '').replace(/\.schema\.json/, '')
  test(schemaName, t => {
    t.plan(1)

    return validateSchema(schema)
      .then(results => {
        t.is(results, undefined, 'should have no errors')
      })
  })
})
