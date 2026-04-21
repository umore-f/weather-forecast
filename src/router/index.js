// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
const routes = [
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/CurrentPage/CurrentWeather.vue')
  },
  {
    path: '/analyse',
    name: 'analyse',
    component: () => import('@/views/AnalysePage/WeatherChartContainer.vue')
  },
  {
    path: '/score',
    name: 'score',
    component: () => import('@/views/ScorePage/index.vue')
  },
  {
    path: '/user',
    name: 'user',
    component: () => import('@/views/UserPage/UserPage.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(), // 使用 HTML5 模式（无 # 号）
  routes
})

export default router
