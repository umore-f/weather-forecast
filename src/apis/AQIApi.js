import httpInstance from "@/utils/http.js"
export const AQIApi = {


  getAQIInfo(lat,lon) {
      console.log(lat,lon);
    if (!lat || typeof lon !== 'number') {
      console.log('当前类型为', typeof (lat),typeof(lon));
      console.error('AQIapi参数必须是number!')
      return Promise.reject(new Error('经纬度不能为空'))
    }
    return httpInstance({
      url: '/airquality/v1/current',
      params: {
        latitude: lat,
        longitude: lon
      }
    })
  },
}
