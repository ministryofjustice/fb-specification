#!/usr/bin/env node
const glob = require('glob-promise')
const path = require('path')
const jsonpath = require('jsonpath')
const Ajv = require('ajv')

const {deepClone} = require('@ministryofjustice/fb-utils-node')

const schemaUtils = require('./schemaUtils')

const validateSchema = (schema, options = {}) => {
  const {getRawSchema, getSchemaDir, getSchemaPath} = schemaUtils(options.specPath)
  if (options.allErrors === undefined) {
    options.allErrors = true
  }

  const loadedSchemas = deepClone(options.schemas) || {}
  const ajv = new Ajv(options)
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
  let globalSchema
  if (schema) {
    const schemaPath = getSchemaPath(schema)
    globalSchema = require(path.resolve(schemaPath))
    const schemaDir = getSchemaDir(schema)
    if (!options.valid && !options.invalid) {
      options.path = options.path || `${schemaDir}/data`
    }
    if (!options.valid && options.invalid) {
      options.valid = []
    }
    if (!options.invalid && options.valid) {
      options.invalid = []
    }
  }
  const dataPaths = options
  const validGlob = dataPaths.valid ? Promise.resolve(dataPaths.valid) : glob(`${options.path}/valid/**.json`)
  const invalidGlob = dataPaths.invalid ? Promise.resolve(dataPaths.invalid) : glob(`${options.path}/invalid/**.json`)

  const validateData = (dataPath, schema) => {
    const data = require(path.resolve(dataPath))
    let dataSchema
    if (schema) {
      dataSchema = schema
    } else {
      if (!data._type) {
        return Promise.resolve({
          path: dataPath,
          data,
          errors: [
            {
              message: 'should have required property \'_type\''
            }
          ]
        })
      }
      dataSchema = getRawSchema(data._type)
    }
    fetchRefs(dataSchema)
    const validate = ajv.compile(dataSchema)
    let result = {
      path: dataPath,
      schema: dataSchema._name,
      data
    }
    const valid = validate(data)
    if (!valid) {
      result.errors = validate.errors
    }
    return Promise.resolve(result)
  }

  const validateDataPaths = (dataPaths, invalid) => {
    return Promise.all(dataPaths.map((dataPath) => validateData(dataPath, globalSchema)))
      .then((results) => {
        let failed
        let errors = []
        if (!invalid) {
          errors = results.filter(result => result.errors)
            .map(result => {
              result.expected = 'valid'
              return result
            })
        } else {
          errors = results.filter(result => !result.errors)
            .map(result => {
              result.expected = 'invalid'
              result.errors = [
                {
                  message: 'should be invalid'
                }
              ]
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
