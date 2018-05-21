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

const {schema, invalid, verbose} = argv

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
