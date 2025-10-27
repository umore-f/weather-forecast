import { defineStore } from "pinia";
import { cityApi } from '@/apis/cityApi';
import { weatherApi } from '../apis/weatherApi';

import { ref, } from 'vue'

export const useWeatherStore = defineStore('weather', () => {
  // 天气信息
  // 现在
  const weatherInfo = ref({})
  // 未来24小时(暂定)/每小时
  const weatherHoursInfo = ref([])
  // 未来七天
  const weatherDaysInfo = ref([])
  const getWeather = async (location) => {
    const resCity = await cityApi.searchCity(location)
    const cityId = +resCity.data.location[0].id
    // 获取现在天气状况
    // 获取24小时天气情况
    // 获取未来7天天气情况
    const [resWeather, resWeatherHour, resWeatherDays] = await Promise.all([weatherApi.getWeatherInfo(cityId), weatherApi.getWeatherHoursInfo(cityId), weatherApi.getWeatherDaysInfo(cityId)])

    if (resWeather.data.code === '200') {
      weatherInfo.value = resWeather.data.now || {}
    }
    if (resWeatherHour.data.code === '200') {
      weatherHoursInfo.value = resWeatherHour.data.hourly || []
    }
    if (resWeatherDays.data.code === '200') {
      weatherDaysInfo.value = resWeatherDays.data.daily || []
    }
    else {
      throw new Error(resWeather.data.message || '获取天气信息失败')
    }
  }
  return {
    weatherInfo,
    weatherHoursInfo,
    weatherDaysInfo,
    getWeather,
  }
})
