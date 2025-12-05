<template>
  <div class="flex h-full min-w-[240px] flex-col border-r border-[#e0e2ec] bg-[#f3f3fa]">
    <!-- LOGO和应用名 -->
    <div class="flex h-[81px] items-center p-6">
      <img src="https://picsum.photos/200" alt="logo" class="mr-1 h-8 w-8 rounded-md" />
      <div class="text-xl font-bold text-[#415F91]">Una的账单</div>
    </div>

    <!-- 菜单 -->
    <div class="flex-1 space-y-1 border-t border-[#e0e2ec] p-3 font-medium text-[#44474E]">
      <SideBarTab title="仪表盘" iconName="Squares2X2Icon" @click="router.push('/')" />
      <SideBarTab title="交易记录" iconName="BuildingLibraryIcon" @click="router.push('/transactions')" />
      <SideBarTab title="分类管理" iconName="BookmarkIcon" @click="router.push('/category')" />
      <SideBarTab title="报表" iconName="ChartBarIcon" @click="router.push('/report')" />
      <SideBarTab title="设置" iconName="Cog8ToothIcon" @click="router.push('/setting')" />
    </div>

    <!-- 个人信息 -->
    <div class="flex h-[81px] items-center border-t border-[#e0e2ec] p-4">
      <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#d6e3ff]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#415f91" class="size-6">
          <path
            fill-rule="evenodd"
            d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <div class="ml-3">
        <div>Una</div>
        <div class="text-xs text-[#415F91]">个人账户</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style lang="scss" scoped></style>
