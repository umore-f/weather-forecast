import { CACHE_CONFIG, setCache, getCache, getCityCacheKey } from '@/utils/cachedManager'
// import { useWeatherDaysStore } from '@/store/weatherDay'
import { getDaysEnData } from '../enhancedData/index'
import { useCityStore } from '@/store/city'
import { weatherApi } from '@/apis/weatherApi'
export const getDays = async () => {
  // 获取城市ID
  const cityStore = useCityStore()
  const cityId = +cityStore.cityInfo.id
  // 获取本地存储的键
  const cacheKeys = { days: getCityCacheKey(CACHE_CONFIG.WEATHER_DAYS.key, cityId) }

  // 尝试获取值
  const cachedDays = getCache(cacheKeys.days);
  // 如果存在就使用本地存储
  if (cachedDays) return { days: cachedDays, fromCache: true }
  // 本地不存在
  const res = await weatherApi.getWeatherDaysInfo(cityId)
  if (res) {
    // 获取数据后缓存本地
    const daysData = getDaysEnData(res.data.daily)
    setCache(cacheKeys.days, daysData, CACHE_CONFIG.WEATHER_DAYS.ttl)
    return {
      days: daysData,
      fromCache: false
    }
  }
}

