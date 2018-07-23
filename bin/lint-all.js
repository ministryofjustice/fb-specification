#!/usr/bin/env node

const shell = require('shelljs')

shell.exec('npm-run-all -s lint:schemas lint:data')
