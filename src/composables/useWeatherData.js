import { ref, watch } from 'vue'
import { weatherApi } from '../apis/weatherApi'

export function useWeatherData(selectedCities, selectedFields, selectedSource, dateRange, selectedBarDate) {
  const daysList = ref([])
  const loading = ref(false)

  const fetchData = async () => {
    if (!selectedCities.value.length && !selectedFields.value.length) {
      daysList.value = []
      loading.value = false
      return
    }

    loading.value = true
    try {
      const range = dateRange.value ? { start: dateRange.value[0], end: dateRange.value[1] } : selectedBarDate.value
      const response = await weatherApi.getWeatherDaysInfo(
        selectedCities.value,
        range,
        selectedSource.value
      )
      if (response.data && response.data.code === 200) {
        daysList.value = response.data.data || []
      } else {
        console.error('API 错误：', response.message || '未知错误')
        daysList.value = []
      }
    } catch (err) {
      console.error('请求失败：', err)
      daysList.value = []
    } finally {
      loading.value = false
    }
  }

  watch([selectedCities, selectedFields, selectedSource, dateRange, selectedBarDate], fetchData, { immediate: true })

  return { daysList, loading }
}
