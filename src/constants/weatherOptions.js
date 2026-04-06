
export const cityOptions = [
  { label: '北京', value: '北京' }, { label: '上海', value: '上海' }, { label: '广州', value: '广州' },
  { label: '深圳', value: '深圳' }, { label: '杭州', value: '杭州' }, { label: '成都', value: '成都' },
  { label: '南京', value: '南京' }, { label: '武汉', value: '武汉' }, { label: '重庆', value: '重庆' },
  { label: '苏州', value: '苏州' }, { label: '天津', value: '天津' }, { label: '长沙', value: '长沙' },
  { label: '青岛', value: '青岛' }, { label: '西安', value: '西安' }, { label: '郑州', value: '郑州' },
  { label: '合肥', value: '合肥' }, { label: '宁波', value: '宁波' }, { label: '无锡', value: '无锡' },
  { label: '济南', value: '济南' }, { label: '福州', value: '福州' }
]

export const fieldOptions = [
  { label: '最高温度 (°C)', value: 'temp_max' }, { label: '最低温度 (°C)', value: 'temp_min' },
  { label: '温度 (°C)', value: 'temp' }, { label: '湿度 (%)', value: 'humidity' },
  { label: '风速 (km/h)', value: 'wind_speed' }, { label: '风向', value: 'wind_direction' },
  { label: '降水量 (mm)', value: 'precip_total' }, { label: '降水概率 (%)', value: 'precip_prob' },
  { label: '气压 (hPa)', value: 'pressure' }, { label: '云量 (%)', value: 'cloud_cover' },
  { label: '能见度 (km)', value: 'visibility' }, { label: '紫外线指数', value: 'uv_index' },
  { label: '露点 (°C)', value: 'dew' }, { label: '阵风 (km/h)', value: 'wind_gust' },
  { label: '日出时间', value: 'sunrise' }, { label: '日落时间', value: 'sunset' }
]
export const fieldOptionsShort = [
  { label: '最高温度 (°C)', value: 'temp_max' }, { label: '最低温度 (°C)', value: 'temp_min' },
  { label: '温度 (°C)', value: 'temp' }, { label: '湿度 (%)', value: 'humidity' },
  { label: '降水量 (mm)', value: 'precip_total' },{ label: '气压 (hPa)', value: 'pressure' },
]
export const sourceOptions = [
  { label: '和风天气', value: 'QWeather' },
  { label: 'tomorrow.io', value: 'tomorrow.io' },
  { label: 'visualcrossing', value: 'visualcrossing' }
]

export const fieldScoreOptions = [
  { label: '最高温度', value: 'tempMax' },
  { label: '最低温度', value: 'tempMin' },
  { label: '平均温度', value: 'temp' },
  { label: '相对湿度', value: 'humidity' },
  { label: '降水量', value: 'precip' },
  { label: '气压', value: 'pressure' }
]

// 辅助：根据字段值获取label
export const getFieldLabel = (value) => {
  const field = fieldOptions.find(f => f.value === value)
  return field ? field.label : value
}
