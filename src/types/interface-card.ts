export interface InterfaceCard {
  title: string
  description: string
  iconName: 'upload' | 'output'
  dropAction?: boolean
}

export interface TransactionRow {
  交易时间: string
  交易分类: string
  交易对方: string
  商品: string
  '收/支': string
  金额: string
  交易订单号: string
  备注: string
  [key: string]: string | undefined
}

export const interfaceCardItems: InterfaceCard[] = [
  {
    title: '账单导入',
    description: '[支持多文件]上传微信或者支付宝账单文件，可以拖动文件到此区域。',
    iconName: 'upload',
    dropAction: true,
  },
  {
    title: '数据导出',
    description: '导出账单数据',
    iconName: 'output',
  },
]
