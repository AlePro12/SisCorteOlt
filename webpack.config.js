const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  entry: "./src/app/index.js",
  output: {
    path: __dirname + "/src/public/js",
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        use: "babel-loader",
        test: /\.js$/,
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [new NodePolyfillPlugin()],
  resolve: {
    fallback: {
      fs: false,
    },
  },
};

/*
  node: {
    global: true,
    crypto: "empty",
    process: false,
    module: false,
    clearImmediate: false,
    setImmediate: false,
  },
  */
