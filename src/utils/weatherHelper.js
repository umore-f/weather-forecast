import {
  useCityStore,
  useWeatherNowStore,
  useWeatherHoursStore,
  useWeatherDaysStore
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
    // console.log('✅ 天气数据获取成功')
    // 2. 获取天气数据 - 分别调用以定位问题
    try {
      await nowStore.getNowData()
      console.log('✅ 实时天气获取成功')
    } catch (error) {
      console.error('❌ 实时天气获取失败:', error)
    }

    try {
      await hoursStore.getHoursData()
      console.log('✅ 小时预报获取成功')
    } catch (error) {
      console.error('❌ 小时预报获取失败:', error)
    }

    try {
      await daysStore.getDaysData()
      console.log('✅ 天预报获取成功')
    } catch (error) {
      console.error('❌ 天预报获取失败:', error)
    }

    return {
      city: cityStore.cityInfo,
      now: nowStore.now,
      hours: hoursStore.hours,
      days: daysStore.days
    }
  } catch (error) {
    console.error('❌ 获取数据失败:', error)
    throw error
  }
}
