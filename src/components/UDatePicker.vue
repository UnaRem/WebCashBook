<template>
  <div class="relative" ref="containerRef">
    <!-- 输入框触发器 -->
    <div
      class="flex cursor-pointer items-center rounded-md border border-gray-300 px-3 py-2 transition-colors focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
      :class="{ 'border-blue-500 ring-1 ring-blue-500': isOpen }"
      @click="togglePicker"
    >
      <CalendarIcon class="mr-2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        readonly
        :value="displayValue"
        :placeholder="placeholder"
        class="w-full cursor-pointer bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
      />
      <XMarkIcon
        v-if="hasValue && clearable"
        class="h-5 w-5 text-gray-400 transition-colors hover:text-gray-600"
        @click.stop="clearDate"
      />
    </div>

    <!-- 日期选择器弹出层 -->
    <Transition name="picker-fade">
      <div
        v-if="isOpen"
        ref="pickerRef"
        class="fixed z-50 w-72 rounded-xl bg-white p-4 shadow-lg ring-1 ring-gray-200"
        :style="pickerStyle"
        @wheel.prevent="handleWheel"
      >
        <!-- 单个日历面板 -->
        <div>
          <!-- 头部：年月选择 -->
          <div class="mb-4 flex items-center justify-between">
            <button
              type="button"
              class="rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-100"
              @click="prevMonth"
            >
              <ChevronLeftIcon class="h-5 w-5" />
            </button>

            <div class="flex items-center gap-2">
              <select
                v-model="currentYear"
                class="cursor-pointer rounded-md border-none bg-transparent px-2 py-1 text-sm font-medium text-gray-800 outline-none hover:bg-gray-100"
              >
                <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}年</option>
              </select>
              <select
                v-model="currentMonth"
                class="cursor-pointer rounded-md border-none bg-transparent px-2 py-1 text-sm font-medium text-gray-800 outline-none hover:bg-gray-100"
              >
                <option v-for="(month, index) in months" :key="index" :value="index">
                  {{ month }}
                </option>
              </select>
            </div>

            <button
              type="button"
              class="rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-100"
              @click="nextMonth"
            >
              <ChevronRightIcon class="h-5 w-5" />
            </button>
          </div>

          <!-- 星期标题 -->
          <div class="mb-2 grid grid-cols-7 gap-1">
            <div v-for="day in weekDays" :key="day" class="py-1 text-center text-xs font-medium text-gray-500">
              {{ day }}
            </div>
          </div>

          <!-- 日期网格 -->
          <div class="grid grid-cols-7 gap-1">
            <button
              v-for="(date, index) in calendarDays"
              :key="index"
              type="button"
              :disabled="!date.isCurrentMonth"
              class="flex h-9 w-9 items-center justify-center text-sm transition-colors"
              :class="getDayClass(date)"
              @click="selectDate(date)"
              @mouseenter="handleHover(date)"
            >
              {{ date.day }}
            </button>
          </div>
        </div>

        <!-- 底部快捷操作 -->
        <div class="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
          <div class="flex gap-2">
            <button
              type="button"
              class="text-sm text-blue-500 transition-colors hover:text-blue-600"
              @click="selectToday"
            >
              今天
            </button>
            <template v-if="range">
              <button
                type="button"
                class="text-sm text-gray-500 transition-colors hover:text-gray-600"
                @click="selectLastWeek"
              >
                近7天
              </button>
              <button
                type="button"
                class="text-sm text-gray-500 transition-colors hover:text-gray-600"
                @click="selectLastMonth"
              >
                近30天
              </button>
            </template>
          </div>
          <button
            type="button"
            class="rounded-lg bg-blue-500 px-4 py-1.5 text-sm text-white transition-colors hover:bg-blue-600"
            @click="confirmSelection"
          >
            确定
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/vue/24/outline'

// 日期范围类型
interface DateRange {
  start: string
  end: string
}

interface Props {
  modelValue?: string | DateRange
  placeholder?: string
  format?: string
  clearable?: boolean
  range?: boolean
  rangeSeparator?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '请选择日期',
  format: 'YYYY-MM-DD',
  clearable: true,
  range: false,
  rangeSeparator: ' 至 ',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | DateRange]
  change: [value: string | DateRange]
}>()

// 状态
const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const pickerRef = ref<HTMLElement | null>(null)
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())
const selectedDate = ref<Date | null>(null)

// 弹出层位置
const pickerStyle = ref<{ top: string; left: string }>({
  top: '0px',
  left: '0px',
})

// 范围选择状态
const rangeStart = ref<Date | null>(null)
const rangeEnd = ref<Date | null>(null)
const hoverDate = ref<Date | null>(null)
const isSelectingEnd = ref(false)

// 常量
const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

// 年份选项（前后10年）
const yearOptions = computed(() => {
  const currentYearValue = new Date().getFullYear()
  const years: number[] = []
  for (let i = currentYearValue - 10; i <= currentYearValue + 10; i++) {
    years.push(i)
  }
  return years
})

// 日历天数
interface CalendarDay {
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  isRangeStart: boolean
  isRangeEnd: boolean
  isInRange: boolean
  date: Date
}

// 生成日历天数的通用函数
const generateCalendarDays = (year: number, month: number): CalendarDay[] => {
  const days: CalendarDay[] = []
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDay = firstDay.getDay()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 上月填充
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDay - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    days.push({
      day,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      isRangeStart: false,
      isRangeEnd: false,
      isInRange: false,
      date: new Date(year, month - 1, day),
    })
  }

  // 当月天数
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    date.setHours(0, 0, 0, 0)
    const dateTime = date.getTime()

    // 单选模式
    const isSelected = !props.range && selectedDate.value ? dateTime === selectedDate.value.getTime() : false

    // 范围模式
    const isRangeStart = props.range && rangeStart.value ? dateTime === rangeStart.value.getTime() : false
    const isRangeEnd = props.range && rangeEnd.value ? dateTime === rangeEnd.value.getTime() : false

    // 计算是否在范围内
    let isInRange = false
    if (props.range && rangeStart.value) {
      const startTime = rangeStart.value.getTime()
      if (rangeEnd.value) {
        const endTime = rangeEnd.value.getTime()
        isInRange = dateTime > startTime && dateTime < endTime
      } else if (hoverDate.value && isSelectingEnd.value) {
        const hoverTime = hoverDate.value.getTime()
        const minTime = Math.min(startTime, hoverTime)
        const maxTime = Math.max(startTime, hoverTime)
        isInRange = dateTime > minTime && dateTime < maxTime
      }
    }

    days.push({
      day: i,
      isCurrentMonth: true,
      isToday: dateTime === today.getTime(),
      isSelected,
      isRangeStart,
      isRangeEnd,
      isInRange,
      date,
    })
  }

  // 下月填充
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      isRangeStart: false,
      isRangeEnd: false,
      isInRange: false,
      date: new Date(year, month + 1, i),
    })
  }

  return days
}

const calendarDays = computed<CalendarDay[]>(() => {
  return generateCalendarDays(currentYear.value, currentMonth.value)
})

// 是否有值
const hasValue = computed(() => {
  if (props.range) {
    const val = props.modelValue as DateRange
    return val && val.start && val.end
  }
  return !!props.modelValue
})

// 显示值
const displayValue = computed(() => {
  if (props.range) {
    const val = props.modelValue as DateRange
    if (val && val.start && val.end) {
      return `${val.start}${props.rangeSeparator}${val.end}`
    }
    return ''
  }
  return props.modelValue as string
})

// 获取日期样式类
const getDayClass = (date: CalendarDay) => {
  if (!date.isCurrentMonth) {
    return 'text-gray-300 cursor-not-allowed rounded-lg'
  }

  // 范围模式
  if (props.range) {
    if (date.isRangeStart || date.isRangeEnd) {
      return 'bg-blue-500 text-white rounded-lg'
    }
    if (date.isInRange) {
      return 'bg-blue-100 text-blue-700 rounded-none'
    }
  }

  // 单选模式
  if (date.isSelected) {
    return 'bg-blue-500 text-white hover:bg-blue-600 rounded-lg'
  }

  if (date.isToday) {
    return 'bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg'
  }

  return 'text-gray-700 hover:bg-gray-100 rounded-lg'
}

// 切换选择器
const togglePicker = () => {
  if (!isOpen.value) {
    // 先计算位置，再打开，避免动画从左上角开始
    updatePickerPosition()
    isOpen.value = true
  } else {
    isOpen.value = false
  }
}

// 更新弹出层位置
const updatePickerPosition = () => {
  if (!containerRef.value) return

  const triggerRect = containerRef.value.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const gap = 4 // 间距
  const pickerWidth = 288 // w-72 = 18rem = 288px
  const pickerHeight = 380 // 估算高度

  let top = triggerRect.bottom + gap
  let left = triggerRect.left

  // 检查底部是否超出
  if (top + pickerHeight > viewportHeight) {
    // 尝试放到上方
    const topAbove = triggerRect.top - pickerHeight - gap
    if (topAbove > 0) {
      top = topAbove
    } else {
      // 上下都放不下，放到视口内能显示的最大位置
      top = Math.max(gap, viewportHeight - pickerHeight - gap)
    }
  }

  // 检查右侧是否超出
  if (left + pickerWidth > viewportWidth) {
    left = Math.max(gap, viewportWidth - pickerWidth - gap)
  }

  // 检查左侧是否超出
  if (left < gap) {
    left = gap
  }

  pickerStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  }
}

// 滚轮切换月份
const handleWheel = (event: WheelEvent) => {
  if (event.deltaY > 0) {
    // 向下滚动，下一月
    nextMonth()
  } else {
    // 向上滚动，上一月
    prevMonth()
  }
}

// 上一月
const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

// 下一月
const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

// 选择日期
const selectDate = (date: CalendarDay) => {
  if (!date.isCurrentMonth) return

  if (props.range) {
    if (!rangeStart.value || isSelectingEnd.value === false) {
      // 选择开始日期
      rangeStart.value = date.date
      rangeEnd.value = null
      isSelectingEnd.value = true
    } else {
      // 选择结束日期
      if (date.date.getTime() < rangeStart.value.getTime()) {
        // 如果结束日期小于开始日期，交换
        rangeEnd.value = rangeStart.value
        rangeStart.value = date.date
      } else {
        rangeEnd.value = date.date
      }
      isSelectingEnd.value = false
    }
  } else {
    selectedDate.value = date.date
  }
}

// 鼠标悬停处理
const handleHover = (date: CalendarDay) => {
  if (props.range && isSelectingEnd.value && date.isCurrentMonth) {
    hoverDate.value = date.date
  }
}

// 选择今天
const selectToday = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (props.range) {
    rangeStart.value = today
    rangeEnd.value = today
    isSelectingEnd.value = false
  } else {
    selectedDate.value = today
  }

  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth()
}

// 选择近7天
const selectLastWeek = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)

  rangeStart.value = weekAgo
  rangeEnd.value = today
  isSelectingEnd.value = false

  currentYear.value = weekAgo.getFullYear()
  currentMonth.value = weekAgo.getMonth()
}

// 选择近30天
const selectLastMonth = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const monthAgo = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000)

  rangeStart.value = monthAgo
  rangeEnd.value = today
  isSelectingEnd.value = false

  currentYear.value = monthAgo.getFullYear()
  currentMonth.value = monthAgo.getMonth()
}

// 确认选择
const confirmSelection = () => {
  if (props.range) {
    if (rangeStart.value && rangeEnd.value) {
      const result: DateRange = {
        start: formatDate(rangeStart.value),
        end: formatDate(rangeEnd.value),
      }
      emit('update:modelValue', result)
      emit('change', result)
    }
  } else {
    if (selectedDate.value) {
      const formattedDate = formatDate(selectedDate.value)
      emit('update:modelValue', formattedDate)
      emit('change', formattedDate)
    }
  }
  isOpen.value = false
}

// 清除日期
const clearDate = () => {
  if (props.range) {
    rangeStart.value = null
    rangeEnd.value = null
    isSelectingEnd.value = false
    emit('update:modelValue', { start: '', end: '' })
    emit('change', { start: '', end: '' })
  } else {
    selectedDate.value = null
    emit('update:modelValue', '')
    emit('change', '')
  }
}

// 格式化日期
const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 解析日期字符串
const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null
  const parts = dateStr.split('-')
  if (parts.length !== 3) return null
  const year = parseInt(parts[0]!, 10)
  const month = parseInt(parts[1]!, 10) - 1
  const day = parseInt(parts[2]!, 10)
  const date = new Date(year, month, day)
  date.setHours(0, 0, 0, 0)
  return date
}

// 点击外部关闭
const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (props.range) {
      const val = newValue as DateRange
      if (val && val.start) {
        const startDate = parseDate(val.start)
        if (startDate) {
          rangeStart.value = startDate
          currentYear.value = startDate.getFullYear()
          currentMonth.value = startDate.getMonth()
        }
      }
      if (val && val.end) {
        const endDate = parseDate(val.end)
        if (endDate) {
          rangeEnd.value = endDate
        }
      }
    } else {
      if (newValue) {
        const date = parseDate(newValue as string)
        if (date) {
          selectedDate.value = date
          currentYear.value = date.getFullYear()
          currentMonth.value = date.getMonth()
        }
      } else {
        selectedDate.value = null
      }
    }
  },
  { immediate: true },
)

// 窗口滚动/resize 时更新位置
const handleScrollOrResize = () => {
  if (isOpen.value) {
    updatePickerPosition()
  }
}

// 初始化
const init = () => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScrollOrResize, true)
  window.addEventListener('resize', handleScrollOrResize)
}

onMounted(() => {
  init()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScrollOrResize, true)
  window.removeEventListener('resize', handleScrollOrResize)
})
</script>

<style scoped>
.picker-fade-enter-active,
.picker-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.picker-fade-enter-from,
.picker-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
