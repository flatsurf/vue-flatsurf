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
    target: "es2015",
    lib: {
      entry: resolve(__dirname, 'src/entry.ts'),
      name: 'VueFlatsurf',
      formats: ['es', 'umd'],
      fileName: (format) => {
        if (format == "umd")
          // Force file name not to end in .cjs which confuses vue3-sfc.
          return "vue-flatsurf.umd.js";
        if (format == "es")
          return "vue-flatsurf.js";
      },
    },
    minify: false,
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
