// 在 utils/weatherHelper.js 或其他工具文件中
import { useCityStore } from '@/store/city'
import { useWeatherStore } from '@/store/weather'

export const fetchCityAndWeather = async (cityName) => {
  const cityStore = useCityStore()
  const weatherStore = useWeatherStore()

  try {
    console.log('🔄 开始获取城市和天气数据...')

    // 1. 获取城市信息
    await cityStore.getCityInfo(cityName)

    // 检查城市数据是否获取成功
    if (!cityStore.cityInfo?.id) {
      throw new Error('城市数据获取失败')
    }

    console.log('✅ 城市数据获取成功:', cityStore.cityInfo)

    // 2. 获取天气数据
    await weatherStore.getWeather()

    console.log('✅ 天气数据获取成功')

    return {
      city: cityStore.cityInfo,
      weather: {
        now: weatherStore.weatherNowInfo,
        hours: weatherStore.weatherHoursInfo,
        days: weatherStore.weatherDaysInfo
      }
    }
  } catch (error) {
    console.error('❌ 获取数据失败:', error)
    throw error
  }
}
