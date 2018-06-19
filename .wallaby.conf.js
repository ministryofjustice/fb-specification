module.exports = () => ({
  files: [
    { pattern: 'data/**/*.json', load: false },
    { pattern: 'lib/**/*.js', load: false },
    "!lib/**/*.unit.spec.js",
    { pattern: 'tests/**/*.js', load: false },
    "!tests/**/*.unit.spec.js",
    { pattern: 'specifications/**/*.json', load: false },
    { pattern: 'index.js', load: false }
  ],
  tests: [
    'tests/**/*.unit.spec.js',
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
