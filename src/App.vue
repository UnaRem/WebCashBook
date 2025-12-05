<template>
  <div class="flex min-h-screen min-w-screen bg-[#F9F9FF]">
    <router-view v-slot="{ Component, route }">
      <transition>
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
  <SnakeBar />
  <UConfirm />
</template>

<script setup lang="ts">
import SnakeBar from '@/components/USnakebar.vue'
import UConfirm from '@/components/UConfirm.vue'
</script>

<style scoped></style>
