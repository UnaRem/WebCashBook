<template>
  <teleport to="body">
    <div class="fixed top-4 left-1/2 z-100 flex -translate-x-1/2 transform flex-col gap-2">
      <TransitionGroup name="snackbar">
        <div
          v-for="item in snackbars"
          :key="item.id"
          :class="['flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg', typeClasses[item.type]]"
        >
          <component :is="getIcon(item.type)" class="h-5 w-5 shrink-0" />
          <span class="text-sm font-medium">{{ item.message }}</span>
          <button @click="remove(item.id)" class="ml-2 rounded p-1 transition-colors hover:bg-black/10">
            <XMarkIcon class="h-4 w-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { useSnackbar, type SnackbarType } from '@/composables/snakebar'

const { snackbars, remove } = useSnackbar()

const typeClasses: Record<SnackbarType, string> = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  warning: 'bg-yellow-500 text-white',
  info: 'bg-blue-500 text-white',
}

const getIcon = (type: SnackbarType) => {
  const icons: Record<SnackbarType, typeof CheckCircleIcon> = {
    success: CheckCircleIcon,
    error: ExclamationCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
  }
  return icons[type]
}
</script>

<style scoped>
.snackbar-enter-active,
.snackbar-leave-active {
  transition: all 0.3s ease;
}

.snackbar-enter-from,
.snackbar-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.snackbar-move {
  transition: transform 0.3s ease;
}
</style>
