const {expandSchema, getSchemaName, getSchemaDir, getRawSchema} = require('./lib/schemaUtils')
const glob = require('glob-promise')
const fs = require('fs')
const path = require('path')
var shell = require('shelljs')
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
      'component',
      'definition'
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
    const specDocPath = path.resolve('documentation')
    const getStartedDocPath = path.join(docPath, 'get-started')
    shell.cp(`${specDocPath}/get-started.md`, `${getStartedDocPath}/index.md.njk`)
    // const createCategoryDirectory = (category) => {
    //   const categoryDocPath = path.join(docPath, category)
    //   const result = mkdirp.sync(categoryDocPath)
    //   shell.rm('-rf', `${categoryDocPath}/*`);
    // }
    const categories = splitByCategory(schemas, categoryOrder)
    Object.keys(categories).forEach(category => {
      console.log(category)
      console.log('------------------------')
      console.log(categories[category].map(schema => schema.$id))
      const categoryDocPath = path.join(docPath, category)
      const result = mkdirp.sync(categoryDocPath)
      shell.rm('-rf', `${categoryDocPath}/*`)
      shell.cp(`${specDocPath}/${category}.md`, `${categoryDocPath}/index.md.njk`)
      categories[category].forEach(schema => {
        const schemaName = getSchemaName(schema)
        if (!schemaName) {
          throw new Error(`${schema.$id} has no schema name`)
        }
        const schemaDir = getSchemaDir(schemaName)
        const schemaDocDirPath = path.join(categoryDocPath, schemaName)
        mkdirp.sync(schemaDocDirPath)
        let template
        try {
          template = fs.readFileSync(`${schemaDir}/${schemaName}.njk`).toString()
        } catch(e) {}
        let examplesOutput = ''
        const addExample = (example, exampleMd) => {
          return `
${exampleMd}
{{ specExample({group: '${category}', item: '${schemaName}', example: '${example}', html: true, json: true, open: true}) }}`
        }
        if (template) {
          // console.log(template)
          const dataDir = `${schemaDir}/data/valid`
          const examples = glob.sync(`${dataDir}/*.md`)
          examples.forEach(exampleMdPath => {
            const example = exampleMdPath.replace(/.*\/(.+?)\.md$/, '$1')
            const exampleDocName = `example.${example}`.replace(/\.(.)/g, (m, m1) => m1.toUpperCase())
            const exampleMd = fs.readFileSync(exampleMdPath).toString()
            const exampleJSON = fs.readFileSync(`${dataDir}/${example}.json`).toString()
            // console.log({example})
            // console.log(exampleMd)
            // console.log(exampleJSON)
            // const exampleData = JSON.stringify(exampleJSON, null, 2)
            examplesOutput += addExample(exampleDocName, exampleMd)
            let exampleNJK = `---
layout: layout-specification.njk
---
${template}
{% set data = ${exampleJSON} %}
{{ ${schemaName}(data) }}
`
            console.log(exampleNJK)
            fs.writeFileSync(`${schemaDocDirPath}/${exampleDocName}.njk`, exampleNJK)
            shell.cp(`${dataDir}/${example}.json`, `${schemaDocDirPath}/${exampleDocName}.json`)
          })
          // shell.cp(`${schemaDir}/data/valid/*`, `${categoryDocPath}/`)
        }
        const propRows = []
        const schemaProps = schema.properties
        if (schemaProps) {
          const schemaRequired = schema.required
          const propKeys = Object.keys(schemaProps).sort((a, b) => {
            if (schemaRequired) {
              const aIsRequired = schemaRequired.includes(a)
              const bIsRequired = schemaRequired.includes(b)
              if (aIsRequired !== bIsRequired) {
                return aIsRequired ? -1 : 1
              }
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
              text: schemaRequired && schemaRequired.includes(prop) ? 'yes' : 'no'
            },{
              html: property.title
            },{
              html: property.default !== undefined ? property.default : '-'
            }])
          })
        }
        const rows = JSON.stringify(propRows, null, 2)
        const expandedSchema = ('\n```\n' + JSON.stringify(schema, null, 2) + '\n```\n').replace(/"/g, '\\"')
        const rawSchema = ('\n```\n' + JSON.stringify(getRawSchema(schemaName), null, 2) + '\n```\n').replace(/"/g, '\\"')
        const schemaDocPath = path.join(schemaDocDirPath, 'index.md.njk')
        // const categoryName = 
        fs.writeFileSync(schemaDocPath, `---
title: ${schema.title}
description: ${schema.description}
section: ${sections[category]}
aliases:
backlog_issue_id:
layout: layout-pane.njk
---

{% from "_specExample.njk" import specExample %}
{% from "table/macro.njk" import govukTable %}
{% from "details/macro.njk" import govukDetails %}

${examplesOutput}

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
