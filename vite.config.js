// vite.config.js
import path from "path";
import vue from '@vitejs/plugin-vue2'
import Components from "unplugin-vue-components/vite";
import { VuetifyResolver } from 'unplugin-vue-components/resolvers';

const projectRoot = __dirname;

export default {
  plugins: [
    vue(),
    Components({
      directives: false,
      dts: true,
      resolvers: [
        VuetifyResolver(),
      ],
      // Do not auto-import anything but vuetify.
      dirs: [],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(projectRoot, "src"),
    }
  },
  test: {
    deep: {
      inline: ["svgo"]
    },
    css: true,
    environment: "jsdom",
    setupFiles: "./test/jsdom.mock.js",
  },
  assetsInclude: ['**/*.txt'],
}
