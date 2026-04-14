// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
const routes = [
  // 动态路由示例
  {
    path: '/home',
    name: 'home',
    component: () => import('../views/CurrentPage/CurrentWeather.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutPage/AboutPage.vue')
  },
  {
    path: '/analyse',
    name: 'analyse',
    component: () => import('../views/AnalysePage/WeatherChartContainer.vue')
  },
  {
    path: '/score',
    name: 'score',
    component: () => import('../views/ScorePage/index.vue')
  },
]

const router = createRouter({
  history: createWebHistory(), // 使用 HTML5 模式（无 # 号）
  routes
})

export default router
