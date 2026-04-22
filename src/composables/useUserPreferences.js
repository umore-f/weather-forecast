// composables/useUserPreferences.js
import { computed, onMounted } from 'vue'
import { useUserSettingsStore } from '@/store/userSettings'

export function useUserPreferences() {
  const settingsStore = useUserSettingsStore()
  const role = localStorage.getItem('role')
  const isAdmin = role === 'admin'
  // 管理员：返回空设置，不加载任何数据
  if (isAdmin) {
    return {
      defaultCities: computed(() => []),
      defaultFields: computed(() => []),
      defaultSources: computed(() => []),
      defaultDateStart: computed(() => null),
      defaultDateEnd: computed(() => null),
      loaded: computed(() => true),
      loading: computed(() => false),
      buildQueryParams: (overrides = {}) => overrides,
      refresh: () => {},
    }
  }
  // 确保组件挂载时获取设置
  onMounted(() => {
    if (!settingsStore.loaded) {
      settingsStore.fetchSettings()
    }
  })

  const defaultCities = computed(() => settingsStore.settings.display_cities)
  const defaultFields = computed(() => settingsStore.settings.weather_fields)
  const defaultSources = computed(() => settingsStore.settings.data_sources)
  const defaultDateStart = computed(() => settingsStore.settings.date_start)
  const defaultDateEnd = computed(() => settingsStore.settings.date_end)

  const buildQueryParams = (overrides = {}) => {
    const params = {
      city: defaultCities.value,
      source: defaultSources.value,
      start_date: defaultDateStart.value,
      end_date: defaultDateEnd.value,
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
