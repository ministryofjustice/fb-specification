#!/usr/bin/env node
/* eslint-disable no-console */
const glob = require('glob-promise')
const validateSchema = require('./lib/validateSchema')

const logger = (msg, msgJSON) => {
  if (verbose) {
    console.log(msg)
    if (msgJSON) {
      console.log(JSON.stringify(msgJSON, null, 2))
    }
  }
}

const argv = require('yargs')
  .version(false)
  .option('verbose', {
    alias: 'v',
    description: 'Output verbose messages',
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
    alias: 'e',
    description: 'Show all errors instead of failing on first',
    type: 'boolean',
    default: false
  })
  .check((argv, options) => {
    const {directory, schema} = argv
    if (!directory && !schema && !argv._.length) {
      return false
    }
    return true
  }).argv

const {schema, invalid, directory, verbose, allErrors} = argv

const dataPaths = {
  allErrors
}
let files
if (argv._.length) {
  const firstArg = argv._[0]
  if (firstArg.includes('*')) {
    console.log(`No json files found matching ${argv._[0]}`)
    process.exit(1)
  }
  files = argv._
  if (argv._.length === 1 && !firstArg.endsWith('.json')) {
    files = glob.sync(`${firstArg}/*.json`)
    if (!files.length) {
      console.log(`No json files found in ${directory}`)
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
      console.log('OK')
    } else {
      Object.keys(results).forEach(type => {
        console.log(`Expecting ${type} input`)
        console.log(JSON.stringify(results[type], null, 2))
      })
      process.exit(1)
    }
  })
  .catch(e => {
    console.log('Processing the data threw an unexpected error', e)
    process.exit(1)
  })
