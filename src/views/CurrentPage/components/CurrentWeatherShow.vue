<template>
  <div>
    <div class="weather-card">
      <WeatherHoursCard v-for="weather in daysList" :weather="weather" :key="weather.id" />
    </div>
  </div>
</template>

<script setup>
import WeatherHoursCard from '../../../components/WeatherCard.vue'
import { ref, onMounted, onUnmounted } from 'vue'
import { weatherApi } from '../../../apis/weatherApi'
import { emitter } from '../../../utils/eventBus'

const daysList = ref([])
const hfdaysList = ref([])
const tidaysList = ref([])
const loading = ref(false)
const error = ref(null)
const selectedCity = ref('北京')

const fetchDataHeFeng = async (city) => {
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
      hfdaysList.value = result.data
      daysList.value = hfdaysList.value
      console.log("使用和风天气",daysList.value);
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
const fetchDataTi = async (city) => {
  const cityToUse = city || selectedCity.value
  loading.value = true
  error.value = null
  try {
    const response = await weatherApi.getWeatherDaysInfo(
      cityToUse,
      undefined,
      'tomorrow.io'
    )
    const result = response.data
    if (result.code === 200) {
      tidaysList.value = result.data
      selectedCity.value = cityToUse
      daysList.value = tidaysList.value
      console.log("使用Ti天气");
      // 更新当前城市
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
      fetchDataTi(cityName)
      fetchDataHeFeng(cityName)
    }
    selectedCity.value = cityName
}
const switchSource = (source) => {
  source ?
  (daysList.value = hfdaysList.value) :
  (daysList.value = tidaysList.value)
}
// 生命周期：注册监听器
onMounted(() => {
  emitter.on('cityName', handleCityChange)
  emitter.on('source', switchSource)
  // 初始加载默认城市的数据
  fetchDataTi()
  fetchDataHeFeng()

})

// 生命周期：移除监听器，防止内存泄漏
onUnmounted(() => {
  emitter.off('cityName', handleCityChange)
  emitter.on('source', switchSource)
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
  overflow: visible;
  -ms-overflow-style: none;
  user-select: none;
  cursor: grab;

}
</style>
