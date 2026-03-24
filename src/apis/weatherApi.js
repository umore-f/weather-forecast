import httpInstance from "./http"
export const weatherApi = {
  // 实时-获取天气信息
  getWeatherNowInfo(location, date, source) {
    return httpInstance({
      url: '/current',
      params: {
        location,
        date,
        source,
      }
    })
  },
  getWeatherDaysInfo(location, date, source) {
    return httpInstance({
      url: '/days',
      params: {
        location,
        date,
        source
      }
    })
  },
}


