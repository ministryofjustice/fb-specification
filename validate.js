#!/usr/bin/env node
const glob = require('glob')
const path = require('path')
const jsonpath = require('jsonpath')
const Ajv = require('ajv');
const ajv = new Ajv();
const { getRawSchema } = require('./lib/schemaUtils')

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
let schemaDir
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
  schemaDir = schema.replace(/(.*)\.definition$/, 'definition/$1')
  validSrc = `specifications/${schemaDir}/data/valid/**.json`
  invalidSrc = `specifications/${schemaDir}/data/invalid/**.json`
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

const schemaPath = schema.endsWith('.json') ? schema : path.resolve('specifications', schemaDir, `${schema}.schema.json`)
const dataSchema = require(schemaPath)

const loadedSchemas = {

}
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
      ajv.addSchema(loadedSchemas[ref])
      fetchRefs(loadedSchemas[ref])
    }
  })
}
fetchRefs(dataSchema)


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
