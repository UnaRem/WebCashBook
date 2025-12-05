<template>
  <div
    class="flex items-center rounded-md transition-all hover:scale-95 hover:cursor-pointer hover:bg-[#d6e3ff] hover:text-[#415F91] active:scale-90"
    :class="router.currentRoute.value.meta.title === title ? 'bg-[#d6e3ff] text-[#415F91]' : ''"
  >
    <div class="p-3">
      <component :is="icon" class="size-6" />
    </div>
    <div>{{ title }}</div>
  </div>
</template>

<script setup lang="ts">
import { Squares2X2Icon, Cog8ToothIcon, ChartBarIcon, BuildingLibraryIcon, BookmarkIcon } from '@heroicons/vue/24/solid'

interface Props {
  title: string
  iconName: 'Squares2X2Icon' | 'Cog8ToothIcon' | 'ChartBarIcon' | 'BuildingLibraryIcon' | 'BookmarkIcon'
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Tab',
  iconName: 'Squares2X2Icon',
})

const iconMap: Record<Props['iconName'], typeof Squares2X2Icon> = {
  Squares2X2Icon,
  Cog8ToothIcon,
  ChartBarIcon,
  BuildingLibraryIcon,
  BookmarkIcon,
}

const icon = iconMap[props.iconName]

const router = useRouter()
</script>
