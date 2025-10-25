import { defineStore } from "pinia";
import { cityApi } from '@/apis/cityApi';
import { weatherApi } from '../apis/weatherApi';

import { ref, } from 'vue'
export const useWeatherStore = defineStore('weather', () => {
  // 天气信息
  const weatherInfo = ref({})
  const getWeather = async (location) => {
    const resCity = await cityApi.searchCity(location)
    const cityId = +resCity.data.location[0].id
    const resWeather = await weatherApi.getWearherInfo(cityId)
    if (resWeather.data.code === '200') {
      weatherInfo.value = resWeather.data.now || {}
    }
    else {
      throw new Error(resWeather.data.message || '获取天气信息失败')
    }
  }
  return {weatherInfo,getWeather}
})
