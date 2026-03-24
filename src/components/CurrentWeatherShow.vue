<template>
  <div>
    <div class="weather-card">
      <WeatherHoursCard v-for="weather in daysList" :weather="weather"
        :key="weather.id" />
    </div>
  </div>
</template>

<script setup>
import WeatherHoursCard from '../components/HourCardList.vue'
import { ref, onMounted, onUnmounted } from 'vue'
import { weatherApi } from '../apis/weatherApi'
import { emitter } from '../utils/eventBus'

const daysList = ref([])
const loading = ref(false)
const error = ref(null)
const selectedCity = ref('北京')

const fetchData = async (city) => {
  const cityToUse = city || selectedCity.value
  loading.value = true
  error.value = null
  try {
    const response = await weatherApi.getWeatherDaysInfo(
      cityToUse,
      undefined,
      'QWeather'
    )
    const result = response.data
    if (result.code === 200) {
      daysList.value = result.data
      selectedCity.value = cityToUse   // 更新当前城市
    } else {
      error.value = result.message
    }
  } catch (err) {
    error.value = err.message || '网络请求失败'
  } finally {
    loading.value = false
  }
}

// 定义事件处理函数
const handleCityChange = (cityName) => {
  if (cityName) {
    fetchData(cityName)
    selectedCity.value = cityName
  }
}

// 生命周期：注册监听器
onMounted(() => {
  emitter.on('cityName', handleCityChange)
  // 初始加载默认城市的数据
  fetchData()
})

// 生命周期：移除监听器，防止内存泄漏
onUnmounted(() => {
  emitter.off('cityName', handleCityChange)
})
</script>

<style scoped>
.weather-card {
  height: 95%;
  display: flex;
  justify-content: space-between;
  overflow-x: auto;
  flex-wrap: nowrap;
  scrollbar-width: none;

  -ms-overflow-style: none;
  user-select: none;
  cursor: grab;

}
</style>
