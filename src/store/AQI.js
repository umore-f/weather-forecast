import { defineStore } from "pinia"
import { ref } from 'vue'
import { AQIApi } from '@/apis/AQIApi'
import { useCityStore } from '@/store/city'

export const useAQIStore = defineStore("AQI", () => {
  const AQIInfo = ref([])
  const cityStore = useCityStore()
  const getAIQInfo = async () => {
    const res = await AQIApi.getAQIInfo(+cityStore.lat,+cityStore.lon)
    AQIInfo.value = res.data.list
  }
  return {
    getAIQInfo,
    AQIInfo
  }
})
