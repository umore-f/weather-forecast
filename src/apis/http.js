// src/utils/http.js
import axios from 'axios'

const httpInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器：自动添加 token
httpInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器：统一处理 401 等错误
httpInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // 未认证或 token 过期
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('role')
        console.warn('认证失败，请重新登录')
      }
      console.error('响应错误:', error.response.status, error.response.data)
    } else if (error.request) {
      console.error('网络错误，请检查网络连接')
    } else {
      console.error('请求配置错误:', error.message)
    }
    return Promise.reject(error)
  }
)

export default httpInstance
