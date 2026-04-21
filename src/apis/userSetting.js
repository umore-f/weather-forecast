import httpInstance from './http'
// 获取当前用户的设置
export const getUserSettings = () => httpInstance.get('/user/settings')

// 更新用户设置
export const updateUserSettings = (data) => httpInstance.put('/user/settings', data)
