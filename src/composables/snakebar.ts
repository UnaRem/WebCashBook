import { ref } from 'vue'

export type SnackbarType = 'success' | 'error' | 'warning' | 'info'

export interface SnackbarItem {
  id: number
  message: string
  type: SnackbarType
  duration: number
}

const snackbars = ref<SnackbarItem[]>([])
let idCounter = 0

export const useSnackbar = () => {
  const show = (message: string, type: SnackbarType = 'info', duration = 3000) => {
    const id = ++idCounter
    snackbars.value.push({ id, message, type, duration })

    // 限制队列最多 3 个，超出时移除最早的
    while (snackbars.value.length > 3) {
      snackbars.value.shift()
    }

    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }

    return id
  }

  const remove = (id: number) => {
    const index = snackbars.value.findIndex((s) => s.id === id)
    if (index > -1) {
      snackbars.value.splice(index, 1)
    }
  }

  const success = (message: string, duration?: number) => show(message, 'success', duration)
  const error = (message: string, duration?: number) => show(message, 'error', duration)
  const warning = (message: string, duration?: number) => show(message, 'warning', duration)
  const info = (message: string, duration?: number) => show(message, 'info', duration)

  return {
    snackbars,
    show,
    remove,
    success,
    error,
    warning,
    info,
  }
}
