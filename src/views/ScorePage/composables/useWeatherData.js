import { ref, computed, watch } from 'vue'
import { errorScoreApi } from '../../../apis/score'

export function useWeatherData(selectedCities, selectedSources, selectedFields, dateRange, mode) {
  const rawData = ref([])
  const loading = ref(false)

  const fetchData = async () => {
    if (selectedCities.value.length === 0 || selectedSources.value.length === 0 || selectedFields.value.length === 0) {
      rawData.value = []
      return
    }
    loading.value = true
    try {
      const cities = selectedCities.value
      const sources = selectedSources.value
      const range = dateRange.value ? { start: dateRange.value[0], end: dateRange.value[1] } : undefined
      let response
      if (mode.value === 'error') {
        response = await errorScoreApi.getWeatherDaysErrors(cities, range, sources)
      } else {
        response = await errorScoreApi.getWeatherDaysScore(cities, range, sources)
      }
      if (response.data && response.data.code === 200) {
        rawData.value = response.data.data || []
      } else {
        rawData.value = []
      }
    } catch (err) {
      console.error(err)
      rawData.value = []
    } finally {
      loading.value = false
    }
  }

  const uniqueDates = computed(() => {
    const dates = rawData.value.map(item => item.target_date)
    return [...new Set(dates)].sort((a, b) => new Date(a) - new Date(b))
  })

  // 监听筛选条件变化
  watch([selectedCities, selectedSources, selectedFields, dateRange, mode], () => {
    fetchData()
  }, { immediate: true })

  return { rawData, loading, uniqueDates, fetchData }
}
