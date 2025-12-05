<template>
  <div
    :class="[
      'relative min-h-[148px] min-w-[270px] space-y-3 rounded-xl bg-[#D6E3FF] p-6 text-[#284777] shadow-sm',
      {
        'drag-active': dragCounter > 0 && props.interfaceCardItem.dropAction,
      },
    ]"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @dragover="handleDragOver"
    @drop="handleDrop"
  >
    <div class="flex min-h-[48px] max-w-[48px] items-center justify-center rounded-full bg-white hover:cursor-pointer">
      <component :is="Icon" class="size-6 text-[#415F91]" />
    </div>
    <div class="space-y-1">
      <div>{{ props.interfaceCardItem.title }}</div>
      <div class="text-sm">{{ props.interfaceCardItem.description }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DocumentArrowUpIcon, DocumentArrowDownIcon } from '@heroicons/vue/24/solid'

interface Props {
  interfaceCardItem: InterfaceCard
}

const props = withDefaults(defineProps<Props>(), {
  interfaceCardItem: () => ({
    title: 'Title',
    description: 'Description',
    iconName: 'upload',
    dropAction: false,
  }),
})

const emit = defineEmits<{
  importComplete: [count: number]
}>()

const IconMap: Record<Props['interfaceCardItem']['iconName'], typeof DocumentArrowUpIcon> = {
  upload: DocumentArrowUpIcon,
  output: DocumentArrowDownIcon,
}

const Icon = IconMap[props.interfaceCardItem.iconName]

const dragCounter = ref(0)

const handleDragEnter = (e: DragEvent) => {
  preventDefaults(e)
  if (!props.interfaceCardItem.dropAction) return

  dragCounter.value++
  if (dragCounter.value === 1) {
    // console.log('真正进入拖拽区域')
    // 这里可以添加拖拽进入的视觉反馈
  }
}

const handleDragLeave = (e: DragEvent) => {
  preventDefaults(e)
  if (!props.interfaceCardItem.dropAction) return

  dragCounter.value--
  if (dragCounter.value === 0) {
    // console.log('真正离开拖拽区域')
    // 这里可以移除拖拽进入的视觉反馈
  }
}

const handleDragOver = (e: DragEvent) => {
  preventDefaults(e)
  if (!props.interfaceCardItem.dropAction) return

  // 必须阻止默认行为，否则 drop 事件不会触发
  e.dataTransfer!.dropEffect = 'copy'
}

const handleDrop = (e: DragEvent) => {
  preventDefaults(e)
  if (!props.interfaceCardItem.dropAction) return

  dragCounter.value = 0
  // console.log('文件放置', e.dataTransfer?.files)
  // 这里处理文件上传逻辑

  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    // 调用文件处理函数
    resolveBill(Array.from(files))
      .then(async (transactionItems) => {
        console.log('解析完成的交易数据:', transactionItems)
        const { default: db } = await import('@/dexie')
        // 先检查数据库中是否存在交易单号相同的记录，如果存在则跳过
        const transactionIds = transactionItems.map((item) => item.transactionId)
        const existingTransactions = await db.transactions.where('transactionId').anyOf(transactionIds).toArray()
        const newTransactions = transactionItems.filter(
          (item) => !existingTransactions.some((existing) => existing.transactionId === item.transactionId),
        )
        const result = await db.transactions.bulkAdd(newTransactions)
        console.log('添加成功', result)
        // 触发导入完成事件
        emit('importComplete', newTransactions.length)
      })
      .catch((error) => {
        console.error('文件处理失败:', error)
      })
  }
}
</script>

<style scoped lang="scss">
.drag-active::before {
  content: '放置到此区域';
  position: absolute;
  inset: 0;
  border: 2px dashed #415f91;
  border-radius: 0.75rem; /* rounded-xl */
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #415f91;
  background-color: rgba(194, 214, 255, 0.3);
}
</style>
