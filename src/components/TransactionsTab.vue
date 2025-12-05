<template>
  <div class="scrollbar-hidden max-h-[calc(100vh-64px)] space-y-8 overflow-auto p-6">
    <!-- 搜索和筛选 -->
    <div class="rounded-lg bg-white p-6 shadow-sm">
      <div class="flex flex-wrap items-center gap-4">
        <div class="min-w-[200px] flex-1">
          <UInput v-model="searchQuery" placeholder="搜索交易对方、商品名称..." clearable />
        </div>
        <UButton @click="openAddModal">添加交易</UButton>
        <USelector v-model="filterType" :options="filterOptions" placeholder="全部类型" />
        <USelector v-model="filterCategory" :options="categoryOptions" placeholder="全部分类" class="w-32" />
        <UDatePicker v-model="dateRange" range placeholder="选择日期范围" />
      </div>
      <!-- 价格筛选 -->
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <span class="text-sm text-gray-500">金额范围：</span>
        <UInput v-model="priceRange.min" type="number" placeholder="最小" class="w-24" />
        <span class="text-gray-400">-</span>
        <UInput v-model="priceRange.max" type="number" placeholder="最大" class="w-24" />
        <div class="ml-2 flex gap-1">
          <button
            v-for="preset in pricePresets"
            :key="preset.label"
            class="rounded-lg px-3 py-1.5 text-xs transition-colors"
            :class="isPresetActive(preset) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="applyPreset(preset)"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- 交易列表 -->
    <div class="rounded-lg bg-white shadow-sm">
      <div class="overflow-x-auto">
        <TransactionItem
          v-for="transaction in filteredTransactions"
          :key="transaction.id"
          :transaction="transaction"
          @edit="editTransaction"
          @delete="deleteTransaction"
        />

        <!-- 空状态 -->
        <div v-if="filteredTransactions.length === 0" class="py-8 text-center text-gray-500">
          {{ transactions.length === 0 ? '暂无交易记录，点击"添加交易"开始记录' : '没有符合筛选条件的交易记录' }}
        </div>
      </div>
    </div>

    <!-- 添加/编辑交易模态框 -->
    <TransactionModal v-model="showModal" :transaction="editingTransaction" @save="handleSaveTransaction" />
  </div>
</template>

<script setup lang="ts">
import type { TransactionItem } from '@/dexie'
import { useConfirm } from '@/composables/confirm'

// 响应式数据
const transactions = ref<TransactionItem[]>([])
const categories = ref<string[]>([])
const showModal = ref(false)
const editingTransaction = ref<TransactionItem | null>(null)
const searchQuery = ref('')
const filterType = ref('')
const filterCategory = ref('')
const dateRange = ref<{ start: string; end: string }>({ start: '', end: '' })
const priceRange = ref<{ min: number | ''; max: number | '' }>({ min: '', max: '' })

// 筛选选项
const filterOptions = [
  { label: '全部类型', value: '' },
  { label: '收入', value: '收入' },
  { label: '支出', value: '支出' },
]

// 分类筛选选项
const categoryOptions = computed(() => [
  { label: '全部分类', value: '' },
  ...categories.value.map((c) => ({ label: c, value: c })),
])

// 价格快捷筛选预设
interface PricePreset {
  label: string
  min: number | ''
  max: number | ''
}

const pricePresets: PricePreset[] = [
  { label: '全部', min: '', max: '' },
  { label: '0-50', min: 0, max: 50 },
  { label: '50-100', min: 50, max: 100 },
  { label: '100-500', min: 100, max: 500 },
  { label: '500+', min: 500, max: '' },
]

// 判断预设是否激活
const isPresetActive = (preset: PricePreset) => {
  return priceRange.value.min === preset.min && priceRange.value.max === preset.max
}

// 应用预设
const applyPreset = (preset: PricePreset) => {
  priceRange.value = { min: preset.min, max: preset.max }
}

// SnakeBar
const { show } = useSnackbar()

// Confirm
const { confirm } = useConfirm()

// 加载交易数据
const loadTransactions = async () => {
  try {
    const { default: db } = await import('@/dexie')
    const data = await db.transactions.orderBy('transactionTime').reverse().toArray()
    transactions.value = data
  } catch (error) {
    console.error('加载交易数据失败:', error)
    show('加载交易数据失败', 'error')
  }
}

// 加载分类数据
const loadCategories = async () => {
  try {
    const { default: db } = await import('@/dexie')
    const data = await db.categories.toArray()
    categories.value = data.map((c) => c.category)
  } catch (error) {
    console.error('加载分类数据失败:', error)
  }
}

// 筛选后的交易列表
const filteredTransactions = computed(() => {
  let filtered = transactions.value

  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (transaction) =>
        transaction.counterparty.toLowerCase().includes(query) || transaction.productName.toLowerCase().includes(query),
    )
  }

  // 类型筛选
  if (filterType.value) {
    filtered = filtered.filter((transaction) => transaction.type === filterType.value)
  }

  // 分类筛选
  if (filterCategory.value) {
    filtered = filtered.filter((transaction) => transaction.transactionCategory === filterCategory.value)
  }

  // 日期筛选
  if (dateRange.value.start) {
    filtered = filtered.filter((transaction) => transaction.transactionTime >= dateRange.value.start + ' 00:00:00')
  }
  if (dateRange.value.end) {
    filtered = filtered.filter((transaction) => transaction.transactionTime <= dateRange.value.end + ' 23:59:59')
  }

  // 价格筛选
  if (priceRange.value.min !== '' && priceRange.value.min !== null) {
    const min = Number(priceRange.value.min)
    filtered = filtered.filter((transaction) => transaction.amount >= min)
  }
  if (priceRange.value.max !== '' && priceRange.value.max !== null) {
    const max = Number(priceRange.value.max)
    filtered = filtered.filter((transaction) => transaction.amount <= max)
  }

  return filtered
})

// 打开添加模态框
const openAddModal = () => {
  editingTransaction.value = null
  showModal.value = true
}

// 编辑交易
const editTransaction = (transaction: TransactionItem) => {
  editingTransaction.value = { ...transaction }
  showModal.value = true
}

// 删除交易
const deleteTransaction = async (id: number) => {
  const result = await confirm('确定要删除这条交易记录吗？')
  if (result) {
    try {
      const { default: db } = await import('@/dexie')
      await db.transactions.delete(id)
      await loadTransactions()
      show('删除交易成功', 'success')
    } catch (error) {
      console.error('删除交易失败:', error)
      show('删除交易失败', 'error')
    }
  }
}

// 处理保存交易
const handleSaveTransaction = async (formData: Omit<TransactionItem, 'id'>, isEditing: boolean, editId?: number) => {
  try {
    const { default: db } = await import('@/dexie')

    // 转换日期时间格式
    const transactionData = {
      ...formData,
      transactionTime: formData.transactionTime.replace('T', ' '),
    }

    if (isEditing && editId) {
      // 更新
      await db.transactions.update(editId, transactionData)
      show('更新交易成功', 'success')
    } else {
      // 添加
      if (
        !transactionData.transactionTime ||
        !transactionData.transactionCategory ||
        !transactionData.counterparty ||
        !transactionData.amount ||
        !transactionData.type ||
        !transactionData.productName
      ) {
        show('表单数据不完整', 'error')
        return
      }
      transactionData.transactionId = Date.now().toString()
      await db.transactions.add(transactionData)
      show('保存交易成功', 'success')
    }

    await loadTransactions()
    showModal.value = false
    editingTransaction.value = null
  } catch (error) {
    console.error('保存交易失败:', error)
    show('保存交易失败', 'error')
  }
}

// 初始化
onMounted(() => {
  loadTransactions()
  loadCategories()
  // 设置默认日期范围为最近30天
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  dateRange.value = {
    start: thirtyDaysAgo.toISOString().split('T')[0] || '',
    end: today.toISOString().split('T')[0] || '',
  }
})
</script>

<style lang="scss" scoped></style>
