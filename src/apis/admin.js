import httpInstance from './http'

// 管理员登录
export const adminLogin = (data) => httpInstance.post('/admin/login', data)

// 获取管理员信息（需要认证）
export const getAdminProfile = () => httpInstance.get('/admin/profile')
