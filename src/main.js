import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
// element-puls图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia } from 'pinia'
const pinia = createPinia()
const app = createApp(App)
// 循环注册
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(pinia)
app.mount('#app')
