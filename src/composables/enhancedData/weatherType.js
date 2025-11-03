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
export {
  getWeatherTypeByCode,weatherClassMap
}
