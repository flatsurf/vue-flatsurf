import path from "path";
import vue from '@vitejs/plugin-vue2'
import raw from "vite-plugin-raw";
import { VuetifyResolver } from 'unplugin-vue-components/resolvers';
import vuetify from 'unplugin-vue-components/vite';

const projectRoot = path.resolve(__dirname, "..");

export default {
  plugins: [
    vue(),
    raw({
      match: /\.txt$/,
    }),
    vuetify({
      resolvers: [
        VuetifyResolver()
      ]
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(projectRoot, "src"),
    }
  },
}