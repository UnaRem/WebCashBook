// .eslintrc.cjs 或 .eslintrc.js

/* eslint-env node */
import '@rushstack/eslint-patch/modern-module-resolution'

module.exports = {
  root: true,
  // ... 其他配置 ...

  // 确保在最后应用 'prettier' 配置
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript/recommended',
    '@vue/eslint-config-prettier/skip-formatting', // Vue 默认脚手架可能自带

    // 🌟 核心：放在数组的最后一位！
    'prettier',
  ],

  // ... 其他规则配置 ...
}
