import { defineStore } from 'pinia'
import { ref } from 'vue'
import {getAqi} from '@/composables/weatherCachedManager/aqiEnCached'
export const useAqiStore = defineStore('aqiStore',()=>{
  const aqi = ref([])
  const getAqiData = async ()=>{
    const aqiData = await getAqi()
    aqi.value = aqiData.aqi
    console.log(aqiData.fromCache ? '📦 使用缓存数据' : '🌤️ 使用新数据');
  }
  return {
    aqi,
    getAqiData
  }
})
