<template>
  <div>
    <span :class="classList">
      {{ props.text }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  text: string
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'outline'
    | 'food'
    | 'traffic'
    | 'entertainment'
    | 'shopping'
    | 'health'
    | 'sport'
    | 'finance'
    | 'education'
    | 'transportation'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
})

const classList = computed(() => {
  const baseClass = 'rounded-2xl px-2 py-1 text-xs font-medium '
  const variantClassMap = {
    default: baseClass,
    primary: baseClass + 'bg-blue-500 text-white',
    secondary: baseClass + 'bg-gray-200 text-gray-800',
    accent: baseClass + 'bg-teal-400 text-white',
    outline: baseClass + 'bg-transparent border-2 border-gray-300 text-gray-800',
    food: baseClass + 'bg-red-500 text-white',
    traffic: baseClass + 'bg-yellow-500 text-white',
    entertainment: baseClass + 'bg-orange-500 text-white',
    shopping: baseClass + 'bg-pink-500 text-white',
    health: baseClass + 'bg-green-500 text-white',
    sport: baseClass + 'bg-purple-500 text-white',
    finance: baseClass + 'bg-blue-500 text-white',
    education: baseClass + 'bg-gray-500 text-white',
    transportation: baseClass + 'bg-red-500 text-white',
  }
  return variantClassMap[props.variant]
})
</script>
