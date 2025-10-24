import axios from "axios";
import { tokenManager } from './tokenManager.js';

const httpInstance = axios.create({
  baseURL: `/api`,
  timeout: 10000, // 建议设置更长的超时时间
});

// 添加请求拦截器 - 动态添加Token
httpInstance.interceptors.request.use(async function (config) {
  try {
    // 动态获取Token（每次请求都确保使用有效Token）
    const token = await tokenManager.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`🚀`);
//  发送请求: ${config.method?.toUpperCase()} ${config.url}
  } catch (error) {
    console.error('❌ 获取Token失败:', error);
    // 可以选择在这里处理Token获取失败的情况
  }

  return config;
}, function (error) {
  console.error('❌ 请求配置错误:', error);
  return Promise.reject(error);
});

// 添加响应拦截器
httpInstance.interceptors.response.use(function (response) {
  console.log(`✅ 请求成功: ${response.status} ${response.config.url}`);
  return response;
}, function (error) {
  console.error('❌ 请求失败:', {
    url: error.config?.url,
    method: error.config?.method,
    status: error.response?.status,
    message: error.message
  });

  // 处理Token过期的情况
  if (error.response?.status === 401) {
    console.log('🔄 Token可能过期，清除缓存');
    tokenManager.currentToken = null; // 强制下次重新获取Token
  }

  return Promise.reject(error);
});

export default httpInstance;

