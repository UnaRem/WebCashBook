import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import DashboardTab from '@/components/DashboardTab.vue'
import TransactionsTab from '@/components/TransactionsTab.vue'
import CategoryManageTab from '@/components/CategoryManageTab.vue'
import ReportTab from '@/components/ReportTab.vue'
import SettingTab from '@/components/SettingTab.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'app',
      component: DashboardView,
      children: [
        {
          path: '/',
          name: 'dashboard',
          component: DashboardTab,
          meta: { title: '仪表盘' },
        },
        {
          path: 'transactions',
          name: 'transactions',
          component: TransactionsTab,
          meta: { title: '交易记录' },
        },
        {
          path: 'category',
          name: 'category',
          component: CategoryManageTab,
          meta: { title: '分类管理' },
        },
        {
          path: 'report',
          name: 'report',
          component: ReportTab,
          meta: { title: '报表' },
        },
        {
          path: 'setting',
          name: 'setting',
          component: SettingTab,
          meta: { title: '设置' },
        },
      ],
    },
  ],
})

export default router
