<template>
  <div class="scrollbar-hidden max-h-[calc(100vh-64px)] space-y-8 overflow-auto p-6">
    <div class="flex space-x-6">
      <DataCard
        iconName="CurrencyYenIcon"
        title="总收入"
        iconColor="income"
        :value="dashboardData.totalIncome"
        :change="dashboardData.incomeChange"
      />
      <DataCard
        iconName="CurrencyYenIcon"
        title="总支出"
        iconColor="expenditure"
        :value="dashboardData.totalExpense"
        :change="dashboardData.expenseChange"
      />
      <DataCard
        iconName="DocumentCurrencyYenIcon"
        title="净资产"
        :value="dashboardData.netAssets"
        :change="dashboardData.netAssetsChange"
      />
      <DataCard
        iconName="WalletIcon"
        title="月度结余"
        :value="dashboardData.monthlyBalance"
        :change="dashboardData.monthlyBalanceChange"
      />
    </div>

    <div class="flex space-x-6">
      <ExpenditureChart :key="refreshKey" />
      <IncomeChart :key="refreshKey" />
      <div class="flex-1 space-y-6">
        <InterfaceCard :interfaceCardItem="interfaceCardItems[0]!" dropAction @import-complete="handleImportComplete" />
        <InterfaceCard :interfaceCardItem="interfaceCardItems[1]!" />
        <!-- <AccountGroup /> -->
      </div>
    </div>

    <TranscationGroup :key="refreshKey" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { interfaceCardItems } from '@/types/interface-card'
import Decimal from 'decimal.js'

// 配置 Decimal.js 使用银行家舍入（四舍六入五成双）
Decimal.set({ rounding: Decimal.ROUND_HALF_EVEN })

// 刷新 key，用于强制重新渲染子组件
const refreshKey = ref(0)

// 仪表盘数据
const dashboardData = ref({
  totalIncome: 0,
  totalExpense: 0,
  netAssets: 0,
  monthlyBalance: 0,
  incomeChange: 0,
  expenseChange: 0,
  netAssetsChange: 0,
  monthlyBalanceChange: 0,
})

// 获取当月第一天和最后一天
const getMonthRange = (date: Date): { start: string; end: string } => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  return {
    start: firstDay.toISOString().split('T')[0]!,
    end: lastDay.toISOString().split('T')[0]!,
  }
}

// 加载仪表盘数据
const loadDashboardData = async () => {
  try {
    const { default: db } = await import('@/dexie')
    const transactions = await db.transactions.toArray()

    // 计算总收入和总支出
    let totalIncome = new Decimal(0)
    let totalExpense = new Decimal(0)
    transactions.forEach((t) => {
      if (t.type === '收入') {
        totalIncome = totalIncome.plus(t.amount)
      } else {
        totalExpense = totalExpense.plus(t.amount)
      }
    })

    // 当前月份数据
    const now = new Date()
    const currentMonth = getMonthRange(now)
    const currentMonthTransactions = transactions.filter(
      (t) => t.transactionTime >= currentMonth.start && t.transactionTime <= currentMonth.end + ' 23:59:59',
    )

    let currentMonthIncome = new Decimal(0)
    let currentMonthExpense = new Decimal(0)
    currentMonthTransactions.forEach((t) => {
      if (t.type === '收入') {
        currentMonthIncome = currentMonthIncome.plus(t.amount)
      } else {
        currentMonthExpense = currentMonthExpense.plus(t.amount)
      }
    })

    // 上个月数据
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthRange = getMonthRange(lastMonth)
    const lastMonthTransactions = transactions.filter(
      (t) => t.transactionTime >= lastMonthRange.start && t.transactionTime <= lastMonthRange.end + ' 23:59:59',
    )

    let lastMonthIncome = new Decimal(0)
    let lastMonthExpense = new Decimal(0)
    lastMonthTransactions.forEach((t) => {
      if (t.type === '收入') {
        lastMonthIncome = lastMonthIncome.plus(t.amount)
      } else {
        lastMonthExpense = lastMonthExpense.plus(t.amount)
      }
    })

    // 计算变化百分比
    const calcChange = (current: Decimal, last: Decimal) => {
      if (last.isZero()) return current.greaterThan(0) ? 100 : 0
      return current.minus(last).dividedBy(last).times(100).toDecimalPlaces(0).toNumber()
    }

    // 更新数据
    dashboardData.value = {
      totalIncome: totalIncome.toDecimalPlaces(2).toNumber(),
      totalExpense: totalExpense.toDecimalPlaces(2).toNumber(),
      netAssets: totalIncome.minus(totalExpense).toDecimalPlaces(2).toNumber(),
      monthlyBalance: currentMonthIncome.minus(currentMonthExpense).toDecimalPlaces(2).toNumber(),
      incomeChange: calcChange(currentMonthIncome, lastMonthIncome),
      expenseChange: calcChange(currentMonthExpense, lastMonthExpense),
      netAssetsChange: calcChange(totalIncome.minus(totalExpense), lastMonthIncome.minus(lastMonthExpense)),
      monthlyBalanceChange: calcChange(
        currentMonthIncome.minus(currentMonthExpense),
        lastMonthIncome.minus(lastMonthExpense),
      ),
    }
  } catch (error) {
    console.error('加载仪表盘数据失败:', error)
  }
}

// 导入完成后刷新页面数据
const handleImportComplete = (count: number) => {
  console.log(`导入完成，新增 ${count} 条记录`)
  // 刷新仪表盘数据
  loadDashboardData()
  // 刷新子组件（图表、最大支出）
  refreshKey.value++
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style lang="scss" scoped></style>
