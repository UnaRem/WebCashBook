<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        @mousedown.self="handleOverlayMouseDown"
        @mouseup.self="handleOverlayMouseUp"
      >
        <Transition name="modal-scale" appear>
          <div v-if="modelValue" class="w-full rounded-xl bg-white p-6 shadow-2xl" :class="sizeClass">
            <!-- 标题 -->
            <div v-if="title || $slots.header" class="mb-6">
              <slot name="header">
                <h3 class="text-lg font-semibold text-gray-800">{{ title }}</h3>
              </slot>
            </div>

            <!-- 内容 -->
            <slot></slot>

            <!-- 底部按钮 -->
            <div v-if="showFooter" class="mt-6 flex justify-end gap-3">
              <slot name="footer">
                <UButton variant="outline" @click="handleClose">{{ cancelText }}</UButton>
                <UButton @click="handleConfirm">{{ confirmText }}</UButton>
              </slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showFooter?: boolean
  cancelText?: string
  confirmText?: string
  closeOnClickOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: '',
  size: 'md',
  showFooter: true,
  cancelText: '取消',
  confirmText: '确定',
  closeOnClickOverlay: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  close: []
}>()

// 尺寸样式
const sizeClass = computed(() => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }
  return sizes[props.size]
})

// 记录 mousedown 是否发生在遮罩层
const mouseDownOnOverlay = ref(false)

const handleOverlayMouseDown = () => {
  mouseDownOnOverlay.value = true
}

const handleOverlayMouseUp = () => {
  // 只有当 mousedown 和 mouseup 都发生在遮罩层时才关闭
  if (mouseDownOnOverlay.value && props.closeOnClickOverlay) {
    emit('update:modelValue', false)
    emit('close')
  }
  mouseDownOnOverlay.value = false
}

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<style scoped>
/* 背景遮罩淡入淡出 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* 内容缩放动画 */
.modal-scale-enter-active {
  transition: all 0.25s ease-out;
}

.modal-scale-leave-active {
  transition: all 0.2s ease-in;
}

.modal-scale-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
