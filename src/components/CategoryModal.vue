<template>
  <UModal v-model="visible" :title="isEdit ? '添加关键字' : '添加分类'" @confirm="handleConfirm" @close="handleClose">
    <div class="space-y-4">
      <!-- 分类名（仅新增模式） -->
      <div v-if="!isEdit">
        <label class="mb-1 block text-sm font-medium text-gray-700">分类名称</label>
        <UInput v-model="formData.category" placeholder="请输入分类名" />
      </div>

      <!-- 关键字 -->
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700">关键字</label>
        <UInput v-model="formData.keywords" placeholder="请输入关键字" />
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  modelValue: boolean
  isEdit?: boolean
  categoryId?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  isEdit: false,
  categoryId: 0,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [data: { category: string; keywords: string }, isEdit: boolean, categoryId: number]
}>()

// 双向绑定 visible
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const formData = ref({
  category: '',
  keywords: '',
})

// 监听 modelValue，打开时重置表单
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      formData.value = {
        category: '',
        keywords: '',
      }
    }
  },
)

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleConfirm = () => {
  emit('confirm', { ...formData.value }, props.isEdit, props.categoryId)
}
</script>
