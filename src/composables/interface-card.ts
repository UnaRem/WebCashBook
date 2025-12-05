import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { categoryMatcher } from '@/utils/category'
import type { TransactionRow } from '@/types/interface-card'
import type { TransactionItem } from '@/dexie'
import Decimal from 'decimal.js'

// 将 TransactionRow 转换为 TransactionItem
const convertToTransactionItems = (TransactionRows: TransactionRow[]): TransactionItem[] => {
  return TransactionRows.map((transaction) => ({
    transactionId: transaction['交易订单号'] || '',
    transactionCategory: transaction['交易分类'] || '',
    transactionTime: transaction['交易时间'] || '',
    counterparty: transaction['交易对方'] || '',
    amount: parseFloat(transaction['金额'] || '0'),
    type: transaction['收/支'] || '',
    productName: transaction['商品'] || '',
    remark: transaction['备注'] || '',
  }))
}

export const resolveBill = (files: File[]): Promise<TransactionItem[]> => {
  return new Promise((resolve) => {
    // 首先判断文件类型，csv使用papaparse，xlsx使用sheetjs
    const allTransactions: TransactionItem[] = []
    for (const file of files) {
      const fileName = file.name.toLowerCase()
      if (fileName.endsWith('.csv')) {
        // 处理CSV文件
        console.log('处理CSV文件:', file.name)
        Papa.parse(file, {
          skipFirstNLines: 24,
          header: true,
          encoding: 'gbk',
          complete: (results) => {
            let TransactionRows = results.data as TransactionRow[]
            // 删除最后一行异常数据
            TransactionRows.pop()
            for (const transaction of TransactionRows) {
              //    {"交易时间": "2025-11-15 15:06:08",
              //     "交易分类": "餐饮美食",
              //     "交易对方": "淘宝闪购",
              //     "对方账号": "e50***@alibaba-inc.com",
              //     "商品说明": "古茗(闽篮新天地店)外卖订单",
              //     "收/支": "支出",
              //     "金额": "5.50",
              //     "收/付款方式": "花呗",
              //     "交易状态": "交易成功",
              //     "交易订单号": "2025111522001189991415504764\t",
              //     "商家订单号": "13150600725111561969619509886\t",
              //     "备注": "",
              //     "": ""}
              // 去除字段：对方账号、收/付款方式、交易状态、商家订单号，末尾字段
              delete transaction['对方账号']
              delete transaction['收/付款方式']
              delete transaction['交易状态']
              delete transaction['商家订单号']
              delete transaction['']
              // 去除`交易单号`尾部的/t
              if (transaction['交易订单号']) {
                transaction['交易订单号'] = transaction['交易订单号'].replace(/\t+$/, '')
              }

              // 修改`商品说明`，将"商品说明"字段的值赋给"商品"字段，并删除"商品说明"字段
              // 结合交易对方和商品说明生成商品字段，如[交易对方]-商品说明
              if (transaction['商品说明']) {
                transaction['商品'] = `[${transaction['交易对方'] || ''}] - ${transaction['商品说明'] || ''}`.trim()
                delete transaction['商品说明']
              }
            }

            // 过滤`收/支`为`不计收支`的记录
            TransactionRows = TransactionRows.filter((transaction) => transaction['收/支'] !== '不计收支')

            // 需要根据字段`商品`新增字段`交易分类`
            // 使用全局分类器，根据商品内容匹配一级关键字进行分类，如果有二级关键字则进一步细分
            for (const transaction of TransactionRows) {
              if (transaction['商品']) {
                const category = categoryMatcher.matchCategory(transaction['商品'])
                transaction['交易分类'] = category || '其他'
              }
            }

            // 转换为 TransactionItem 格式并返回
            const transactionItems = convertToTransactionItems(TransactionRows)
            console.log(transactionItems)
            allTransactions.push(...transactionItems)
          },
          error: (error) => {
            console.error('CSV解析错误:', error)
          },
        })
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        // 处理Excel文件
        console.log('处理Excel文件:', fileName)
        const reader = new FileReader()
        reader.onload = async (e) => {
          const arrayBuffer = e.target?.result
          const workBook = XLSX.read(arrayBuffer, { type: 'array' })
          const workSheet = workBook.Sheets[workBook.SheetNames[0]!]
          const headers = [
            '交易时间',
            '交易类型',
            '交易对方',
            '商品',
            '收/支',
            '金额(元)',
            '支付方式',
            '当前状态',
            '交易单号',
            '商户单号',
            '备注',
          ]
          let TransactionRows = XLSX.utils.sheet_to_json<TransactionRow>(workSheet!, {
            range: 17,
            header: headers,
            defval: '',
            raw: true,
          })
          // {"交易时间": "2025-11-15 18:21:45",
          // "交易类型": "商户消费",
          // "交易对方": "京东商城平台商户",
          // "商品": "京东-订单编号343616795360",
          // "收/支": "支出",
          // "金额(元)": "¥47.50",
          // "支付方式": "招商银行储蓄卡(3511)",
          // "当前状态": "支付成功",
          // "交易单号": "4200002851202511152141016602",
          // "商户单号": "1012734925111518214400129",
          // "备注": "/"}
          // 去除字段：交易类型、支付方式、当前状态、商户单号
          for (const transaction of TransactionRows) {
            delete transaction['交易类型']
            delete transaction['支付方式']
            delete transaction['当前状态']
            delete transaction['商户单号']
          }

          // 修改字段`金额(元)`，为`金额`，并去除开头的￥
          for (const transaction of TransactionRows) {
            if (transaction['金额(元)']) {
              transaction['金额'] = transaction['金额(元)'].replace('¥', '').trim()
              delete transaction['金额(元)']
            }
          }

          // 结合交易对方和商品生成商品字段，如[交易对方] - 商品
          for (const transaction of TransactionRows) {
            if (transaction['商品']) {
              transaction['商品'] = `[${transaction['交易对方'] || ''}] - ${transaction['商品'] || ''}`.trim()
            }
          }

          // 过滤`收/支`为`/`的记录
          TransactionRows = TransactionRows.filter((transaction) => transaction['收/支'] !== '/')

          // 需要根据字段`商品`新增字段`交易分类`
          // 使用全局分类器，根据商品内容匹配一级关键字进行分类，如果有二级关键字则进一步细分
          for (const transaction of TransactionRows) {
            if (transaction['商品']) {
              const category = categoryMatcher.matchCategory(transaction['商品'])
              if (transaction['商品'].includes('京东') && new Decimal(transaction['金额']).lt(30)) {
                transaction['交易分类'] = '餐饮美食'
                continue
              }
              transaction['交易分类'] = category || '其他'
            }
          }

          // 转换为 TransactionItem 格式并返回
          const transactionItems = convertToTransactionItems(TransactionRows)
          allTransactions.push(...transactionItems)
        }
        reader.onerror = (error) => {
          console.error('文件读取错误:', error)
        }
        reader.readAsArrayBuffer(file)
      } else {
        console.log('不支持的文件类型:', file.name)
      }
    }
    resolve(allTransactions)
  })
}
