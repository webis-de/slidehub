const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    app: './src/index.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
          loader: 'css-loader',
          options: { sourceMap: true, minimize: true }
        })
      }
    ]
  },
  plugins: [new ExtractTextPlugin('[name].bundle.css')],
  output: {
    path: path.resolve(__dirname, '.'),
    filename: '[name].bundle.js'
  }
};
