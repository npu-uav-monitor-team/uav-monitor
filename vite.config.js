import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
    base: './',
    publicDir: 'public',
    plugins: [
        vue(),
        // 启用顶级js文件中的await 这个项目暂时用不到
        // topLevelAwait({
        //     // The export name of top-level await promise for each chunk module
        //     promiseExportName: '__tla',
        //     // The function to generate import names of top-level await promise in each chunk module
        //     promiseImportName: i => `__tla_${i}`
        // }),
    ],
    server: {
        port: 7070,
        host: '0.0.0.0',
        proxy: {
            // 把对/UAV的请求转到 http://localhost:8848/UAV
            '/UAV': {
                target: 'http://localhost:8848',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/UAV/, '/UAV')
            }
        }
    },
    preview: {
        port: 7070
    },
    build: {
        // 构建打包时规范js文件大小
        chunkSizeWarningLimit: 500,
        rollupOptions: {
            output: {
                // eslint-disable-next-line consistent-return
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return id.toString().split('node_modules/')[1].split('/')[0].toString();
                    }
                }
            }
        }
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
})
