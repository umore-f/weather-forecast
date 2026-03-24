// src/utils/http.js
import axios from 'axios'

// 创建 axios 实例
const httpInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE, // 基础路径，通常配置环境变量或使用代理
  timeout: 10000, // 请求超时时间（毫秒）
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器（可选）
httpInstance.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么，例如添加 token
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  error => {
    // 对请求错误做些什么
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器（可选）
httpInstance.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    return response
  },
  error => {
    // 对响应错误做点什么
    if (error.response) {
      // 服务器返回了错误状态码
      console.error('响应错误:', error.response.status, error.response.data)
      // 可以根据状态码做统一处理，如跳转登录
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络错误，请检查网络连接')
    } else {
      console.error('请求配置错误:', error.message)
    }
    return Promise.reject(error)
  }
)

export default httpInstance