var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: './html/panel.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/html/',
    filename: 'panel.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  devServer: {
    proxy: {
      '/icons': {
      }
    },
  }
}
