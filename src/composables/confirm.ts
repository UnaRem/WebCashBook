import { ref } from 'vue'

export interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'info' | 'warning' | 'danger'
}

interface ConfirmState {
  visible: boolean
  options: ConfirmOptions
  resolve: ((value: boolean) => void) | null
}

const state = ref<ConfirmState>({
  visible: false,
  options: {
    title: '确认',
    message: '',
    confirmText: '确认',
    cancelText: '取消',
    type: 'info',
  },
  resolve: null,
})

export const useConfirm = () => {
  const confirm = (options: ConfirmOptions | string): Promise<boolean> => {
    const opts: ConfirmOptions = typeof options === 'string' ? { message: options } : options

    state.value.options = {
      title: opts.title ?? '确认',
      message: opts.message,
      confirmText: opts.confirmText ?? '确认',
      cancelText: opts.cancelText ?? '取消',
      type: opts.type ?? 'info',
    }
    state.value.visible = true

    return new Promise((resolve) => {
      state.value.resolve = resolve
    })
  }

  const handleConfirm = () => {
    state.value.visible = false
    state.value.resolve?.(true)
    state.value.resolve = null
  }

  const handleCancel = () => {
    state.value.visible = false
    state.value.resolve?.(false)
    state.value.resolve = null
  }

  return {
    state,
    confirm,
    handleConfirm,
    handleCancel,
  }
}
