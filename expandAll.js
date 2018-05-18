const {expandSchema, getSchemaName, getSchemaDir, getRawSchema} = require('./lib/schemaUtils')
const glob = require('glob-promise')
const fs = require('fs')
const path = require('path')
var shell = require('shelljs')
shell.config.silent = true
const mkdirp = require('mkdirp')

const localDocPath = process.argv[2] || path.resolve('../fb-documentation')

const njks = glob.sync('specifications/*/*.njk')
let njkSource = ''
let njkBlocks = []
njks.forEach(njkPath => {
  const njkContents = fs.readFileSync(path.resolve(njkPath)).toString()
  njkSource += njkContents
  const njkName = njkPath.replace(/.*\//, '').replace(/\.njk/, '')
  njkBlocks.push(`${njkName}: ${njkName}`)
})
njkSource += `{% set blocks = {
${njkBlocks.join(',\n')}
} %}`
// console.log({njks})
glob('specifications/**/*.schema.json')
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
        if (schema._name && schema._name.endsWith('.definition')) {
          return category === 'definition'
        }
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
      component: 'Components',
      definition: 'Definitions'
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

    const copyCategory = (category, sections) => {
      const categoryDir = `${docPath}/${category}`
      shell.mkdir('-p', `${categoryDir}`)
      shell.rm('-rf', `${categoryDir}/*`)
      shell.cp(`${specDocPath}/${category}.md`, `${categoryDir}/index.md.njk`)
      const copyCategorySection = section => {
        shell.mkdir('-p', `${categoryDir}/${section}`)
        shell.cp(`${specDocPath}/${category}/${section}/${section}.md`, `${categoryDir}/${section}/index.md.njk`)
        try {
          const svgCopyResult = shell.cp(`${specDocPath}/${category}/${section}/*.svg`, `${categoryDir}/${section}/.`)
          const pngCopyResult = shell.cp(`${specDocPath}/${category}/${section}/*.png`, `${categoryDir}/${section}/.`)
          shell.mkdir('-p', `${categoryDir}/${section}/images`)
          const imagesCopyResult = shell.cp(`${specDocPath}/${category}/${section}/images/*`, `${categoryDir}/${section}/images/.`)
        } catch (e) {}
      }
      sections.forEach(copyCategorySection)
    }
    copyCategory('overview', ['basics', 'basics-example-service', 'block', 'flow', 'logic', 'schemas', 'i18n', 'multiple', 'model'])
    copyCategory('process', ['editor', 'publisher', 'runner', 'submitter'])

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
        const schemaDocDirPath = path.join(categoryDocPath, schemaName).replace(/\.definition$/, '')
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
${njkSource}
${template}
{% set data = ${exampleJSON} %}
{{ ${schemaName}(data) }}
`
            // console.log(exampleNJK)
            fs.writeFileSync(`${schemaDocDirPath}/${exampleDocName}.njk`, exampleNJK)
            shell.cp(`${dataDir}/${example}.json`, `${schemaDocDirPath}/${exampleDocName}.json`)
          })
          // shell.cp(`${schemaDir}/data/valid/*`, `${categoryDocPath}/`)
        }
        try {
          const svgCopyResult = shell.cp(`${schemaDir}/*.svg`, `${schemaDocDirPath}/.`)
        } catch (e) {}
        const schemaMdPath = `${schemaDir}/${schemaName}.schema.md`
        let schemaMd = ''
        try {
          schemaMd = fs.readFileSync(schemaMdPath).toString()
        } catch (e) {}
        let schemaProperties = ''
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

          const rows = JSON.stringify(propRows, null, 2)

          schemaProperties = `
{{ govukTable({
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
`
        }

        let theme = ''
        if (schema.category) {
          const cats = schema.category
          if (cats.includes('grouping')) {
            theme = 'grouping'
          } else if (cats.includes('option')) {
            theme = 'option'
          } else if (cats.includes('content')) {
            theme = 'content'
          } else if (cats.includes('control')) {
            theme = 'control'
          }
        }
        if (category === 'definition') {
          theme = ''
        }
        const originalSchema = getRawSchema(schemaName)
        const categoryList = (schema.category || []).filter(cat => category === 'definition' ? true : cat !== 'definition')
        const schemaCategories = categoryList.join(', ')

        const getDocsUrl = (url, title, _name) => {
          if (!_name.endsWith('.definition')) {
            if (url.startsWith('validations')) {
              url = 'definition/' + url
            } else if (_name.startsWith('page')) {
              url = 'page/' + url
            } else {
              url = 'component/' + url
            }
          }
          url = '/' + url
          return `- [${title}](${url})`
        }
        const allOf = (originalSchema.allOf || [])
                        .filter(obj => obj.$ref)
                        .map(obj => obj.$ref)
                        .map($id => {
                          let url = $id.replace(/.*\/v\d+\.\d+\.\d+\//, '').replace(/#.*/, '')
                          const name = url.replace(/definition\/(.*)/, '$1.definition')
                          const {title, _name} = getRawSchema(name)
                          return getDocsUrl(url, title, _name)
                        })
        const schemaUses = allOf.join('\n')
        const usedBy = shell.grep('-l', `"${schema.$id}"`, 'specifications/**/*.schema.json').stdout
                        .replace(/\n$/, '')
                        .split('\n')
                        .filter(src => getRawSchema(src)._name !== schema._name)
                        .map(src => {
                          let url = src.replace('specifications/', '').replace(/\/[^\/]+\.json$/, '')
                          const {title, _name} = getRawSchema(src)
                          return getDocsUrl(url, title, _name)
                        })

        schemaUsedBy = usedBy.join('\n')
        const expandedSchema = ('\n```\n' + JSON.stringify(schema, null, 2) + '\n```\n').replace(/"/g, '\\"')
        const rawSchema = ('\n```\n' + JSON.stringify(originalSchema, null, 2) + '\n```\n').replace(/"/g, '\\"')
        const schemaDocPath = path.join(schemaDocDirPath, 'index.md.njk')

        fs.writeFileSync(schemaDocPath, `---
title: ${schema.title}
description: ${schema.description}
section: ${sections[category]}
theme: ${theme}
aliases:
backlog_issue_id:
layout: layout-pane.njk
---

{% from "_specExample.njk" import specExample %}
{% from "table/macro.njk" import govukTable %}
{% from "details/macro.njk" import govukDetails %}
{% set $DesignSystem = 'https://govuk-design-system-production.cloudapps.digital' %}

${schemaMd}

${schemaProperties ? '### Properties' : ''}

${schemaProperties}

${examplesOutput ? '### Examples' : ''}

${examplesOutput}

### Schema

{{ govukDetails({
  "summaryText": "Raw schema",
  "html": "${rawSchema}"
}) }}

{{ govukDetails({
  "summaryText": "Expanded schema",
  "html": "${expandedSchema}"
}) }}

${schemaUsedBy ? '### Schema used by' : ''}

${schemaUsedBy}

${schemaUses ? '### Schema uses' : ''}

${schemaUses}

${schemaCategories ? '### Categories' : ''}

${schemaCategories}

        `)
      })
    })

  })
  .catch(e => {
    console.log('Unexpected error', e)
    process.exit(1)
  })
