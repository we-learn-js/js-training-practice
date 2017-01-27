var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');

module.exports = {
  context: path.join(__dirname, 'src'),
  entry: "./index.bundle.js",
  output: {
    path: path.join(__dirname, 'dist'),
    filename: "index.bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: "babel",
        exclude: path.join(__dirname, "node_modules")
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([{
      from: './**/*.+(html|json|css)'
    },{
      from: './vendor/**/*.*'
    }])
  ]
};
