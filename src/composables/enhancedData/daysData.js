import { getWeatherTypeByCode, weatherClassMap } from './weatherType'
import { getMonthDay, getWeekday } from '@/utils/formatTime'
export function getDaysEnData(days) {
  console.log("未来7天天气处理");

  // 合并后的计算每天天气属性
  if (!days || !Array.isArray(days)) {
    return []
  }
  return days.map(item => {
    // 数据是否被处理过
    const isProcessed = true
    // 时间格式化转换为月-日
    const formattedTime = getMonthDay(item.fxDate)
    // 时间格式化转换为星期几
    const weekDay = getWeekday(item.fxDate)
    // 天气类型和CSS类计算
    const weatherType = getWeatherTypeByCode(+item.iconDay)
    const weatherClass = weatherClassMap[weatherType] || 'weather-default'

    return {
      ...item,
      fxDate: formattedTime,
      weatherClass,
      weatherType,
      weekDay,
      isProcessed
    }
  })
}
