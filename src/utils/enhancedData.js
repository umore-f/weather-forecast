import { computed } from 'vue'
import { useWeatherStore } from '@/store/weather.js'
import { formatTime, formatDateToMonthDay } from '@/utils/formatTime.js'


// 天气类型映射函数
const getWeatherTypeByCode = (code) => {
  if (code == 100 || code == 150) return 'sunny'
  if ((code >= 101 && code <= 104) || (code >= 151 && code <= 153)) return 'cloudy'
  if (code >= 300 && code <= 399) return 'rainy'
  if (code >= 400 && code <= 499) return 'snowy'
  if (code == 500 || code == 501 || code == 509 || code == 510 || code == 514 || code == 515) return 'atmosphere'
  if (code == 502 || (code <= 511 && code <= 513)) return 'haze'
  return 'unknown'
}

// 天气类型到CSS类的映射
const weatherClassMap = {
  'haze': 'weather-haze',
  'rainy': 'weather-rainy',
  'snowy': 'weather-snowy',
  'atmosphere': 'weather-foggy',
  'sunny': 'weather-sunny',
  'cloudy': 'weather-cloudy',
  'unknown': 'weather-default'
}

// 合并后的计算属性
export function useWeather() {
  // 在函数内部调用 store
  const weatherStore = useWeatherStore()
  // 合并后的计算实时天气属性
  const enhancedWeatherNowData = computed(() => {
    if (!weatherStore.weatherNowInfo) {
      return 'weather-default'
    }
    const weatherType = getWeatherTypeByCode(+weatherStore.weatherNowInfo.icon)
    const weatherClass = weatherClassMap[weatherType] || 'weather-default'
    return weatherClass
  })
  // 合并后的计算小时天气属性
  const enhancedWeatherHoursData = computed(() => {
    if (!weatherStore.weatherHoursInfo || !Array.isArray(weatherStore.weatherHoursInfo)) {
      return []
    }

    return weatherStore.weatherHoursInfo.map(item => {
      // 时间格式化
      const formattedTime = formatTime(item.fxTime)

      // 天气类型和CSS类计算
      const weatherType = getWeatherTypeByCode(+item.icon)
      const weatherClass = weatherClassMap[weatherType] || 'weather-default'

      return {
        ...item,
        fxTime: formattedTime,
        weatherClass,
        weatherType
      }
    })
  })
  // 合并后的计算每天天气属性
  const enhancedWeatherDaysData = computed(() => {
    if (!weatherStore.weatherDaysInfo || !Array.isArray(weatherStore.weatherDaysInfo)) {
      return []
    }
    console.log('属性计算了吗');

    return weatherStore.weatherDaysInfo.map(item => {
      // 时间格式化
      const formattedTime = formatDateToMonthDay(item.fxDate)

      // 天气类型和CSS类计算
      const weatherType = getWeatherTypeByCode(+item.iconDay)
      const weatherClass = weatherClassMap[weatherType] || 'weather-default'

      return {
        ...item,
        fxDate: formattedTime,
        weatherClass,
        weatherType
      }
    })
  })

  return {
    enhancedWeatherHoursData,
    enhancedWeatherDaysData,
    enhancedWeatherNowData,
  }
}
