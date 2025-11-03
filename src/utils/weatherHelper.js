import {
  useCityStore,
  useWeatherNowStore,
  useWeatherHoursStore,
  useWeatherDaysStore,
  useAqiStore
} from '@/store/index'

// 确保城市API先返回
export const fetchCityAndWeather = async (cityName) => {
  try {
    const cityStore = useCityStore()
    const nowStore = useWeatherNowStore()
    const hoursStore = useWeatherHoursStore()
    const daysStore = useWeatherDaysStore()
    console.log('🔄 开始获取城市和天气数据...')
    // 1. 获取城市信息
    await cityStore.getCityInfo(cityName)

    // 检查城市数据是否获取成功
    if (!cityStore.cityInfo?.id) {
      throw new Error('城市数据获取失败')
    }

    console.log('✅ 城市数据获取成功:', cityStore.cityInfo)

    // 2. 获取天气数据
    // await Promise.all([nowStore.getNowData(),hoursStore.getHoursData(),daysStore.getDaysData()])
    await Promise.all([
      nowStore.getNowData(),
      hoursStore.getHoursData(),
      daysStore.getDaysData(),])
    return {
      city: cityStore.cityInfo,
      now: nowStore.now,
      hours: hoursStore.hours,
      days: daysStore.days,
    }

  } catch (error) {
    console.error('❌ 获取数据失败:', error)
    throw error
  }
}

// 单独加载AQI数据
export const fetchAqiData = async () => {
  try {
    const aqiStore = useAqiStore()
    await aqiStore.getAqiData()
    return aqiStore.aqi
  } catch (error) {
    console.error('❌ 获取AQI数据失败:', error)
    throw error
  }
}
