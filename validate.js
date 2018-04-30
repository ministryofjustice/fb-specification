#!/usr/bin/env node
const glob = require('glob')
const path = require('path')
const Ajv = require('ajv');
const ajv = new Ajv();

const logger = (msg, msgJSON) => {
  if (verbose) {
    console.log(msg)
    if (msgJSON) {
      console.log(JSON.stringify(msgJSON, null, 2))
    }
  }
}

const argv = require('yargs')
  .option('verbose', {
    alias: 'v',
    default: false
  })
  .option('schema', {
    alias: 's',
    type: 'string',
    required: true
  })
  .option('valid', {
    alias: 'val',
    default: false
  })
  .option('invalid', {
    alias: 'i',
    default: false
  }).argv

// console.log(argv)
// process.exit(0)
const { schema, invalid, verbose } = argv
let validSrc = ''
let invalidSrc = ''
const dataPaths = {}
if (argv._.length) {
  if (invalid) {
    dataPaths.invalid = argv._
  } else {
    dataPaths.valid = argv._
  }
} else {
  if (!schema) {
    console.log('Please specify a path')
    process.exit(1)
  }
  validSrc = `${schema}/data/valid/**.json`
  invalidSrc = `${schema}/data/invalid/**.json`
}

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
const validGlob = dataPaths.valid ? Promise.resolve(dataPaths.valid) : promisedGlob(validSrc)
const invalidGlob = dataPaths.invalid ? Promise.resolve(dataPaths.invalid) : promisedGlob(invalidSrc)

const schemaPath = schema.endsWith('.json') ? schema : path.resolve(schema, `${schema}.schema.json`)
const dataSchema = require(schemaPath)

const conditionSchema = require(path.resolve('condition/condition.schema.json'))
const definitionsSchema = require(path.resolve('definitions/definitions.schema.json'))
const validationsSchema = require(path.resolve('validations/validations.schema.json'))
const errorsSchema = require(path.resolve('errors/errors.schema.json'))
ajv.addSchema(conditionSchema)
ajv.addSchema(definitionsSchema)
ajv.addSchema(validationsSchema)
ajv.addSchema(errorsSchema)

const validateData = (dataPath) => {
  const data = require(path.resolve(dataPath))
  const validate = ajv.compile(dataSchema);
  let result
  const valid = validate(data)
  if (!valid) {
    result = {
      data: dataPath,
      errors: validate.errors
    }
  }
  return Promise.resolve(result)
}

const validateDataPaths = (dataPaths, invalid) => {
  return Promise.all(dataPaths.map(validateData))
    .then((results) => {
      let failed = false
      const errors = results.filter(result => !!result)
      if (!invalid) {
        if (errors.length) {
          failed = true
          console.log('The following files were not valid')
          console.log(errors.map(error => error.data).join('\n'))
          logger('Errors found', errors)
        }
      } else {
        if (errors.length !== results.length) {
          failed = true
          const hadErrors = errors.map(result => result.data)
          const incorrectlyValid = dataPaths.filter(dataPath => !hadErrors.includes(dataPath))
          console.log('The following files were not invalid')
          console.log(incorrectlyValid.join('\n'))
        }
      }
      return failed
    })
    .catch(e => {
      console.log('Validating the data threw an unexpected error', e)
    })
  }

Promise.all([validGlob, invalidGlob])
  .then(files => {
    return Promise.all([
      validateDataPaths(files[0]),
      validateDataPaths(files[1], true)
    ])
  })
  .then(results => {
    if (results.filter(result => result).length) {
      process.exit(1)
    }
    console.log('OK')
    process.exit(0)
  })
  .catch(e => {
    console.log('Processing the data threw an unexpected error', e)
  })
