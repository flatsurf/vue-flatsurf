// Configuration for the demo application, i.e., yarn serve
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/vue-flatsurf/app/' : '/',
  configureWebpack: {
    plugins: [
      new VuetifyLoaderPlugin(),
    ],
  },
  chainWebpack: config => {
    config.module
      .rule('txt')
      .test(/\.txt$/)
      .use('raw-loader')
        .loader('raw-loader')
        .end();
  },
}
