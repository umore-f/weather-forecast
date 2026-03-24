import httpInstance from "./http"
export const cityApi = {
  // 实时-获取天气信息
  getCityInfo(location) {
    return httpInstance({
      url: '/city',
      params: {
        location,
      }
    })
  },
}


