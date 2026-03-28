import httpInstance from "./http"
export const errorScoreApi = {
  // 实时-获取天气信息
  getWeatherDaysErrors(location, date, source) {
    return httpInstance({
      url: '/errors',
      params: {
        location,
        date,
        source,
      }
    })
  },
  getWeatherDaysScore(location, date, source) {
    return httpInstance({
      url: '/score',
      params: {
        location,
        date,
        source
      }
    })
  },
}


