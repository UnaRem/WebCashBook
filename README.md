# WebCashBook

一个基于 Vue 3 的个人记账本应用，支持账单导入、分类管理、数据可视化等功能。

A personal accounting application based on Vue 3, supporting bill import, category management, data visualization, and more.

## 功能特性 | Features

- **账单导入** - 支持拖拽导入支付宝、微信账单文件
- **交易管理** - 添加、编辑、删除交易记录，支持多条件筛选
- **分类管理** - 自定义收支分类和关键字
- **数据可视化** - 收支趋势图、支出分类饼图
- **仪表盘** - 总收入、总支出、净资产、月度结余一目了然
- **本地存储** - 使用 IndexedDB 存储数据，无需后端服务

---

- **Bill Import** - Drag and drop to import Alipay/WeChat bill files
- **Transaction Management** - Add, edit, delete transactions with multi-condition filtering
- **Category Management** - Custom income/expense categories and keywords
- **Data Visualization** - Income/expense trend charts, expense category pie charts
- **Dashboard** - Total income, total expense, net assets, monthly balance at a glance
- **Local Storage** - Uses IndexedDB for data storage, no backend required

## 技术栈 | Tech Stack

| 类别     | 技术               |
| -------- | ------------------ |
| 框架     | Vue 3 + TypeScript |
| 构建工具 | Vite               |
| 样式     | TailwindCSS        |
| 状态管理 | Pinia              |
| 路由     | Vue Router         |
| 数据库   | Dexie (IndexedDB)  |
| 图表     | ECharts            |
| 图标     | Heroicons          |
| 精确计算 | Decimal.js         |

## 快速开始 | Quick Start

### 环境要求 | Requirements

- Node.js ^20.19.0 || >=22.12.0
- Bun (推荐) 或 npm/yarn

### 安装依赖 | Install Dependencies

```sh
bun install
```

### 开发模式 | Development

```sh
bun dev
```

### 类型检查 | Type Check

```sh
bun run type-check
```

### 构建生产版本 | Build for Production

```sh
bun run build
```

### 代码检查 | Lint

```sh
bun lint
```

### 代码格式化 | Format

```sh
bun run format
```

## 项目结构 | Project Structure

```
src/
├── components/       # 组件
│   ├── DashboardTab.vue      # 仪表盘
│   ├── TransactionsTab.vue   # 交易管理
│   ├── CategoryManageTab.vue # 分类管理
│   ├── ExpenditureChart.vue  # 支出分类图表
│   ├── IncomeChart.vue       # 收支趋势图表
│   └── ...
├── composables/      # 组合式函数
├── dexie/            # 数据库定义
├── types/            # 类型定义
├── utils/            # 工具函数
└── App.vue           # 根组件
```

## 许可证 | License

MIT
