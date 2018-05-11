
const {expandSchema} = require('./lib/schemaUtils')

const schemaName = process.argv[2]
if (!schemaName) {
  console.log('Please pass a schema name')
  process.exit(1)
}

expandSchema(schemaName)
  .then(function(schema) {
    console.log(JSON.stringify(schema, null, 2))
    console.log('properties', JSON.stringify(Object.keys(schema.properties), null, 2))
    console.log('--------')
    process.exit(0)
  })
  .catch(function(err) {
    console.error('Unexpected error', err)
    process.exit(1)
  })
