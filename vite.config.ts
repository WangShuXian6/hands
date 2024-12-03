import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import fs from 'fs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('./localhost-key.pem'),  // 使用 mkcert 生成的私钥
      cert: fs.readFileSync('./localhost.pem'),     // 使用 mkcert 生成的证书
    },
    open: true,  // 自动打开浏览器
  },
})
