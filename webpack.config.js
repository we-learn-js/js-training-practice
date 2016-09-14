var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');

module.exports = {
  context: path.join(__dirname, 'src'),
  entry: "./index.bundle.js",
  output: {
    path: path.join(__dirname, 'dist'),
    filename: "index.bundle.js"
  },
  plugins: [
    new CopyWebpackPlugin([{
      from: './**/*.+(html)'
    },{
      from: '../node_modules/semantic-ui-css/semantic.min.js',
      to: 'vendor/semantic.js'
    },{
      from: '../node_modules/semantic-ui-css/semantic.min.css',
      to: 'vendor/semantic.css'
    }])
  ]
};
