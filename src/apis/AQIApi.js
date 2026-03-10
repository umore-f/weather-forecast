import httpInstance from "./http"
export const AQIApi = {
  getAQIInfo(latitude, longitude) {
    console.log(latitude, longitude);
    if (typeof latitude !== 'number' || typeof longitude !== 'number' || isNaN(latitude) || isNaN(longitude)) {
      console.log('当前类型为', typeof (lat), typeof (lon));
      return Promise.reject(new Error('经纬度不能为空'))
    }
    return httpInstance({
      url: `/airquality/v1/current/${latitude}/${longitude}`,
    })
  },
}
