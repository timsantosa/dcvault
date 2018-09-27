var webpack = require('webpack')
var path = require('path')

var BUILD_DIR = path.resolve(__dirname, 'client/js')
var APP_DIR = path.resolve(__dirname, 'client/react')

var config = {
  entry: [
    APP_DIR + '/component-directory.jsx'
  ],
  output: {
    path: BUILD_DIR,
    filename: 'react-components.js'
  },
  externals: {
    jquery: 'jQuery'
  },
  module: {
    loaders: [
      {
        loader: 'babel-loader',

        include: [
          APP_DIR
        ],

        test: /\.jsx?$/,

        query: {
          plugins: ['transform-runtime'],
          presets: ['es2015', 'react']
        }
      }
    ]
  }
}

module.exports = config
