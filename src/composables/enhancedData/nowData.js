// import {getWeatherTypeByCode,weatherClassMap, getWeatherIconByCode} from './weatherType'
import {getHourMin} from '@/utils/formatTime'

export function getNowEnData(now) {
  console.log("实时天气处理");

  if (!now) {
    return [] // 直接返回空数组
  }

  const weatherNowInfo = [now]
  // 直接返回处理后的数据，不是函数
  return weatherNowInfo.map(item => {
    const isProcessed = true
    const formattedTime = getHourMin(item.obsTime)
    // const weatherType = getWeatherTypeByCode(+item.icon)
    // const weatherIcon = getWeatherIconByCode(+item.icon)
    // const weatherClass = weatherClassMap[weatherType] || 'weather-default'

    return {
      ...item,
      obsTime: formattedTime,
      // weatherClass,
      // weatherType,
      // weatherIcon,
      isProcessed
    }
  })
}
