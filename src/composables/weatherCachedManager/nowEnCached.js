import { CACHE_CONFIG, setCache, getCache, getCityCacheKey } from '@/utils/cachedManager'
import { useCityStore } from '@/store/city'
// import {useWeatherNowStore} from '@/store/weatherNow'
import {weatherApi} from '@/apis/weatherApi'
import {getNowEnData} from '../enhancedData/index'
export const getNow = async () => {
  // 获取城市ID
  const cityStore = useCityStore()
  const cityId = +cityStore.cityInfo.id
  // 获取本地存储的键
  const cacheKeys = { now: getCityCacheKey(CACHE_CONFIG.WEATHER_NOW.key, cityId) }
  // 尝试获取值
  const cachedNow = getCache(cacheKeys.days);
  // 如果存在就使用本地存储
  if(cachedNow) return {now: cachedNow,fromCache: true}
  // 本地不存在
  const res = await weatherApi.getWeatherNowInfo(cityId)
  if (res) {
    // 获取数据后缓存本地
    const nowData = getNowEnData(res.data.now)
    setCache(cacheKeys.now,nowData,CACHE_CONFIG.WEATHER_NOW.ttl)
    return {
      now:nowData,
      fromCache:false
    }
  }
}

