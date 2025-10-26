import { defineStore } from "pinia";
import { cityApi } from '@/apis/cityApi';
import { weatherApi } from '../apis/weatherApi';

import { ref,} from 'vue'

export const useWeatherStore = defineStore('weather', () => {
  // 天气信息
  // 现在
  const weatherInfo = ref({})
  // 未来24小时(暂定)/每小时
  const weatherHoursInfo = ref([])
  const getWeather = async (location) => {
    const resCity = await cityApi.searchCity(location)
    const cityId = +resCity.data.location[0].id

    // 获取现在天气状况
    const resWeather = await weatherApi.getWeatherInfo(cityId)
    // 获取24小时天气情况
    const resWeatherHour = await weatherApi.getWeatherHoursInfo(cityId)

    if (resWeather.data.code === '200') {
      weatherInfo.value = resWeather.data.now || {}

    }
    if (resWeatherHour.data.code === '200') {
      weatherHoursInfo.value = resWeatherHour.data.hourly || []

    }
    else {
      throw new Error(resWeather.data.message || '获取天气信息失败')
    }
  }
  return {
    weatherInfo,
    weatherHoursInfo,
    getWeather,
  }
})
