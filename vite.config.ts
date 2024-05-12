import { fileURLToPath, URL } from 'node:url';
import { defineConfig, UserConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import legacy from '@vitejs/plugin-legacy';
import topLevelAwait from 'vite-plugin-top-level-await';

// https://vitejs.dev/config/
export default defineConfig(({ mode }): UserConfig => {
  return {
    base: './',
    publicDir: 'public',
    envDir: './env',
    plugins: [
      vue(),
      legacy({
        targets: ['Chrome 115'],
        modernPolyfills: true,
      }),
      topLevelAwait({
        // The export name of top-level await promise for each chunk module
        promiseExportName: '__tla',
        // The function to generate import names of top-level await promise in each chunk module
        promiseImportName: (i) => `__tla_${i}`,
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: '@import "./src/assets/css/values.less";',
        },
      },
    },
    server: {
      port: 3000,
      proxy:
        mode === 'production-local'
          ? {
              '^/api/event/v1': {
                target: 'https://unicorn.org.cn',
                rewrite: (path) => path.replace(/^\/api\/event\/v1/, '/api/event/v1'),
                changeOrigin: true,
              },
              '^/api/disk': {
                target: 'http://myelin.cloud:5000',
                rewrite: (path) => path.replace(/^\/api\/disk/, ''),
                changeOrigin: true,
              },
              '^/api/dispatcher': {
                target: 'https://cephalon.cloud',
                rewrite: (path) => path.replace(/^\/api\/dispatcher/, '/dispatcher'),
                changeOrigin: true,
              },
              '^/api': {
                target: 'https://cephalon.cloud',
                rewrite: (path) => path.replace(/^\/api/, '/user-center/v1'),
                changeOrigin: true,
              },
            }
          : {
              '^/api/event/v1': {
                target: 'https://unicorn.org.cn',
                rewrite: (path) => path.replace(/^\/api\/event\/v1/, '/api/event/v1'),
                changeOrigin: true,
              },
              '^/api/disk': {
                // target: 'http://192.168.0.19:8070',
                target: 'https://www.rosabi.cn/myelin',
                rewrite: (path) => path.replace(/^\/api\/disk/, ''),
                changeOrigin: true,
              },
              '^/api/dispatcher': {
                // target: 'https://www.rosabi.cn',
                target: 'http://159.75.243.79', // rosabi ip
                // target: 'http://192.168.0.26:8040', // 后端本地 ip、端口
                rewrite: (path) => path.replace(/^\/api\/dispatcher/, '/dispatcher'),
                // rewrite: (path) => path.replace(/^\/api\/dispatcher/, ''),
                changeOrigin: true,
              },
              '^/api': {
                // target: 'https://www.rosabi.cn',
                // target: 'http://159.75.243.79', // rosabi ip
                target: 'http://192.168.1.108:8040',
                rewrite: (path) => path.replace(/^\/api/, '/v1'),
                // rewrite: (path) => path.replace(/^\/api/, '/v1'),
                changeOrigin: true,
              },
            },
    },
    build: {
      cssCodeSplit: true,
      // 生产环境移除console
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
      minify: 'terser', // build.terserOptions is specified but build.minify is not set to use Terser. Note Vite now defaults to use esbuild for minification. If you still prefer Terser, set build.minify to "terser"
      target: ['edge88', 'chrome87', 'firefox78', 'safari14'],
    },
    assetsInclude: ['**/*.mov'],
  };
});
