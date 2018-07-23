const path = require('path')

const getSchemaObjs = () => {
  const schemaObjs = []
  try {
    const specsPath = __dirname.replace(/\/node_modules.*/, '')
    const packageJSON = require(path.join(specsPath, 'package.json'))
    const specs = packageJSON.specifications
    specs.path = specsPath
    schemaObjs.push(specs)
  } catch (e) {
    // no package.json
  }
  return schemaObjs
}

module.exports = getSchemaObjs
