const path = require('path')

const specifications = {
  schemas: [
    {
      path: path.resolve(__dirname),
      $idRoot: 'http://gov.uk/schema/v1.0.0'
    }
  ]
}

module.exports = specifications
