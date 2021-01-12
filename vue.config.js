// Configuration for the demo application, i.e., yarn serve
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')

module.exports = {
  configureWebpack: {
    devServer: {
      watchOptions: {
        ignored: [/node_modules/],
      }
    },
    plugins: [
      new VuetifyLoaderPlugin(),
    ],
  },
}
