<template>
  <div class="min-h-[450px] min-w-[560px] flex-1 rounded-xl bg-white p-6 shadow-sm">
    <div class="flex items-center justify-between">
      <div class="text-[18px] font-medium">支出分类分析</div>
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

// 获取月份范围
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

// 加载图表数据
const loadChartData = async () => {
  try {
    const { default: db } = await import('@/dexie')
    const monthRange = getMonthRange(currentDate.value)

    // 获取当月支出数据
    const transactions = await db.transactions.toArray()
    const monthExpenses = transactions.filter(
      (t) =>
        t.type === '支出' && t.transactionTime >= monthRange.start && t.transactionTime <= monthRange.end + ' 23:59:59',
    )

    // 按分类汇总
    const categoryMap = new Map<string, Decimal>()
    monthExpenses.forEach((t) => {
      const current = categoryMap.get(t.transactionCategory) || new Decimal(0)
      categoryMap.set(t.transactionCategory, current.plus(t.amount))
    })

    // 转换为图表数据
    const chartData = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value: value.toDecimalPlaces(2).toNumber() }))
      .sort((a, b) => b.value - a.value)

    // 更新图表
    updateChart(chartData)
  } catch (error) {
    console.error('加载支出分类数据失败:', error)
  }
}

// 更新图表
const updateChart = (data: { name: string; value: number }[]) => {
  if (!chart) return

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)',
    },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      left: 'center',
    },
    color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4'],
    series: [
      {
        name: '支出分类',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data: data.length > 0 ? data : [{ name: '暂无数据', value: 0 }],
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
