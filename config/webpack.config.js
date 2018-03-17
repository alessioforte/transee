const path = require('path');

module.exports = {

  target: 'electron',

  entry: {
    transee: ['babel-polyfill', './src/renderer/app/entry.js'],
    preferences: ['babel-polyfill', './src/renderer/preferences/preferences.js'],
    welcome: ['babel-polyfill', './src/renderer/welcome/welcome.js']
  },

  output: {
    path: path.join(__dirname, '../dist/renderer'),
    filename: '[name].bundle.js'
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
  }

}
