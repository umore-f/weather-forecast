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
  getWeatherDaysErrorsStatistics(source, dataRange, city, error_type) {
    return httpInstance({
      url: '/errors/statistics',
      params: {
        source,
        start_date: dataRange[0],
        end_date: dataRange[1],
        city,
        metric: error_type,
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
  getWeatherDaysErrorsAvgBySource({ source, city, dateRange, errorType }) {
    return httpInstance({
      url: '/errors/trend',
      params: {
        city,
        source,
        start_date: dateRange?.[0],
        end_date: dateRange?.[1],
        metric: errorType,
      }
    })
  },
  getWeatherDaysErrorsAvgByCity({ source, city, dateRange, errorType }) {
    return httpInstance({
      url: '/errors/heatmap',
      params: {
        city,
        source,
        start_date: dateRange?.[0],
        end_date: dateRange?.[1],
        metric: errorType,
      }
    })
  },
  getWeatherDaysErrorsPaging({ source, city, dateRange, page, pageSize, sortField, sortOrder }) {
    return httpInstance({
      url: '/errors/list',
      params: {
        city,
        source,
        start_date: dateRange?.[0],
        end_date: dateRange?.[1],
        page,
        pageSize,
        sortField,
        sortOrder
      }
    })
  },
  getWeatherDaysScoreAvg({ source, city, dateRange }) {
    return httpInstance({
      url: '/score/avg-by-source',
      params: {
        city,
        source,
        start_date: dateRange?.[0],
        end_date: dateRange?.[1],
      }
    })
  },
  getWeatherDaysScoreAvgBySD({ source, city, dateRange }) {
    return httpInstance({
      url: '/score/avg-by-source-date',
      params: {
        city,
        source,
        start_date: dateRange?.[0],
        end_date: dateRange?.[1],
      }
    })
  },
  getWeatherDaysScoreAvgBySourceAll({ source, city, dateRange }) {
    return httpInstance({
      url: '/score/avg-by-source-all',
      params: {
        city,
        source,
        start_date: dateRange?.[0],
        end_date: dateRange?.[1],
      }
    })
  },
  getWeatherDaysScoreDetail({ city, source, dateRange }) {
    return httpInstance({
      url: '/score/detail',
      params: {
        city,
        source,
        start_date: dateRange?.[0],
        end_date: dateRange?.[1],
      }
    })
  },
  getWeatherDaysScoreCityDetail({ city, dateRange }) {
    return httpInstance({
      url: '/score/city_detail',
      params: {
        city,
        start_date: dateRange?.[0],
        end_date: dateRange?.[1],
      }
    })
  },
  getWeatherDaysScoreList({ city, source, dateRange, sortField, sortOrder, page, pageSize }) {
    const params = {
      page,
      pageSize,
    };
    if (city?.length) params.city = city;
    if (source?.length) params.source = source;
    if (dateRange && dateRange.length === 2) {
      params.start_date = dateRange[0];
      params.end_date = dateRange[1];
    }
    if (sortField) params.sortField = sortField;
    if (sortOrder) params.sortOrder = sortOrder;
    return httpInstance({
      url: '/score/list',
      params,
    });
  },
  getWeatherDaysScoreByCitySource({ city, source, dateRange, field }) {
    return httpInstance({
      url: '/score/avg-by-city-source',
      params: {
        city,
        source,
        start_date: dateRange?.[0],
        end_date: dateRange?.[1],
        field: field
      }
    })
  },
  getWeatherDaysScoreSourceAvgByCity({ city, dateRange }) {
    return httpInstance({
      url: '/score/source-avg-by-city',
      params: {
        city,
        start_date: dateRange?.[0],
        end_date: dateRange?.[1],
      }
    })
  },
}



