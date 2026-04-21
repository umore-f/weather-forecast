// composables/useUserPreferences.js
import { computed, onMounted } from 'vue'
import { useUserSettingsStore } from '@/store/userSettings'

export function useUserPreferences() {
  const settingsStore = useUserSettingsStore()

  // 确保组件挂载时获取设置（如果尚未获取）
  onMounted(() => {
    if (!settingsStore.loaded) {
      settingsStore.fetchSettings()
    }
  })

  // 可直接使用的响应式设置
  const defaultCities = computed(() => settingsStore.settings.display_cities)
  const defaultFields = computed(() => settingsStore.settings.weather_fields)
  const defaultSources = computed(() => settingsStore.settings.data_sources)
  const defaultDateStart = computed(() => settingsStore.settings.date_start)
  const defaultDateEnd = computed(() => settingsStore.settings.date_end)

  // 辅助方法：构建可用于 API 请求的查询参数对象
  const buildQueryParams = (overrides = {}) => {
    const params = {
      city: defaultCities.value,
      source: defaultSources.value,
      start_date: defaultDateStart.value,
      end_date: defaultDateEnd.value,
      // 如果需要字段列表，可能需要特殊处理（例如多个字段）
      fields: defaultFields.value,
      ...overrides,
    }
    // 过滤掉空数组或 null 值
    Object.keys(params).forEach(key => {
      if (params[key] === null || params[key] === undefined || (Array.isArray(params[key]) && params[key].length === 0)) {
        delete params[key]
      }
    })
    return params
  }

  return {
    // 状态
    defaultCities,
    defaultFields,
    defaultSources,
    defaultDateStart,
    defaultDateEnd,
    loading: computed(() => settingsStore.loading),
    loaded: computed(() => settingsStore.loaded),

    // 方法
    buildQueryParams,
    refresh: () => settingsStore.fetchSettings(true), // 强制刷新
  }
}
