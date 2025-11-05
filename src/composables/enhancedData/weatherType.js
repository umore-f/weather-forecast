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
// 天气图标映射函数
const getWeatherIconByCode = (code) => {
  if (code == 100) return '1baitianqing'
  if (code == 150) return '2yejianqing'
  if (code == 101 || code == 102 || code == 104) return '5yin'
  if (code == 151 || code == 152 ) return '5yin'
  if (code == 103) return '3qingtianduoyun'
  if (code == 153) return '4yewanduoyun'
  if (code == 300 && code == 301) return '6baitianzhenyu'
  if (code == 350 || code == 351) return '7yewanzhenyu'
  if (code >= 302 && code <= 304) return '8leizhenyu'
  if (code == 305 || code == 309) return '11xiaoyu'
  if (code == 306 || code == 314 || code == 399) return '12zhongyu'
  if (code == 307 || code == 315) return '13dayu'
  if (code == 310 || code == 316) return '14baoyu'
  if (code == 311 || code == 317) return '15dabaoyu'
  if (code == 312 || code == 318) return '16tedabaoyu'
  if (code == 313) return '25dongyu'

  if (code == 400 || code == 499) return '19xiaoxue'
  if (code == 401 || code == 408) return '20zhongxue'
  if (code == 402 || code == 409) return '21daxue'
  if (code == 403 || code == 410) return '22baoxue'
  if (code == 404 || code == 405) return '10yujiaxue'
  if (code == 406 || code == 456) return '9zhenyujiaxue'
  if (code == 407) return '17qingtianzhenxue'
  if (code == 457) return '18yejianzhenxue'

  if (code == 501 || code == 509 || code == 510 || code == 514 || code == 515) return '23qingtianwu'

  if (code == 502 || code == 511 || code == 512 || code == 513) return '29wumai'

  if (code == 504) return '27fuchen'
  if (code == 503) return '28yangsha'
  if (code == 507 || code == 508) return '26shachenbao'

  if (code == 900) return '31reqiwengao'
  if (code == 901) return '32lengqiwendi'
  return '未知'
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
  getWeatherTypeByCode,weatherClassMap,getWeatherIconByCode
}
