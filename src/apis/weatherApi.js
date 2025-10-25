import httpInstance from "@/utils/http.js"
export const weatherApi = {
  // 获取天气信息
  getWearherInfo(locationId) {
    //  || typeof locationId !== 'number'
    if (!locationId || typeof locationId !== 'number') {
      console.log('当前类型为',typeof(locationId));
      console.error('天气location参数必须是number')
      return Promise.reject(new Error('城市名称不能为空'))
    }
    return httpInstance({
      url: '/v7/weather/now',
      params: {
        location:locationId
      }
    })
  }
}
