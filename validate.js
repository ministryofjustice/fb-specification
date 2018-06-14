#!/usr/bin/env node
const glob = require('glob-promise')
const validateSchema = require('./lib/validate-schema')

const {FBLogger} = require('@ministryofjustice/fb-utils-node')
FBLogger.verbose(true)

const argv = require('yargs')
  .version(false)
  .option('quiet', {
    alias: 'q',
    description: 'Only show names of failing data files',
    default: false
  })
  .option('schema', {
    alias: 's',
    description: 'Validate named schema with test data',
    type: 'string'
  })
  .option('invalid', {
    alias: 'i',
    description: 'Input is expected to be invalid',
    type: 'boolean',
    default: false
  })
  .option('allErrors', {
    alias: 'a',
    description: 'Show all errors instead of failing fast on first - use --no-a to fail fast',
    type: 'boolean',
    default: true
  })
  .check((argv, options) => {
    const {directory, schema} = argv
    if (!directory && !schema && !argv._.length) {
      return false
    }
    return true
  }).argv

const {schema, invalid, directory, quiet, allErrors} = argv

const dataPaths = {
  allErrors
}
let files
if (argv._.length) {
  const firstArg = argv._[0]
  if (firstArg.includes('*')) {
    FBLogger(`No json files found matching ${argv._[0]}`)
    process.exit(1)
  }
  files = argv._
  if (argv._.length === 1 && !firstArg.endsWith('.json')) {
    files = glob.sync(`${firstArg}/*.json`)
    if (!files.length) {
      FBLogger(`No json files found in ${directory}`)
      process.exit(1)
    }
  }
}
if (files) {
  if (invalid) {
    dataPaths.invalid = files
  } else {
    dataPaths.valid = files
  }
}

validateSchema(schema, dataPaths)
  .then(results => {
    if (!results) {
      FBLogger('OK')
    } else {
      if (quiet) {
        Object.keys(results).forEach(type => {
          FBLogger(`Expected to be ${type} but not`)
          results[type].forEach(result => {
            FBLogger(`- ${result.path}`)
          })
        })
      } else {
        Object.keys(results).forEach(type => {
          FBLogger(`Expecting ${type} input`)
          FBLogger(results[type])
        })
      }
      process.exit(1)
    }
  })
  .catch(e => {
    FBLogger('Processing the data threw an unexpected error', e)
    process.exit(1)
  })
