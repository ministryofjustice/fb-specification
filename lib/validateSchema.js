#!/usr/bin/env node
const glob = require('glob')
const path = require('path')
const jsonpath = require('jsonpath')
const Ajv = require('ajv')
const ajv = new Ajv()
const {getRawSchema} = require('./schemaUtils')

const promisedGlob = (pattern) => {
  return new Promise((resolve, reject) => {
    glob(pattern, (err, files) => {
      if (err) {
        reject(err)
      } else {
        resolve(files)
      }
    })
  })
}

const loadedSchemas = {}

const fetchRefs = (schema) => {
  const dollarSchema = JSON.parse(JSON.stringify(schema).replace(/"\$ref"/g, '"DOLLARref"'))
  const refs = jsonpath.query(dollarSchema, '$..DOLLARref')
    .filter(ref => !ref.startsWith('#'))
    .map(ref => ref.replace(/#.*/, ''))
    .filter((item, pos, arr) => arr.indexOf(item) === pos)
    .map(ref => ref.replace(/.*schema\/v\d+\.\d+\.\d+\//, ''))
  refs.forEach(ref => {
    if (!loadedSchemas[ref]) {
      loadedSchemas[ref] = getRawSchema(ref)
      try {
        ajv.addSchema(loadedSchemas[ref])
      } catch (e) {
        /* continue regardless of ajv loading error */
      }
      fetchRefs(loadedSchemas[ref])
    }
  })
}

const validateSchema = (schema, options = {}) => {
  const schemaPathDir = schema.replace(/(.*)\.definition$/, 'definition/$1')
  const schemaPath = schema.endsWith('.json') ? schema : path.resolve('specifications', schemaPathDir, `${schema}.schema.json`)
  const schemaDir = schemaPath.replace(/\/*[^/]+\.json$/, '')
  const dataSchema = require(schemaPath)
  if (!options.valid && !options.invalid) {
    options.path = options.path || `${schemaDir}/data`
  }
  if (!options.valid && options.invalid) {
    options.valid = []
  }
  if (!options.invalid && options.valid) {
    options.invalid = []
  }
  const dataPaths = options
  const validGlob = dataPaths.valid ? Promise.resolve(dataPaths.valid) : promisedGlob(`${options.path}/valid/**.json`)
  const invalidGlob = dataPaths.invalid ? Promise.resolve(dataPaths.invalid) : promisedGlob(`${options.path}/invalid/**.json`)

  fetchRefs(dataSchema)

  const validateData = (dataPath) => {
    const data = require(path.resolve(dataPath))
    const validate = ajv.compile(dataSchema)
    let result = {
      path: dataPath,
      data
    }
    const valid = validate(data)
    if (!valid) {
      result.errors = validate.errors
    }
    return Promise.resolve(result)
  }

  const validateDataPaths = (dataPaths, invalid) => {
    return Promise.all(dataPaths.map(validateData))
      .then((results) => {
        let failed
        let errors = []
        if (!invalid) {
          errors = results.filter(result => result.errors)
        } else {
          errors = results.filter(result => !result.errors)
            .map(result => {
              result.errors = ['Data is not invalid']
              return result
            })
        }
        if (errors.length) {
          failed = errors
        }
        return failed
      })
  }

  return Promise.all([validGlob, invalidGlob])
    .then(files => {
      return Promise.all([
        validateDataPaths(files[0]),
        validateDataPaths(files[1], true)
      ])
    })
    .then(results => {
      if (results.filter(result => result).length) {
        let returnBundle = {
          valid: results[0],
          invalid: results[1]
        }
        if (!returnBundle.valid) {
          delete returnBundle.valid
        }
        if (!returnBundle.invalid) {
          delete returnBundle.invalid
        }
        return returnBundle
      }
      return undefined
    })
}

module.exports = validateSchema
