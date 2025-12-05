<template>
  <UModal
    v-model="visible"
    :title="isEditing ? '编辑交易' : '添加交易'"
    size="lg"
    :show-footer="false"
    @close="handleClose"
  >
    <div class="space-y-4">
      <!-- 第一行：时间 + 类型 -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">交易时间</label>
          <UDatePicker v-model="formData.transactionTime" placeholder="选择时间" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">交易类型</label>
          <USelector v-model="formData.type" :options="typeOptions" placeholder="选择类型" />
        </div>
      </div>

      <!-- 第二行：分类 + 金额 -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">交易分类</label>
          <USelector
            v-model="formData.transactionCategory"
            :options="categoryOptions"
            placeholder="选择分类"
            searchable
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">金额</label>
          <UInput v-model="formData.amount" type="number" placeholder="0.00" />
        </div>
      </div>

      <!-- 第三行：交易对方 -->
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700">交易对方</label>
        <UInput v-model="formData.counterparty" placeholder="请输入交易对方" />
      </div>

      <!-- 第四行：商品名称 -->
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700">商品名称</label>
        <UInput v-model="formData.productName" placeholder="请输入商品名称" />
      </div>

      <!-- 第五行：备注 -->
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700">备注</label>
        <UInput v-model="formData.remark" placeholder="请输入备注（可选）" />
      </div>
    </div>

    <!-- 自定义底部按钮 -->
    <template #footer>
      <UButton variant="outline" @click="handleClose">取消</UButton>
      <UButton @click="handleSave">{{ isEditing ? '更新' : '添加' }}</UButton>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { CategoryItem, TransactionItem } from '@/dexie'
import { ref, computed, watch, onMounted } from 'vue'

interface Props {
  modelValue: boolean
  transaction?: TransactionItem | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  transaction: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [data: Omit<TransactionItem, 'id'>, isEditing: boolean, editId?: number]
}>()

// 双向绑定 visible
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const categories = ref<CategoryItem[]>([])

// 交易类型选项
const typeOptions = ['收入', '支出']

// 分类选项
const categoryOptions = computed(() => categories.value.map((c) => c.category))

const formData = ref<Omit<TransactionItem, 'id'>>({
  transactionId: '',
  transactionTime: '',
  transactionCategory: '',
  counterparty: '',
  amount: 0,
  type: '支出',
  productName: '',
  remark: '',
})

const isEditing = computed(() => !!props.transaction)

// 监听 transaction 变化，填充表单
watch(
  () => props.transaction,
  (newVal) => {
    if (newVal) {
      formData.value = {
        transactionId: newVal.transactionId,
        transactionTime: newVal.transactionTime.replace(' ', 'T'),
        transactionCategory: newVal.transactionCategory,
        counterparty: newVal.counterparty,
        amount: newVal.amount,
        type: newVal.type,
        productName: newVal.productName,
        remark: newVal.remark,
      }
    }
  },
  { immediate: true },
)

// 监听 modelValue，打开时重置表单（非编辑模式）
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && !props.transaction) {
      resetForm()
    }
  },
)

const resetForm = () => {
  formData.value = {
    transactionId: '',
    transactionTime: '',
    transactionCategory: '',
    counterparty: '',
    amount: 0,
    type: '支出',
    productName: '',
    remark: '',
  }
}

const handleClose = () => {
  emit('update:modelValue', false)
  resetForm()
}

const handleSave = () => {
  emit('save', { ...formData.value }, isEditing.value, props.transaction?.id)
}

// 加载分类列表
const loadCategories = async () => {
  try {
    const { default: db } = await import('@/dexie')
    const data = await db.categories.toArray()
    categories.value = data
  } catch (error) {
    console.error('加载分类数据失败:', error)
  }
}

onMounted(() => {
  loadCategories()
})
</script>
