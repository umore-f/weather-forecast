import httpInstance from "./http"
export const cityApi = {
  getCityInfo(location) {
    return httpInstance({
      url: '/city',
      params: {
        location,
      }
    })
  },
}


