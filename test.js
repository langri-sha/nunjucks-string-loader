const path = require('path')
const test = require('ava')
const webpack = require('webpack')
const MemoryFs = require('memory-fs')

const resolve = (...args) => path.resolve(process.cwd(), ...args)

const compile = (template, query) => {
  const queryJson = query && `?${JSON.stringify(query)}` || ''
  const compiler = webpack({
    entry: 'test.txt',
    context: resolve('fixtures'),
    resolve: {
      root: resolve('fixtures')
    },
    output: {
      filename: 'result.html',
      path: '/'
    },
    module: {
      loaders: [{
        test: /\.txt$/,
        loader: 'raw'
      }]
    }
  })
  compiler.outputFileSystem = new MemoryFs()

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        return reject(error)
      }

      if (stats.hasErrors() || stats.hasWarnings()) {
        return reject(new Error(stats.toString({
          errorDetails: true,
          warnings: true
        })))
      }

      const result = compiler.outputFileSystem.data['result.html'].toString()
      resolve({result, stats})
    })
  })
}

test('Test Webpack compiler setup', async t => {
  const {result, stats} = await compile('test.txt')

  t.regex(result, /Tracer ammunition/)
  t.truthy(stats)
})