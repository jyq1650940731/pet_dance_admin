import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
// 新增：引入 prettier 插件
import pluginPrettier from 'eslint-plugin-prettier'

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,js,mjs,jsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },

  // 新增：Prettier 集成配置（核心修复）
  {
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      // 禁用 ESLint 自带的引号规则，交给 Prettier 处理
      'quotes': 'off',
      // 启用 Prettier 规则，并继承 .prettierrc 配置
      'prettier/prettier': ['error', {}, { usePrettierrc: true }],
    },
  },

  skipFormatting,
])