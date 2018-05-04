
const path = require('path')
var $RefParser = require('json-schema-ref-parser')
const mergeAllOf = require('json-schema-merge-allof')

const Ajv = require('ajv');
const ajv = new Ajv();

const schema = process.argv[2] || 'zap'

const doLoad = name => {
  const loaded = require(path.resolve(`components/${name}/${name}.schema.json`))
  let refSchema = JSON.stringify(loaded)
  refSchema = refSchema.replace(/"\$ref":\s*("(http:\/\/gov.uk)*\/schema\/condition\/v1.0.0#\/definitions\/booleanOrCondition")/g, '"GOSHref": $1')
  refSchema = JSON.parse(refSchema)
  return refSchema
}
const expandedSchemas = {}
const dataSchema = doLoad(schema)


const recurseResolver = (id) => {
  if (expandedSchemas[id]) {
    return Promise.resolve(expandedSchemas[id])
  }
  console.log('recursive dereffle', id)
  const schemaPathId = id.replace(/^.*?\/schema\//, '').replace(/\/v1.*$/, '')
  let refSchema = doLoad(schemaPathId)
  return dereffle(refSchema)
}
const myResolver = {
  order: 1,
  canRead: /^http:\/\/gov.uk\/schema/i,
  read: function(file, callback) {
    console.log('file http', file)
    return recurseResolver(file.url)
      .then(document => {
        callback(null, document)
      })
  }
};
const rootResolver = {
  order: 2,
  canRead: /^\//i,
  read: function(file, callback) {
    console.log('file /', file)
    return recurseResolver(`http://gov.uk${file.url}`)
      .then(document => {
        callback(null, document)
      })
  }
};

const dereffle = (schema) => {
  return $RefParser.dereference(schema, {
    resolve: {
      govuk: myResolver,
      slash: rootResolver
    },
    dereference: {
      circular: 'ignore'
    }
  })
  .then(schema => {
    let processedSchema = mergeAllOf(schema, { 
      resolvers: {
        category: function(values, path, mergeSchemas, options) {
          console.log({
            values,
            path
          })
          const flattened = values.reduce((acc, val) => acc.concat(val), [])
          return Array.from(new Set(flattened)).sort()
        }
      }})
    expandedSchemas[processedSchema.$id] = processedSchema
    console.log(Object.keys(expandedSchemas))
    return processedSchema
  })
}


dereffle(dataSchema)
  .then(function(schema) {
    let processedSchema = JSON.stringify(schema)
    processedSchema = processedSchema.replace(/GOSHref/g, '$ref')
    processedSchema = JSON.parse(processedSchema)
    console.log(JSON.stringify(processedSchema, null, 2))
    console.log('properties', JSON.stringify(Object.keys(processedSchema.properties), null, 2))
    console.log('--------')
    process.exit(0)
  })
  .catch(function(err) {
    console.error('err', err)
    process.exit(1)
  })
