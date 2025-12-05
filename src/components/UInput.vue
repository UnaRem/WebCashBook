<template>
  <div class="relative">
    <!-- 前置图标 -->
    <div
      v-if="$slots.prefix || prefixIcon"
      class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
    >
      <slot name="prefix">
        <component :is="prefixIcon" v-if="prefixIcon" class="h-5 w-5 text-gray-400" />
      </slot>
    </div>

    <!-- 输入框 -->
    <input
      ref="inputRef"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :class="inputClass"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown.enter="emit('enter', $event)"
    />

    <!-- 清除按钮 -->
    <div
      v-if="clearable && modelValue && !disabled && !readonly"
      class="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3"
      @click="handleClear"
    >
      <XMarkIcon class="h-5 w-5 text-gray-400 transition-colors hover:text-gray-600" />
    </div>

    <!-- 后置图标 -->
    <div
      v-else-if="$slots.suffix || suffixIcon"
      class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
    >
      <slot name="suffix">
        <component :is="suffixIcon" v-if="suffixIcon" class="h-5 w-5 text-gray-400" />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import type { Component } from 'vue'

interface Props {
  modelValue?: string | number
  type?: 'text' | 'password' | 'number' | 'email' | 'tel' | 'url'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  maxlength?: number
  prefixIcon?: Component
  suffixIcon?: Component
  size?: 'sm' | 'md' | 'lg'
  error?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  disabled: false,
  readonly: false,
  clearable: false,
  size: 'md',
  error: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  input: [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  clear: []
  enter: [event: KeyboardEvent]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)

// 尺寸样式
const sizeClass = computed(() => {
  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base',
  }
  return sizes[props.size]
})

// 输入框样式
const inputClass = computed(() => {
  const base = 'w-full rounded-md border bg-transparent transition-colors focus:outline-none'

  // 边框颜色
  let borderClass = 'border-gray-300'
  if (props.error) {
    borderClass = 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
  } else if (isFocused.value) {
    borderClass = 'border-blue-500 ring-1 ring-blue-500'
  } else {
    borderClass = 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
  }

  // 禁用样式
  const disabledClass = props.disabled ? 'cursor-not-allowed bg-gray-100 text-gray-400' : 'text-gray-700'

  // 内边距（考虑图标）
  let paddingClass = sizeClass.value
  if (props.prefixIcon) {
    paddingClass = paddingClass
      .replace('px-3', 'pl-10 pr-3')
      .replace('px-2.5', 'pl-9 pr-2.5')
      .replace('px-4', 'pl-11 pr-4')
  }
  if (props.clearable || props.suffixIcon) {
    paddingClass = paddingClass.replace('pr-3', 'pr-10').replace('pr-2.5', 'pr-9').replace('pr-4', 'pr-11')
  }

  return [base, borderClass, disabledClass, paddingClass]
})

// 处理输入
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
  emit('input', value)
}

// 处理聚焦
const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

// 处理失焦
const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

// 清除内容
const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}

// 暴露方法
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select(),
})
</script>
