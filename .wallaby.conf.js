module.exports = () => ({
  files: [
    { pattern: 'spec/helpers/*', load: false },
    { pattern: 'index.js', load: false }
  ],
  tests: [
    'spec/**/*.unit.spec.js',
    'lib/**/*.unit.spec.js'
  ],
  env: {
    type: 'node'
  },
  testFramework: 'tape',
  workers: {
    recycle: true,
    initial: 1,
    regular: 1
  }
})
