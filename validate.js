#!/usr/bin/env node
const glob = require('glob-promise')
const validateSchema = require('./lib/validateSchema')

const logStdout = (msg) => {
  const formattedMsg = typeof msg === 'object' ? JSON.stringify(msg, null, 2) : msg
  process.stdout.write(`${formattedMsg}\n`)
}

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
    description: 'Show all errors instead of failing fast on first',
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

const {schema, invalid, directory, quiet, allErrors} = argv

const dataPaths = {
  allErrors
}
let files
if (argv._.length) {
  const firstArg = argv._[0]
  if (firstArg.includes('*')) {
    logStdout(`No json files found matching ${argv._[0]}`)
    process.exit(1)
  }
  files = argv._
  if (argv._.length === 1 && !firstArg.endsWith('.json')) {
    files = glob.sync(`${firstArg}/*.json`)
    if (!files.length) {
      logStdout(`No json files found in ${directory}`)
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
      logStdout('OK')
    } else {
      if (quiet) {
        Object.keys(results).forEach(type => {
          logStdout(`Expected to be ${type} but not`)
          results[type].forEach(result => {
            logStdout(`- ${result.path}`)
          })
        })
      } else {
        Object.keys(results).forEach(type => {
          logStdout(`Expecting ${type} input`)
          logStdout(results[type])
        })
      }
      process.exit(1)
    }
  })
  .catch(e => {
    logStdout('Processing the data threw an unexpected error', e)
    process.exit(1)
  })
