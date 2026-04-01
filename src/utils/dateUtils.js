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
