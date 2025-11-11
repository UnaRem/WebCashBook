// .prettierrc.js

/** @type {import("prettier").Config} */
module.exports = {
  // 强制使用单引号，而非双引号
  singleQuote: true,
  // 在语句末尾添加分号 (ESLint 默认推荐)
  semi: true,
  // 箭头函数只有一个参数时也加上括号 (例如 (a) => a)
  arrowParens: 'always',
  // 对象的 key 仅在必要时才加引号
  quoteProps: 'as-needed',
  // 使用 2 个空格缩进 (必须与 .editorconfig 保持一致)
  tabWidth: 2,
  // 尾随逗号：es5（在对象、数组等中保留尾随逗号）
  trailingComma: 'es5',
  // 指定打印宽度，超过该宽度则换行
  printWidth: 100,
  // HTML/Vue/JSX 中的每行末尾不需要换行符
  htmlWhitespaceSensitivity: 'css',
  // 兼容 VUE 文件中的脚本和样式部分
  vueIndentScriptAndStyle: false,
}
