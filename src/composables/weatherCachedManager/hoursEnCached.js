import { CACHE_CONFIG, setCache, getCache, getCityCacheKey } from '@/utils/cachedManager'
// import {useWeatherHoursStore} from '@/store/weatherHours'
import { useCityStore } from '@/store/city'
import { getHoursEnData } from '../enhancedData/index'
import { weatherApi } from '@/apis/weatherApi'

export const getHours = async () => {
  // 获取城市ID
  const cityStore = useCityStore()
  const cityId = +cityStore.cityInfo.id
  // 获取本地存储的键
  const cacheKeys = { hours: getCityCacheKey(CACHE_CONFIG.WEATHER_HOURS.key, cityId) }
  // 尝试获取值
  const cachedHours = getCache(cacheKeys.days);
  // 如果存在就使用本地存储
  if (cachedHours) return { hours: cachedHours, fromCache: true }
  // 本地不存在
  const res = await weatherApi.getWeatherHoursInfo(cityId)
  if (res) {
    // 获取数据后缓存本地
    const hoursData = getHoursEnData(res.data.hourly)
    setCache(cacheKeys.hours, hoursData, CACHE_CONFIG.WEATHER_HOURS.ttl)
    return {
      hours: hoursData,
      fromCache: false
    }
  }
}

