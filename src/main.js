import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
// element-puls图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 和风天气图标
import 'qweather-icons/font/qweather-icons.css'
// 引入pinia
import { createPinia } from 'pinia'
// 导入 vue-echarts 组件
import ECharts from 'vue-echarts';
const pinia = createPinia()
const app = createApp(App)
// 循环注册
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
// 全局注册图表组件，在模板中可以使用 <v-chart> 标签
app.component('v-chart', ECharts);
app.mount('#app')
