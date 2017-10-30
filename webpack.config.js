const path = require('path');

module.exports = {

  target: 'electron',

  devtool: 'source-map',

  entry: {
    entry: './app/renderer/entry.js',
    preferences: './app/renderer/preferences.js'
  },

  output: {
    path: path.join(__dirname, 'dist/renderer'),
    filename: '[name].bundle.js'
  },

  devServer: {
    contentBase: './app/renderer',
    publicPath: 'http://localhost:8182/build/'
  },

  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js?$/,
        loader: 'eslint-loader'
      },
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        options: {
          presets: ['react', 'env']
        }
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.sass$/,
        loaders: ['style', 'css', 'sass']
      }
    ]
  },

  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx']
  }
}
