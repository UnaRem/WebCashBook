<template>
  <div
    class="max-h-[170px] min-h-[170px] min-w-[270px] flex-1 space-y-4 rounded-xl bg-white p-6 text-[#44474E] shadow-sm"
  >
    <div class="flex min-h-[40px] items-center justify-between">
      <div>{{ props.title }}</div>
      <div>
        <component :is="Icon" class="size-10" :class="iconColorMap[props.iconColor]" />
      </div>
    </div>
    <div class="flex min-h-[66px] flex-col space-y-1">
      <div class="text-[28px] font-semibold text-[#415F91]">￥{{ props.value }}</div>
      <div class="text-[14px] font-normal">
        <span :class="{ 'text-green-400': props.change > 0, 'text-red-400': props.change < 0 }">
          {{ props.change }}%
        </span>
        <span>&nbsp;{{ props.changeType }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CurrencyYenIcon, DocumentCurrencyYenIcon, WalletIcon } from '@heroicons/vue/24/solid'

interface Props {
  iconName: 'CurrencyYenIcon' | 'DocumentCurrencyYenIcon' | 'WalletIcon'
  title: string
  value?: number
  change?: number
  changeType?: string
  iconColor?: 'default' | 'income' | 'expenditure'
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  change: 0,
  changeType: '较上月',
  iconColor: 'default',
})

const IconMap: Record<Props['iconName'], typeof CurrencyYenIcon> = {
  CurrencyYenIcon,
  DocumentCurrencyYenIcon,
  WalletIcon,
}

const Icon = IconMap[props.iconName]

const iconColorMap = {
  default: 'text-[#415F91]',
  income: 'text-green-400',
  expenditure: 'text-red-400',
}
</script>

<style lang="scss" scoped></style>
