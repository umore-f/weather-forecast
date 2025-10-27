import { defineStore } from "pinia";
import { cityApi } from '@/apis/cityApi';
import { weatherApi } from '../apis/weatherApi';
import { weatherCacheManager } from '@/utils/weatherCacheManager'
import { ref, } from 'vue'

export const useWeatherStore = defineStore('weather', () => {
  const weatherNowInfo = ref({})
  const weatherHoursInfo = ref([])
  const weatherDaysInfo = ref([])
  const currentCity = ref('')
  const currentCityId = ref('')

  const getWeather = async (location) => {
    try {
      const apiCallbacks = {
        searchCity: cityApi.searchCity,
        getWeatherNowInfo: weatherApi.getWeatherNowInfo,
        getWeatherHoursInfo: weatherApi.getWeatherHoursInfo,
        getWeatherDaysInfo: weatherApi.getWeatherDaysInfo
      };

      const weatherData = await weatherCacheManager.getWeatherWithCache(location, apiCallbacks);

      currentCity.value = location;
      currentCityId.value = weatherData.cityId;
      weatherNowInfo.value = weatherData.now || {};
      weatherHoursInfo.value = weatherData.hours || [];
      weatherDaysInfo.value = weatherData.days || [];

      console.log(weatherData.fromCache ? '📦 使用缓存数据' : '🌤️ 使用新数据');

    } catch (error) {
      console.error('获取天气数据失败:', error);
      throw error;
    }
  }

  const clearCache = () => {
    weatherCacheManager.clearAllWeatherCache();
  }

  const getCacheStatus = () => {
    return weatherCacheManager.getCacheStatus();
  }

  return {
    weatherNowInfo,
    weatherHoursInfo,
    weatherDaysInfo,
    currentCity,
    currentCityId,
    getWeather,
    clearCache,
    getCacheStatus
  }
})
