var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'client/js');
var APP_DIR = path.resolve(__dirname, 'client/react');

var config = {
  entry: [
    APP_DIR + '/component-directory.jsx',
  ],
  output: {
    path: BUILD_DIR,
    filename: 'react-components.js'
  },

  module : {
    loaders : [
      {
        test : /\.jsx$/,
        include : APP_DIR,
        loader : 'babel-loader'
      },
      {
        test : /\.js$/,
        include : APP_DIR,
        loader : 'babel-loader'
      }
    ]
  }
};

module.exports = config;