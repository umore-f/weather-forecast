import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
// element-puls图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 和风天气图标
import 'qweather-icons/font/qweather-icons.css'
// 引入pinia
import { createPinia } from 'pinia'
// 引入封装好的基础组件
import BaseChart from '@/components/BaseChart.vue'
const pinia = createPinia()
const app = createApp(App)
// 循环注册
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(pinia)
// 全局注册图表组件
app.component('BaseChart', BaseChart)
app.mount('#app')
