#!/usr/bin/env node

const shell = require('shelljs')

shell.exec('find specifications/**/data/**/*.json | xargs -P 20 -L 1 jsonlint -q')
