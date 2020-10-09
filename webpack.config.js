const path = require('path');
module.exports = {
  mode: 'development',
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js',
    library: 'TypedBTree',
    libraryTarget: 'umd',
    globalObject: 'this',
    umdNamedDefine: true,

  },
  resolve: {
    extensions: [".webpack.js", ".web.js", ".ts", ".js"]
  },
  module: {
    rules: [{ test: /\.ts$/, loader: "ts-loader" }]
  }
}