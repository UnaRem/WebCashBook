<template>
  <div class="flex flex-col space-y-4 rounded-xl bg-white p-6 shadow-sm">
    <div class="flex items-center justify-between">
      <div class="text-[18px] font-medium">最大支出</div>
      <div class="cursor-pointer text-sm text-blue-500 hover:text-blue-600" @click="router.push('/transactions')">
        查看全部
      </div>
    </div>

    <div v-if="topExpenses.length > 0">
      <TransactionItem v-for="transaction in topExpenses" :key="transaction.id" :transaction="transaction" />
    </div>
    <div v-else class="py-4 text-center text-sm text-gray-400">暂无支出记录</div>
  </div>
</template>

<script setup lang="ts">
import type { TransactionItem } from '@/dexie'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const topExpenses = ref<TransactionItem[]>([])

// 加载最大支出
const loadTopExpenses = async () => {
  try {
    const { default: db } = await import('@/dexie')
    const expenses = await db.transactions.where('type').equals('支出').reverse().sortBy('amount')

    // 取金额最大的5笔
    topExpenses.value = expenses.slice(0, 5)
  } catch (error) {
    console.error('加载最大支出失败:', error)
  }
}

onMounted(() => {
  loadTopExpenses()
})
</script>
