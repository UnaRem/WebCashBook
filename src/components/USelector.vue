<template>
  <div class="relative" ref="containerRef">
    <!-- 触发器 -->
    <div
      class="flex cursor-pointer items-center rounded-md border border-gray-300 px-3 py-2 transition-colors focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
      :class="{ 'border-blue-500 ring-1 ring-blue-500': isOpen }"
      @click="toggleDropdown"
    >
      <span v-if="selectedLabel" class="flex-1 text-sm text-gray-700">{{ selectedLabel }}</span>
      <span v-else class="flex-1 text-sm text-gray-400">{{ placeholder }}</span>
      <ChevronDownIcon
        class="h-5 w-5 text-gray-400 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </div>

    <!-- 下拉选项 -->
    <Transition name="dropdown-fade">
      <div
        v-if="isOpen"
        ref="dropdownRef"
        class="scrollbar-hidden fixed z-50 max-h-60 overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-gray-200"
        :style="dropdownStyle"
      >
        <!-- 搜索框 -->
        <div v-if="searchable" class="sticky top-0 bg-white px-3 py-2">
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            placeholder="搜索..."
            @click.stop
          />
        </div>

        <!-- 选项列表 -->
        <div v-if="filteredOptions.length > 0">
          <div
            v-for="option in filteredOptions"
            :key="getOptionValue(option)"
            class="cursor-pointer px-3 py-2 text-sm transition-colors"
            :class="[
              getOptionValue(option) === modelValue ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100',
            ]"
            @click="selectOption(option)"
          >
            {{ getOptionLabel(option) }}
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="px-3 py-4 text-center text-sm text-gray-400">
          {{ searchQuery ? '无匹配结果' : '暂无选项' }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'

type OptionValue = string | number
type OptionItem = OptionValue | Record<string, unknown>

interface Props {
  modelValue?: OptionValue
  options?: OptionItem[]
  placeholder?: string
  labelKey?: string
  valueKey?: string
  searchable?: boolean
  clearable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  options: () => [],
  placeholder: '请选择',
  labelKey: 'label',
  valueKey: 'value',
  searchable: false,
  clearable: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: OptionValue]
  change: [value: OptionValue]
}>()

// 状态
const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
const searchQuery = ref('')

// 下拉框位置
const dropdownStyle = ref<{ top: string; left: string; minWidth: string }>({
  top: '0px',
  left: '0px',
  minWidth: '0px',
})

// 获取选项的值
const getOptionValue = (option: OptionItem): OptionValue => {
  if (typeof option === 'object' && option !== null) {
    return option[props.valueKey] as OptionValue
  }
  return option
}

// 获取选项的标签
const getOptionLabel = (option: OptionItem): string => {
  if (typeof option === 'object' && option !== null) {
    return String(option[props.labelKey] ?? '')
  }
  return String(option)
}

// 当前选中的标签
const selectedLabel = computed(() => {
  if (props.modelValue === '' || props.modelValue === undefined || props.modelValue === null) {
    return ''
  }
  const option = props.options.find((opt) => getOptionValue(opt) === props.modelValue)
  return option ? getOptionLabel(option) : String(props.modelValue)
})

// 过滤后的选项
const filteredOptions = computed(() => {
  if (!searchQuery.value) {
    return props.options
  }
  const query = searchQuery.value.toLowerCase()
  return props.options.filter((option) => getOptionLabel(option).toLowerCase().includes(query))
})

// 更新下拉框位置
const updateDropdownPosition = () => {
  if (!containerRef.value) return

  const triggerRect = containerRef.value.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const gap = 4
  const dropdownHeight = 240 // max-h-60 = 15rem = 240px

  let top = triggerRect.bottom + gap
  let left = triggerRect.left

  // 检查底部是否超出
  if (top + dropdownHeight > viewportHeight) {
    const topAbove = triggerRect.top - dropdownHeight - gap
    if (topAbove > 0) {
      top = topAbove
    } else {
      top = Math.max(gap, viewportHeight - dropdownHeight - gap)
    }
  }

  // 检查右侧是否超出
  if (left + triggerRect.width > viewportWidth) {
    left = Math.max(gap, viewportWidth - triggerRect.width - gap)
  }

  dropdownStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    minWidth: `${triggerRect.width}px`,
  }
}

// 切换下拉框
const toggleDropdown = () => {
  if (!isOpen.value) {
    updateDropdownPosition()
    isOpen.value = true
    searchQuery.value = ''
    // 聚焦搜索框
    if (props.searchable) {
      setTimeout(() => {
        searchInputRef.value?.focus()
      }, 50)
    }
  } else {
    isOpen.value = false
  }
}

// 选择选项
const selectOption = (option: OptionItem) => {
  const value = getOptionValue(option)
  emit('update:modelValue', value)
  emit('change', value)
  isOpen.value = false
  searchQuery.value = ''
}

// 点击外部关闭
const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
    searchQuery.value = ''
  }
}

// 窗口滚动/resize 时更新位置
const handleScrollOrResize = () => {
  if (isOpen.value) {
    updateDropdownPosition()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScrollOrResize, true)
  window.addEventListener('resize', handleScrollOrResize)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScrollOrResize, true)
  window.removeEventListener('resize', handleScrollOrResize)
})
</script>

<style scoped>
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
