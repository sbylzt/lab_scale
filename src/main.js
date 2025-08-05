import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router' // 确保正确导入路由器

const app = createApp(App)
app.use(ElementPlus, { size: 'small', zIndex: 3000 })
app.use(router) // 挂载路由器
app.mount('#app')
