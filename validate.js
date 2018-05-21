#!/usr/bin/env node
/* eslint-disable no-console */

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
    description: 'Name of schema to validate against',
    type: 'string',
    required: true
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
  }).argv

const {schema, invalid, verbose, allErrors} = argv

const dataPaths = {
  allErrors
}
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
}

validateSchema(schema, dataPaths)
  .then(results => {
    if (!results) {
      console.log('OK')
    } else {
      console.log(schema)
      Object.keys(results).forEach(type => {
        console.log(type)
        console.log(JSON.stringify(results[type], null, 2))
      })
      process.exit(1)
    }
  })
  .catch(e => {
    console.log('Processing the data threw an unexpected error', e)
    process.exit(1)
  })
