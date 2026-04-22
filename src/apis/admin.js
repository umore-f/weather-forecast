import httpInstance from './http'

// 管理员登录
export const adminLogin = (data) => httpInstance.post('/admin/login', data)

// 获取管理员信息（需要认证）
export const getAdminProfile = () => httpInstance.get('/admin/profile')

// 获取所有用户列表（仅管理员）
export const getUsers = () => httpInstance.get('/admin/users')

// 获取指定用户的设置（仅管理员）
export const getUserSettingsById = (userId) => httpInstance.get(`/admin/users/${userId}/settings`)

export const disableUserById = (userId) => httpInstance.put(`/admin/users/${userId}/disable`)

export const enableUserById = (userId) => httpInstance.put(`/admin/users/${userId}/enable`)
