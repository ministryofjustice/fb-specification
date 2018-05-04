#!/usr/bin/env node

const glob = require('glob-promise')
const fs = require('fs')

const jsonlint = require('jsonlint')

const appDir = process.cwd()

const errors = []
const reportError = (msg) => {
  errors.push(msg)
}

const testJSON = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, {encoding: 'utf8'}, (err, jsonContent) => {
      if (err) {
        reportError(`Could not open file - ${file}`)
        resolve()
      }
      try {
        jsonlint.parse(jsonContent)
        if (options._id) {
          const json = JSON.parse(jsonContent)
          if (json._id !== file.replace(/.*\/([^/]+)\.json$/, '$1')) {
            reportError([`Non-matching _id - ${file}`, `_id (${json._id}) does not match source filename`].join('\n'))
          }
        }
      } catch (e) {
        reportError([`Invalid json file - ${file}`, e.toString()].join('\n'))
      }
      resolve()
    })
  })
}

const testJSONFiles = (files, options) => Promise.all(files.map(file => testJSON(file, options)))
// , {_id: true}
glob(`${appDir}/components/**/*.schema.json`)
.then(files => testJSONFiles(files))
.then(() => {
  return glob(`${appDir}/components/**/data/**/*.json`)
    .then(testJSONFiles)
})
.then(() => {
  if (errors.length) {
    console.log(errors.join('\n\n'))
    process.exit(1)
  }
})