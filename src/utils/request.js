import axios from 'axios'
import { ElMessage } from 'element-plus'
import store from '@/store'
import router from '@/router'

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 显示加载状态
    store.dispatch('app/setLoading', true)
    
    // 优先从localStorage获取token，然后从sessionStorage，最后从store
    const token = localStorage.getItem('token') || 
                  sessionStorage.getItem('token') || 
                  store.getters['user/token']
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  error => {
    store.dispatch('app/setLoading', false)
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    store.dispatch('app/setLoading', false)
    
    const { code, data, message } = response.data
    
    // 根据业务状态码处理
    if (code === 200 || code === 0) {
      return response.data  // 返回完整的响应数据，包含code、data、message
    } else if (code === 401) {
      // 未授权，清除用户信息并跳转到登录页
      ElMessage.error('登录已过期，请重新登录')
      store.dispatch('user/logout')
      router.push('/login')
      return Promise.reject(new Error(message || '登录已过期'))
    } else {
      // 其他业务错误
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message || '请求失败'))
    }
  },
  error => {
    store.dispatch('app/setLoading', false)
    
    let message = '网络错误'
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          message = data.message || '请求参数错误'
          break
        case 401:
          message = '未授权，请重新登录'
          store.dispatch('user/logout')
          router.push('/login')
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求地址不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = data.message || `连接错误${status}`
      }
    } else if (error.code === 'ECONNABORTED') {
      message = '请求超时'
    } else if (error.message.includes('Network Error')) {
      message = '网络连接异常'
    }
    
    ElMessage.error(message)
    console.error('Response error:', error)
    return Promise.reject(error)
  }
)

export default request