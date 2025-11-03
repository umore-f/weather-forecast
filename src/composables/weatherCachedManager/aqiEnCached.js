import { CACHE_CONFIG, setCache, getCache, getCityCacheKey } from '@/utils/cachedManager'
import { useCityStore } from '@/store/city'
import { AQIApi } from '@/apis/AQIApi'
export const getAqi = async () => {
  // 获取城市ID
  const cityStore = useCityStore()
  const cityId = +cityStore.cityInfo.id
  const currentLat = Number(Number(cityStore.cityInfo.lat).toFixed(2))
  const currentLon = Number(Number(cityStore.cityInfo.lon).toFixed(2))

  // 获取本地存储的键
  const cacheKeys = { aqi: getCityCacheKey(CACHE_CONFIG.AIR_QUALITY.key, cityId) }

  // 尝试获取值
  const cachedAqi = getCache(cacheKeys.aqi);
  // 如果存在就使用本地存储
  if (cachedAqi) return { aqi: cachedAqi, fromCache: true }
  // 本地不存在
  const res = await AQIApi.getAQIInfo(currentLat,currentLon)
  if (res) {
    // 获取数据后缓存本地
    const aqiData = res.data.list
    setCache(cacheKeys.aqi, aqiData, CACHE_CONFIG.AIR_QUALITY.ttl)
    return {
      aqi: aqiData,
      fromCache: false
    }
  }
}

