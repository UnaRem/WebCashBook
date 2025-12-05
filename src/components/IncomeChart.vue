<template>
  <div class="min-h-[450px] min-w-[400px] flex-1 rounded-xl bg-white p-6 shadow-sm">
    <div class="flex items-center justify-between">
      <div class="text-[18px] font-medium">收支趋势分析</div>
      <div class="flex items-center gap-2">
        <button
          class="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          @click="changeMonth(-1)"
        >
          <ChevronLeftIcon class="h-5 w-5" />
        </button>
        <span class="min-w-[80px] text-center text-sm text-gray-600">{{ currentMonthLabel }}</span>
        <button
          class="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          :class="{ 'cursor-not-allowed opacity-50': isCurrentMonth }"
          :disabled="isCurrentMonth"
          @click="changeMonth(1)"
        >
          <ChevronRightIcon class="h-5 w-5" />
        </button>
      </div>
    </div>
    <div ref="chartElement" class="h-[380px] w-full"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import * as echarts from 'echarts'
import Decimal from 'decimal.js'

// 配置 Decimal.js 使用银行家舍入
Decimal.set({ rounding: Decimal.ROUND_HALF_EVEN })

type EChartsOption = echarts.EChartsOption

const chartElement = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

// 当前选择的月份
const currentDate = ref(new Date())

// 月份标签
const currentMonthLabel = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1
  return `${year}年${month}月`
})

// 是否是当前月
const isCurrentMonth = computed(() => {
  const now = new Date()
  return currentDate.value.getFullYear() === now.getFullYear() && currentDate.value.getMonth() === now.getMonth()
})

// 切换月份
const changeMonth = (delta: number) => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + delta)
  currentDate.value = newDate
}

// 获取月份的天数
const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

// 加载图表数据
const loadChartData = async () => {
  try {
    const { default: db } = await import('@/dexie')
    const transactions = await db.transactions.toArray()

    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    const daysInMonth = getDaysInMonth(currentDate.value)

    // 初始化每日数据
    const dailyIncome: Decimal[] = Array.from({ length: daysInMonth }, () => new Decimal(0))
    const dailyExpense: Decimal[] = Array.from({ length: daysInMonth }, () => new Decimal(0))
    const days: string[] = []

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(`${i}日`)
    }

    // 统计每日收支
    transactions.forEach((t) => {
      const transDate = new Date(t.transactionTime)
      if (transDate.getFullYear() === year && transDate.getMonth() === month) {
        const day = transDate.getDate() - 1
        if (day >= 0 && day < daysInMonth) {
          if (t.type === '收入') {
            dailyIncome[day] = dailyIncome[day]!.plus(t.amount)
          } else {
            dailyExpense[day] = dailyExpense[day]!.plus(t.amount)
          }
        }
      }
    })

    // 转换为数字，保留2位小数
    const roundedIncome = dailyIncome.map((v) => v.toDecimalPlaces(2).toNumber())
    const roundedExpense = dailyExpense.map((v) => v.toDecimalPlaces(2).toNumber())

    // 更新图表
    updateChart(days, roundedIncome, roundedExpense)
  } catch (error) {
    console.error('加载收支趋势数据失败:', error)
  }
}

// 更新图表
const updateChart = (days: string[], income: number[], expense: number[]) => {
  if (!chart) return

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: ['收入', '支出'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: days,
      axisLabel: {
        interval: Math.floor(days.length / 10),
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}',
      },
    },
    series: [
      {
        name: '收入',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: '#10b981',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0.05)' },
          ]),
        },
        data: income,
      },
      {
        name: '支出',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: '#ef4444',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(239, 68, 68, 0.3)' },
            { offset: 1, color: 'rgba(239, 68, 68, 0.05)' },
          ]),
        },
        data: expense,
      },
    ],
  }

  chart.setOption(option)
}

// 监听月份变化
watch(currentDate, () => {
  loadChartData()
})

onMounted(() => {
  if (chartElement.value) {
    chart = echarts.init(chartElement.value)
    loadChartData()

    // 响应窗口大小变化
    window.addEventListener('resize', () => {
      chart?.resize()
    })
  }
})
</script>
