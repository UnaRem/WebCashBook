<template>
  <div class="grid grid-cols-12 rounded border-b border-gray-200 p-4 text-sm hover:bg-gray-50">
    <div class="col-span-6 flex items-center space-x-1">
      <div class="flex min-w-18 items-center">
        <span class="rounded bg-blue-100 px-2 py-2 text-blue-600">{{ transaction.transactionCategory }}</span>
      </div>

      <div>
        <div class="line-clamp-1 space-x-1 text-sm">
          <span>{{ transaction.productName }}</span>
        </div>
        <div class="text-xs text-gray-400">
          <span>{{ formatDateTime(transaction.transactionTime) }}</span>
        </div>
      </div>
    </div>

    <div class="col-span-3 flex flex-col">
      <div class="text-sm font-medium" :class="transaction.type === '收入' ? 'text-green-600' : 'text-red-600'">
        ¥{{ transaction.amount }}
      </div>
      <div class="line-clamp-1 text-xs text-gray-400">{{ transaction.remark || '-' }}</div>
    </div>

    <div class="flex space-x-1">
      <div class="flex items-center hover:cursor-pointer" @click="emit('edit', transaction)">
        <span class="rounded-xl bg-blue-100 px-4 py-1 text-blue-600 transition-all hover:bg-blue-200">编辑</span>
      </div>
      <div class="flex items-center hover:cursor-pointer" @click="emit('delete', transaction.id!)">
        <span class="rounded-xl bg-red-100 px-4 py-1 text-red-600 transition-all hover:bg-red-200">删除</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TransactionItem } from '@/dexie'

interface Props {
  transaction: TransactionItem
}

const { transaction } = defineProps<Props>()

const emit = defineEmits<{
  edit: [transaction: TransactionItem]
  delete: [id: number]
}>()

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
