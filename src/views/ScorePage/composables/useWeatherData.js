import { ref, computed, watch } from 'vue'
import { errorScoreApi } from '../../../apis/score'

export function useWeatherErrorData(selectedCities, selectedSources, selectedFields, dateRange) {
  const rawErrorData = ref([])
  const errorLoading = ref(false)

  const fetchData = async () => {
    if (selectedCities.value.length === 0 || selectedSources.value.length === 0 || selectedFields.value.length === 0) {
      rawErrorData.value = []
      return
    }
    errorLoading.value = true
    try {
      const cities = selectedCities.value
      const sources = selectedSources.value
      const range = dateRange.value ? { start: dateRange.value[0], end: dateRange.value[1] } : undefined
      let response
        response = await errorScoreApi.getWeatherDaysErrors(cities, range, sources)
      if (response.data && response.data.code === 200) {
        rawErrorData.value = response.data.data || []
      } else {
        rawErrorData.value = []
      }
    } catch (err) {
      console.error(err)
      rawErrorData.value = []
    } finally {
      errorLoading.value = false
    }
  }

  const uniqueDates = computed(() => {
    const dates = rawErrorData.value.map(item => item.target_date)
    return [...new Set(dates)].sort((a, b) => new Date(a) - new Date(b))
  })

  // 监听筛选条件变化
  watch([selectedCities, selectedSources, selectedFields, dateRange], () => {
    fetchData()
  }, { immediate: true })

  return { rawErrorData, errorLoading, uniqueDates, fetchData }
}
export function useWeatherScoreData(selectedCities, selectedSources, selectedFields, dateRange) {
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
        response = await errorScoreApi.getWeatherDaysScore(cities, range, sources)
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
  watch([selectedCities, selectedSources, selectedFields, dateRange ], () => {
    fetchData()
  }, { immediate: true })

  return { rawData, loading, uniqueDates, fetchData }
}
