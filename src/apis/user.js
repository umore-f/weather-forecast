// src/api/auth.js
import httpInstance from './http'

// 用户注册
export const register = (data) => httpInstance.post('/auth/register', data)

// 用户登录
export const userLogin = (data) => httpInstance.post('/auth/login', data)

// 获取用户信息（需要认证）
export const getUserProfile = () => httpInstance.get('/auth/profile')


