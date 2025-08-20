import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 样式文件
import './assets/styles/index.css'

// 创建应用实例
const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用插件
app.use(store)
app.use(router)
app.use(ElementPlus)

// 初始化应用设置
store.dispatch('app/initAppSettings')

// 挂载应用
app.mount('#app')