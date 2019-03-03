const path = require('path')
let $RefParser = require('json-schema-ref-parser')
const mergeAllOf = require('json-schema-merge-allof')

const glob = require('glob-promise')

const schemaUtils = (specs = [{}]) => {
  const specsPath = specs[0].path || ''

  const specsMatchStr = `^(${specs.map(spec => spec.$idRoot).sort().reverse().join('|')}).+`
    .replace(/\//g, '\\/')
  const specsMatch = new RegExp(specsMatchStr)

  let protectedRefs = []

  const $idRoots = {}
  specs.forEach(spec => {
    $idRoots[spec.$idRoot] = spec.path
    if (spec.protected) {
      protectedRefs = protectedRefs.concat(spec.protected.map(protectedValue => `${spec.$idRoot}/${protectedValue}`))
    }
  })

  let protectedMatch
  if (protectedRefs.length) {
    const protectedMatchStr = `"\\$ref":\\s*("${protectedRefs.join('|')}")`
    protectedMatch = new RegExp(protectedMatchStr, 'g')
  }

  const load = () => {
    const specSchemas = `${specsPath}/specifications/**/*.schema.json`
    const schemaPaths = glob.sync(specSchemas)

    const schemas = {}
    const loadSchema = schemaPath => {
      const schema = require(schemaPath)
      return expandSchema(schema._name, {path: specsPath})
        .then(loadedSchema => {
          schemas[loadedSchema._name] = loadedSchema
        })
    }
    return Promise.all(schemaPaths.map(loadSchema)).then(() => schemas)
  }

  const getSchemaName = (schema) => {
    let name = schema._name
    if (!name && schema.properties && schema.properties._type) {
      name = schema.properties._type.const
    }
    return name
  }
  const getSchemaDir = (name) => {
    let dir = name.replace(/\./g, '/')
    return path.resolve(specsPath, 'specifications', dir)
  }
  const getSchemaPath = (name) => {
    if (name.endsWith('.schema.json')) {
      return name
    }
    const dir = getSchemaDir(name)
    const schemaName = name.replace(/\//g, '.')
    const namePath = `${dir}/${schemaName}.schema.json`
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
    if (protectedMatch) {
      refSchema = refSchema.replace(protectedMatch, '"PROTECTEDREF": $1')
    }
    refSchema = JSON.parse(refSchema)
    return refSchema
  }
  const expandedSchemas = {}

  const recurseResolver = (id) => {
    if (expandedSchemas[id]) {
      return Promise.resolve(expandedSchemas[id])
    }

    let schemaPath = id.replace(/^.*?\/schema\/v\d+\.\d+\.\d+\//, '')

    if (specsMatch) {
      const match = id.match(specsMatch)
      if (match[1]) {
        const schemaName = schemaPath.replace(/\//g, '.')
        schemaPath = `${$idRoots[match[1]]}/specifications/${schemaPath}/${schemaName}.schema.json`
      }
    }
    const refSchema = doLoad(schemaPath)
    return dereference(refSchema)
  }
  const matchedResolver = {
    order: 1,
    canRead: specsMatch,
    read: function (file, callback) {
      return recurseResolver(file.url)
        .then(document => {
          callback(null, document)
        })
    }
  }

  const dereference = (schema) => {
    return $RefParser.dereference(schema, {
      resolve: {
        $idRootMatch: matchedResolver
      },
      dereference: {
        circular: 'ignore'
      }
    })
      .then(schema => {
        let processedSchema = mergeAllOf(schema, {
          resolvers: {
            type: values => values[0],
            const: values => values[0],
            category: (values, path, mergeSchemas, options) => {
              const flattened = values.reduce((acc, val) => acc.concat(val), [])
              return Array.from(new Set(flattened)).sort()
            },
            _name: values => values[0]
          }
        })
        expandedSchemas[processedSchema.$id] = processedSchema
        return processedSchema
      })
  }

  const expandSchema = (schema) => {
    const dataSchema = doLoad(schema)
    return dereference(dataSchema)
      .then(schema => {
        let processedSchema = JSON.stringify(schema)
        processedSchema = processedSchema.replace(/PROTECTEDREF/g, '$ref')
        processedSchema = JSON.parse(processedSchema)
        return processedSchema
      })
  }

  return {
    load,
    getSchemaName,
    getSchemaDir,
    getSchemaPath,
    getRawSchema,
    expandSchema
  }
}

module.exports = schemaUtils
