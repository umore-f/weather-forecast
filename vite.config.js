import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'
// import process from 'node:process'

// https://vitejs.dev/config/
export default defineConfig(() => {
  // 加载环境变量
  // const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      vue(),
      vueDevTools(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
    // 重要：对于 Vercel 部署，使用相对路径
    base: '/',
    build: {
      outDir: 'dist',
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks: undefined // 让 Vite 自动处理代码分割
        }
      },
      optimizeDeps: {
        include: ['jose', 'jose/dist/browser/index'],
        exclude: []
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    // server: {
    //   host: true,
    //   port: 3000,
    //   proxy: {
    //     // 和风天气代理
    //     '/qweather': {
    //       target: `https://${env.VITE_API_HOST || 'api.qweather.com'}`,
    //       changeOrigin: true,
    //       rewrite: (path) => path.replace(/^\/qweather/, '')
    //     },
    //     // OpenWeatherMap 代理
    //     '/openweather': {
    //       target: 'http://api.openweathermap.org',
    //       changeOrigin: true,
    //       rewrite: (path) => path.replace(/^\/openweather/, '/data/2.5')
    //     }
    //   }
    // }
  }
})
