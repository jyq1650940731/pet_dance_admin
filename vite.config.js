import { fileURLToPath, URL } from 'node:url'

import { loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

import path from 'path';

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import { visualizer } from 'rollup-plugin-visualizer'
import zipPack from "vite-plugin-zip-pack"

export default ({ command, mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [
      vue(),
      vueJsx(),
      vueDevTools(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')], //图标存放路径
        symbolId: 'icon-[dir]-[name]',
      }),
      // createHtmlPlugin({
      //   exclude: /^\/.*\.html$/,
      //   inject: {
      //     data: {
      //       title: env.VITE_APP_TITLE,
      //     },
      //   },
      // }),
      AutoImport({
        resolvers: [ElementPlusResolver()],
        include: [
          /\.[tj]sx?$/,
          /\.vue$/,
          /\.vue\?vue/,
          /\.md$/,
        ],
        imports: ['vue', 'vue-router', 'pinia'],
        // 关键：排除 tiptap 组件的自动解析，避免生成错误样式导入
      }),
      Components({
        resolvers: [ElementPlusResolver({
          exclude: /^ElTiptap/,
        })],
      }),
      visualizer({ open: true, filename: 'stats.html' }),
      zipPack({
        inDir: 'dist',
        outDir: './',
        outFileName: `dist.zip`,
        pathPrefix: ''
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        'images': fileURLToPath(new URL('./src/assets/images', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "sass:math";
          @use "sass:color";
          @use "@/styles/variables/variables.module.scss" as *;
          `,
          quietDeps: true,
        },
      },
    },
    server: {
      //用来配置跨域
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/dev-api': {
          target: env.VITE_SERVE,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/dev-api/, ''),
          headers: {
            "Cache-Control": "no-cache" // 不缓存响应
          }
        },
      },
    },
    base: './',
    defs: {},
    build: {
      cache: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // vue/vue-router/pinia 单独拆分
              if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
                return 'vendor/vue-vendor';
              }
              // 其余所有第三方依赖统一归为 vendor
              return 'vendor/vendor';
            }

            // if (id.includes('src/views')) {
            //   const match = id.match(/src\/views\/([^/]+)/);
            //   return match ? `pages/${match[1]}` : 'pages/other';
            // }
          },
          entryFileNames: 'assets/js/[name].[hash].js',
          chunkFileNames: 'assets/js/[name].[hash].js',
          assetFileNames: ({ name }) => {
            // 按文件后缀分类
            if (/\.(css|scss|sass)$/.test(name ?? '')) {
              return 'assets/css/[name].[hash].[ext]';
            }
            if (/\.(png|jpe?g|gif|webp|svg)$/.test(name ?? '')) {
              return 'assets/images/[name].[hash].[ext]';
            }
            if (/\.(woff2?|eot|ttf|otf)$/.test(name ?? '')) {
              return 'assets/fonts/[name].[hash].[ext]';
            }
            // 其他资源（如json）
            return 'assets/other/[name].[hash].[ext]';
          }
        }
      },
    },

  }
}
