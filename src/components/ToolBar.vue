<template>
  <div class="flex h-[64px] items-center border-b border-[#e0e2ec] bg-white px-6">
    <div class="text-xl font-medium text-[#191C20]">{{ router.currentRoute.value.meta.title }}</div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
</script>

<style lang="scss" scoped></style>
