const webpack = require('webpack')
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {

  target: 'electron',

  devtool: 'source-map',

  entry: {
    transee: './app/renderer/entry.js',
    preferences: './app/renderer/preferences.js',
    welcome: './app/renderer/welcome.js'
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
          presets: ['react', 'env'],

        }
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.sass$/,
        loaders: ['style', 'css', 'sass']
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: '../assets/',
              emitFile: false
            }
          }
        ]
      }
    ]
  },

  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx']
  },

  plugins: [
    // new webpack.optimize.CommonsChunkPlugin('commons'),
    // new UglifyJsPlugin(),
  ]
}
