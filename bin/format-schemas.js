#!/usr/bin/env node

const shell = require('shelljs')

shell.exec('find specifications/**/*.schema.json | xargs -P 20 -L 1 jsonlint -qi')
