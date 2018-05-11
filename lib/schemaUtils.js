const path = require('path')
var $RefParser = require('json-schema-ref-parser')
const mergeAllOf = require('json-schema-merge-allof')

const getSchemaName = (schema) => {
  let name = schema._name
  if (!name && schema.properties && schema.properties._type) {
    name = schema.properties._type.const
  }
  return name
}
const getSchemaPath = (name) => {
  const namePath = name.endsWith('.schema.json') ? name : `components/${name}/${name}.schema.json`
  return namePath
}
const rawSchemas = {}
const getRawSchema = (name) => {
  if (!rawSchemas[name]) {
    const schemaPath = getSchemaPath(name)
    const loaded = require(path.resolve(schemaPath))
    rawSchemas[name] = loaded
  }
  return rawSchemas[name]
}

const doLoad = name => {
  const loaded = getRawSchema(name)
  let refSchema = JSON.stringify(loaded)
  refSchema = refSchema.replace(/"\$ref":\s*("(http:\/\/gov.uk)*\/schema\/condition\/v1.0.0#\/definitions\/booleanOrCondition")/g, '"CONDITIONREF": $1')
  refSchema = JSON.parse(refSchema)
  return refSchema
}
const expandedSchemas = {}


const recurseResolver = (id) => {
  if (expandedSchemas[id]) {
    return Promise.resolve(expandedSchemas[id])
  }
  // console.log('recursive dereffle', id)
  const schemaPathId = id.replace(/^.*?\/schema\//, '').replace(/\/v1.*$/, '')
  let refSchema = doLoad(schemaPathId)
  return dereffle(refSchema)
}
const myResolver = {
  order: 1,
  canRead: /^http:\/\/gov.uk\/schema/i,
  read: function(file, callback) {
    // console.log('file http', file)
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
    // console.log('file /', file)
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
          const flattened = values.reduce((acc, val) => acc.concat(val), [])
          return Array.from(new Set(flattened)).sort()
        }
      }})
    expandedSchemas[processedSchema.$id] = processedSchema
    return processedSchema
  })
}

const expandSchema = (schema) => {
  const dataSchema = doLoad(schema)
  return dereffle(dataSchema)
    .then(schema => {
      let processedSchema = JSON.stringify(schema)
      processedSchema = processedSchema.replace(/CONDITIONREF/g, '$ref')
      processedSchema = JSON.parse(processedSchema)
      return processedSchema
    })
}

module.exports = {
  getSchemaName,
  getRawSchema,
  expandSchema
}