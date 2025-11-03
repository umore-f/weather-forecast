import { getWeatherTypeByCode, weatherClassMap } from './weatherType'
import { getHourMin } from '@/utils/formatTime'
// import { computed } from 'vue';
export function getHoursEnData(hours) {
  console.log("小时天气处理");
  // 合并后的计算小时天气属性
  if (!hours || !Array.isArray(hours)) {
    return []
  }
  return hours.map(item => {
    // 数据是否被处理过
    const isProcessed = true
    // 时间格式化
    const formattedTime = getHourMin(item.fxTime)

    // 天气类型和CSS类计算
    const weatherType = getWeatherTypeByCode(+item.icon)
    const weatherClass = weatherClassMap[weatherType] || 'weather-default'

    return {
      ...item,
      fxTime: formattedTime,
      weatherClass,
      weatherType,
      isProcessed
    }
  })
}

