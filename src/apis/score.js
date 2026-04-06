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
  getWeatherDaysErrorsStatistics(source, error_type, dataRange, city) {
    return httpInstance({
      url: '/errors/statistics',
      params: {
        source,
        error_type,
        start_date: dataRange[0],
        end_date: dataRange[1],
        city,
      }
    })
  },
  getWeatherDaysErrorsAvg({ source, city, dateRange }) {
    return httpInstance({
      url: '/errors/avg-by-fields',
      params: {
        city,
        source,
        start_date: dateRange?.[0],
        end_date: dateRange?.[1],
      }
    })
  },
  getWeatherDaysErrorsPaging({ source, city, dateRange, error_type, page, pageSize, sortField, sortOrder}) {
    return httpInstance({
      url: '/errors/list',
      params: {
        city,
        source,
        error_type,
        start_date: dateRange?.[0],
        end_date: dateRange?.[1],
        page,
        pageSize,
        sortField,
        sortOrder
      }
    })
  }
}


