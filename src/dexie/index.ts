import Dexie from 'dexie'

// 定义表的数据类型
export interface TransactionItem {
  id?: number
  transactionId: string
  transactionTime: string
  transactionCategory: string
  counterparty: string
  amount: number
  type: string
  productName: string
  remark: string
}

export interface CategoryItem {
  id?: number
  category: string
  keywords: string[]
}

// 定义数据库类
class MyDatabase extends Dexie {
  transactions!: Dexie.Table<TransactionItem, number>
  categories!: Dexie.Table<CategoryItem, number>

  constructor() {
    super('MyDatabase')
    this.version(1).stores({
      // 语法: 'tableName': 'primaryKey, [index1], [index2], ...'
      // 键前面带 '+' 表示自增主键
      // 键前面带 '&' 表示唯一索引
      // 交易表：交易单号，交易时间，交易方，交易金额，交易类型，商品名，备注
      transactions: '++id, transactionId, transactionTime, counterparty, amount, type, productName, remark',
      // 分类表：分类名，分类关键词
      categories: '++id, category, keywords',
    })
  }
}

// 实例化数据库
const db = new MyDatabase()

// 确保数据库打开
db.open().catch((error) => {
  console.error('Failed to open database:', error)
})

// 导出以便在其他地方使用
export default db
