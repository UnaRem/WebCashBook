<template>
  <div class="scrollbar-hidden max-h-[calc(100vh-64px)] space-y-8 overflow-auto p-6">
    <!-- 分类列表 -->
    <div class="rounded-lg bg-white p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-gray-700">分类列表</h2>
          <p class="text-sm text-gray-500">管理您的收支分类和关键字</p>
        </div>
      </div>

      <!-- 分类表格 -->
      <div class="flex flex-wrap justify-between space-y-4 space-x-4">
        <div
          class="flex h-24 min-w-32 grow cursor-pointer items-center justify-center rounded-lg border border-blue-500 bg-blue-100 p-4 text-blue-500 transition-all hover:scale-105"
          @click="openModal('add')"
        >
          添加分类
        </div>
        <template v-for="category in categories" :key="category.id">
          <div
            class="group relative max-h-24 min-w-32 grow rounded-lg border border-white bg-white p-4 transition-colors hover:border-blue-500 hover:bg-blue-100 hover:text-blue-500"
          >
            <div class="absolute top-2 right-2">
              <EllipsisVerticalIcon
                class="peer h-6 w-6 text-gray-500 transition-all hover:scale-120 hover:cursor-pointer"
              />
              <div
                class="pointer-events-none absolute top-0 right-0 h-0 w-16 opacity-0 transition-all peer-hover:pointer-events-auto peer-hover:h-8 peer-hover:w-16 peer-hover:opacity-100 hover:pointer-events-auto hover:h-8 hover:w-16 hover:opacity-100"
              >
                <div
                  class="cursor-pointer rounded-xl bg-red-100 px-4 py-2 text-sm text-red-500 hover:text-red-600"
                  @click="deleteCategory(category.id!)"
                >
                  删除
                </div>
              </div>
            </div>
            <div class="mb-2">{{ category.category }}</div>
            <div class="flex flex-wrap items-center space-x-1">
              <span
                v-for="keyword in category.keywords"
                :key="keyword"
                class="item-center inline-flex rounded-xl bg-gray-100 px-2 py-1 text-xs text-gray-500"
              >
                {{ keyword }}
                <XMarkIcon
                  class="inline h-4 w-4 text-red-500 transition-all hover:scale-120 hover:cursor-pointer"
                  @click="deleteKeyword(category.id!, keyword)"
                />
              </span>
              <PlusCircleIcon
                class="-z-1 h-6 w-6 text-blue-500 transition-all group-hover:z-0 hover:scale-120 hover:cursor-pointer"
                @click="openModal('edit', category.id!)"
              />
            </div>
          </div>
        </template>

        <!-- 空状态 -->
        <div v-if="categories.length === 0" class="py-8 text-center text-gray-500">
          暂无分类数据，点击"添加分类"开始创建
        </div>
      </div>
    </div>

    <!-- 添加/编辑分类模态框 -->
    <CategoryModal v-model="showAddModal" :is-edit="isEdit" :category-id="formData.id" @confirm="handleModalConfirm" />
  </div>
</template>

<script setup lang="ts">
import type { CategoryItem } from '@/dexie'
import { XMarkIcon, PlusCircleIcon, EllipsisVerticalIcon } from '@heroicons/vue/24/solid'

// SnakeBar
const snackbar = useSnackbar()

// Confirm
const { confirm } = useConfirm()

// 响应式数据
const categories = ref<CategoryItem[]>([])
const showAddModal = ref(false)
const isEdit = ref(false)
const formData = ref({
  id: 0,
  category: '',
  keywords: '',
})

// 初始化
onMounted(() => {
  loadCategories()
})

// 加载分类数据
const loadCategories = async () => {
  try {
    const { default: db } = await import('@/dexie')
    const data = await db.categories.toArray()
    categories.value = data.length > 0 ? data : []
  } catch (error) {
    console.error('加载分类数据失败:', error)
    snackbar.error('加载分类数据失败')
    categories.value = []
  }
}

// 删除关键字
const deleteKeyword = async (id: number, keyword: string) => {
  const result = await confirm(`确定要删除关键字"${keyword}"吗？`)
  if (!result) return

  try {
    const { default: db } = await import('@/dexie')
    const category = await db.categories.get(id)
    if (!category) {
      snackbar.error('分类不存在')
      return
    }
    await db.categories.update(id, { keywords: category.keywords?.filter((k) => k !== keyword) })
    await loadCategories()
    snackbar.success('删除关键字成功')
  } catch (error) {
    console.error('删除关键字失败:', error)
    snackbar.error('删除关键字失败')
  }
}

// 打开模态框
const openModal = (editMode: 'add' | 'edit', id?: number) => {
  isEdit.value = editMode === 'edit'
  if (editMode === 'edit' && id) {
    formData.value.id = id
  }
  showAddModal.value = true
}

// 处理模态框确认
const handleModalConfirm = async (
  data: { category: string; keywords: string },
  isEditMode: boolean,
  categoryId: number,
) => {
  if (isEditMode) {
    // 添加关键字
    if (data.keywords.trim() === '') return
    try {
      const { default: db } = await import('@/dexie')
      const category = await db.categories.get(categoryId)
      if (!category) {
        snackbar.error('分类不存在')
        return
      }
      if (category?.keywords?.includes(data.keywords.trim())) {
        snackbar.error('关键字已存在')
        return
      }
      await db.categories.update(categoryId, {
        keywords: [...category.keywords, data.keywords.trim()],
      })
      await loadCategories()
      showAddModal.value = false
      snackbar.success('添加关键字成功')
    } catch (error) {
      console.error('添加关键字失败:', error)
      snackbar.error('添加关键字失败')
    }
  } else {
    // 添加分类
    if (data.category.trim() === '') return
    try {
      const { default: db } = await import('@/dexie')
      const existing = await db.categories.where('category').equals(data.category.trim()).first()
      if (existing) {
        snackbar.error('分类已存在')
        return
      }
      await db.categories.add({
        category: data.category.trim(),
        keywords: data.keywords
          .trim()
          .split(',')
          .filter((k) => k.trim())
          .map((k) => k.trim()),
      })
      await loadCategories()
      showAddModal.value = false
      snackbar.success('添加分类成功')
    } catch (error) {
      console.error('添加分类失败:', error)
      snackbar.error('添加分类失败')
    }
  }
}

// 删除分类
const deleteCategory = async (id: number) => {
  const result = await confirm({
    title: '删除分类',
    message: '确定要删除该分类吗？删除后无法恢复。',
    type: 'danger',
  })
  if (!result) return

  try {
    const { default: db } = await import('@/dexie')
    await db.categories.delete(id)
    await loadCategories()
    snackbar.success('删除分类成功')
  } catch (error) {
    console.error('删除分类失败:', error)
    snackbar.error('删除分类失败')
  }
}
</script>

<style lang="scss" scoped>
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition:
    clip-path 150ms ease-out,
    opacity 150ms ease-out;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  clip-path: inset(0 100% 100% 0);
  opacity: 0;
}

.menu-fade-enter-to,
.menu-fade-leave-from {
  clip-path: inset(0 0 0 0);
  opacity: 1;
}
</style>
