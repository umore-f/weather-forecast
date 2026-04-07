
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
export const fieldOptionsShort1 = [
  { label: '最高温度 (°C)', value: 'tempMax' }, { label: '最低温度 (°C)', value: 'tempMin' },
  { label: '温度 (°C)', value: 'temp' }, { label: '湿度 (%)', value: 'humidity' },
  { label: '降水量 (mm)', value: 'precip' },{ label: '气压 (hPa)', value: 'pressure' },
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
export const cityCoordinates = {
  '北京': [116.4074, 39.9042],
  '上海': [121.4737, 31.2304],
  '广州': [113.2644, 23.1291],
  '深圳': [114.0579, 22.5431],
  '杭州': [120.1551, 30.2741],
  '成都': [104.0668, 30.5728],
  '南京': [118.7674, 32.0415],
  '武汉': [114.3055, 30.5931],
  '重庆': [106.5044, 29.5582],
  '苏州': [120.5853, 31.2989],
  '天津': [117.1902, 39.1256],
  '长沙': [112.9388, 28.2282],
  '青岛': [120.3826, 36.0668],
  '西安': [108.9402, 34.3416],
  '郑州': [113.6254, 34.7466],
  '合肥': [117.2272, 31.8206],
  '宁波': [121.5439, 29.8683],
  '无锡': [120.3124, 31.4908],
  '济南': [117.1205, 36.6512],
  '福州': [119.2965, 26.0745]
}
export const cityToProvince = {
  // 直辖市
  '北京': '北京',
  '上海': '上海',
  '天津': '天津',
  '重庆': '重庆',
  // 省份城市
  '广州': '广东',
  '深圳': '广东',
  '杭州': '浙江',
  '成都': '四川',
  '南京': '江苏',
  '武汉': '湖北',
  '苏州': '江苏',
  '长沙': '湖南',
  '青岛': '山东',
  '西安': '陕西',
  '郑州': '河南',
  '合肥': '安徽',
  '宁波': '浙江',
  '无锡': '江苏',
  '济南': '山东',
  '福州': '福建'
}
// 辅助：根据字段值获取label
export const getFieldLabel = (value) => {
  const field = fieldOptions.find(f => f.value === value)
  return field ? field.label : value
}
