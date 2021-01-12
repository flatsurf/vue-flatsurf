const config = "@vue/cli-service/webpack.config.js";

config.module.rules.push({
  test: /test\.[tj]s$/,
  use: 'mocha-loader',
  exclude: /node_modules/
})

module.exports = config;
