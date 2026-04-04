import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export function convertToLocalDate(utcTimeStr) {
  return dayjs(utcTimeStr).tz('Asia/Shanghai').format('YYYY-MM-DD')
}

export function compareDate(a, b) {
  return dayjs(a).valueOf() - dayjs(b).valueOf()
}

export function stdDev(arr) {
  if (arr.length === 0) return 0
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length
  const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length
  return Math.sqrt(variance)
}
