import path from "path";
import vue from '@vitejs/plugin-vue'

const projectRoot = path.resolve(__dirname, "..");

export default {
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(projectRoot, "src"),
    }
  },
}
