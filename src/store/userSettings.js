// stores/userSettings.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserSettings } from '@/apis/userSetting'

export const useUserSettingsStore = defineStore('userSettings', () => {
  // 状态
  const settings = ref({
    display_cities: [],
    weather_fields: [],
    data_sources: [],
    date_start: null,
    date_end: null,
  })
  const loaded = ref(false)    // 是否已加载过
  const loading = ref(false)

  // 动作：从后端获取设置
  async function fetchSettings(force = false) {
    if (loaded.value && !force) return
    loading.value = true
    try {
      const res = await getUserSettings()
      settings.value = {
        display_cities: res.data.display_cities || [],
        weather_fields: res.data.weather_fields || [],
        data_sources: res.data.data_sources || [],
        date_start: res.data.date_start || null,
        date_end: res.data.date_end || null,
      }
      loaded.value = true
    } catch (error) {
      // 未登录或请求失败时，使用默认空设置
      console.warn('获取用户设置失败，使用默认值', error)
      settings.value = { display_cities: [], weather_fields: [], data_sources: [], date_start: null, date_end: null }
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  // 动作：手动更新设置（可在设置页保存成功后调用）
  function updateSettings(newSettings) {
    settings.value = { ...settings.value, ...newSettings }
    // 不重新请求，直接更新本地状态
  }

  // 重置（退出登录时）
  function reset() {
    settings.value = { display_cities: [], weather_fields: [], data_sources: [], date_start: null, date_end: null }
    loaded.value = false
  }

  return { settings, loaded, loading, fetchSettings, updateSettings, reset }
})
