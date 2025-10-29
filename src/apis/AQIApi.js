import httpInstance from "@/utils/http.js"
export const AQIApi = {
  getAIQInfo(lon, lat) {
    if (!lat && !lon || typeof (lon + lat) !== 'number') {
      console.log('当前类型为', typeof (lon, lat));
      console.error('AQIapi参数必须是number!')
      return Promise.reject(new Error('经纬度不能为空'))
    }
    return httpInstance({
      url: '/airquality/v1/current/{latitude}/{longitude}',
      params: {
        latitude: lon,
        longitude: lat
      }
    })
  },
}
