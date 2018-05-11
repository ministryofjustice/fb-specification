const {expandSchema, getSchemaName, getRawSchema} = require('./lib/schemaUtils')
const glob = require('glob-promise')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

const localDocPath = process.argv[2] || path.resolve('../fb-documentation')

glob('components/**/*.schema.json')
  .then(schemaList => {
    return Promise.all(schemaList.map(expandSchema))
  })
  .then(schemas => {
    return schemas
  })
  .then(schemas => {
    const partition = (array, isValid) => {
      return array.reduce(([pass, fail], elem) => {
        return isValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
      }, [[], []]);
    }
    const getByCategory = (schemas, category) => {
      return partition(schemas, schema => {
        return schema.category && schema.category.includes(category)
      })
    }
    const splitByCategory = (schemas, categories) => {
      let split = {}
      if (categories[0]) {
        const category = categories[0]
        const [matched, notMatched] = getByCategory(schemas, category)
        split[category] = matched
        split = Object.assign({}, split, splitByCategory(notMatched, categories.slice(1)))
      }
      return split
    }

    const sections = {
      configuration: 'Configuration',
      page: 'Pages',
      component: 'Components'
    }
    const categoryOrder = [
      'configuration',
      'page',
      'component'
      // 'contentPage',
      // 'formPage',
      // 'grouping',
      // 'control',
      // 'field',
      // 'content',
      // 'block',
      // 'definition'
    ]
    const docPath =  path.join(localDocPath, 'src')
    const createCategoryDirectory = (category) => {
      const categoryDocPath = path.join(docPath, category)
      const result = mkdirp.sync(categoryDocPath)
    }
    const categories = splitByCategory(schemas, categoryOrder)
    Object.keys(categories).forEach(category => {
      console.log(category)
      console.log('------------------------')
      console.log(categories[category].map(schema => schema.$id))
      const categoryDocPath = path.join(docPath, category)
      createCategoryDirectory(category)
      categories[category].forEach(schema => {
        const schemaName = getSchemaName(schema)
        if (!schemaName) {
          throw new Error(`${schema.$id} has no schema name`)
        }
        const propRows = []
        const schemaProps = schema.properties
        const schemaRequired = schema.required
        const propKeys = Object.keys(schemaProps).sort((a, b) => {
          const aIsRequired = schemaRequired.includes(a)
          const bIsRequired = schemaRequired.includes(b)
          if (aIsRequired !== bIsRequired) {
            return aIsRequired ? -1 : 1
          }
          return a > b ? 1 : -1
        })
        propKeys.forEach(prop => {
          const property = schemaProps[prop]
          propRows.push([{
            text: prop
          },{
            text: property.type
          },{
            text: schemaRequired.includes(prop) ? 'yes' : 'no'
          },{
            html: property.title
          },{
            html: property.default !== undefined ? property.default : '-'
          }])
        })
        const rows = JSON.stringify(propRows, null, 2)
        const expandedSchema = ('\n```\n' + JSON.stringify(schema, null, 2) + '\n```\n').replace(/"/g, '\\"')
        const rawSchema = ('\n```\n' + JSON.stringify(getRawSchema(schemaName), null, 2) + '\n```\n').replace(/"/g, '\\"')
        const schemaDocDirPath = path.join(categoryDocPath, schemaName)
        mkdirp.sync(schemaDocDirPath)
        const schemaDocPath = path.join(schemaDocDirPath, 'index.md.njk')
        const categoryName = 
        fs.writeFileSync(schemaDocPath, `---
title: ${schema.title}
description: ${schema.description}
section: ${sections[category]}
aliases:
backlog_issue_id:
layout: layout-pane.njk
---

{% from "table/macro.njk" import govukTable %}
{% from "details/macro.njk" import govukDetails %}

{{ govukTable({
  "caption": "Schema properties",
  "firstCellIsHeader": true,
  "head": [
    {
      "text": "Property"
    },
    {
      "text": "Type"
    },
    {
      "text": "Required"
    },
    {
      "text": "Description"
    },
    {
      "text": "Default"
    }
  ],
  "rows": ${rows}
}) }}

{{ govukDetails({
  "summaryText": "Raw schema",
  "html": "${rawSchema}"
}) }}

{{ govukDetails({
  "summaryText": "Expanded schema",
  "html": "${expandedSchema}"
}) }}

        `)
      })
    })

  })
  .catch(e => {
    console.log('Unexpected error', e)
    process.exit(1)
  })
