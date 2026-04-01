// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
const routes = [
  // 动态路由示例
  {
    path: '/',
    name: 'current',
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
    path: '/map',
    name: 'map',
    component: () => import('../views/AnalysePage/AnalysePage.vue')
  },
  {
    path: '/score',
    name: 'score',
    component: () => import('../views/ScorePage/ScorePage.vue')
  },
]

const router = createRouter({
  history: createWebHistory(), // 使用 HTML5 模式（无 # 号）
  routes
})

export default router
