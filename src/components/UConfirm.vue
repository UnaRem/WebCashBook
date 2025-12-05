<template>
  <teleport to="body">
    <Transition name="confirm-fade">
      <div
        v-if="state.visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="handleCancel"
      >
        <Transition name="confirm-scale" appear>
          <div v-if="state.visible" class="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <!-- Header -->
            <div class="mb-4 flex items-center gap-3">
              <div :class="['rounded-full p-2', iconBgClass]">
                <component :is="icon" :class="['h-6 w-6', iconClass]" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900">
                {{ state.options.title }}
              </h3>
            </div>

            <!-- Message -->
            <p class="mb-6 text-gray-600">
              {{ state.options.message }}
            </p>

            <!-- Actions -->
            <div class="flex justify-end gap-3">
              <button
                class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                @click="handleCancel"
              >
                {{ state.options.cancelText }}
              </button>
              <button
                :class="['rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors', confirmBtnClass]"
                @click="handleConfirm"
              >
                {{ state.options.confirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { InformationCircleIcon, ExclamationTriangleIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline'
import { useConfirm } from '@/composables/confirm'

const { state, handleConfirm, handleCancel } = useConfirm()

const icon = computed(() => {
  const icons = {
    info: InformationCircleIcon,
    warning: ExclamationTriangleIcon,
    danger: ExclamationCircleIcon,
  }
  return icons[state.value.options.type ?? 'info']
})

const iconClass = computed(() => {
  const classes = {
    info: 'text-blue-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
  }
  return classes[state.value.options.type ?? 'info']
})

const iconBgClass = computed(() => {
  const classes = {
    info: 'bg-blue-100',
    warning: 'bg-yellow-100',
    danger: 'bg-red-100',
  }
  return classes[state.value.options.type ?? 'info']
})

const confirmBtnClass = computed(() => {
  const classes = {
    info: 'bg-blue-600 hover:bg-blue-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    danger: 'bg-red-600 hover:bg-red-700',
  }
  return classes[state.value.options.type ?? 'info']
})
</script>

<style scoped>
.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 0.2s ease;
}

.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}

.confirm-scale-enter-active {
  transition: all 0.2s ease-out;
}

.confirm-scale-leave-active {
  transition: all 0.15s ease-in;
}

.confirm-scale-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.confirm-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
