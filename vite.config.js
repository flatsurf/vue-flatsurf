// vite.config.js
import path from "path";
import vue from '@vitejs/plugin-vue'

const projectRoot = __dirname;

export default {
  plugins: [
    vue(),
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
