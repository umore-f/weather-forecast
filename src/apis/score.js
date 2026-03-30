import httpInstance from "./http"
export const errorScoreApi = {
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


