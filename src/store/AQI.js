import { defineStore } from "pinia"
import { ref } from 'vue'
import { cityApi } from '@/apis/cityApi'
import { AQIApi } from '@/apis/AQIApi'
export const useAQIStore = defineStore("AQI", () => {
  const AQIInfo = ref([])
  const getAIQInfo = async (location) => {
    const resCity = await cityApi.searchCity(location);
    const cityLat = +(Number(resCity.data.location[0].lat).toFixed(2));
    const cityLon = +(Number(resCity.data.location[0].lon).toFixed(2));
    const resAQI = await AQIApi.getAQIInfo(cityLat, cityLon)
    AQIInfo.value = resAQI.indexes
  }
  return {
    getAIQInfo,
    AQIInfo
  }
})
