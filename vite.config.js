import path, { resolve } from "path";
import vue from '@vitejs/plugin-vue';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

const projectRoot = __dirname;

export default {
  plugins: [
    vue(),
    cssInjectedByJsPlugin(),
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
  build: {
    lib: {
      entry: resolve(__dirname, 'src/entry.ts'),
      name: 'vue-flatsurf',
      fileName: 'vue-flatsurf',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
}
