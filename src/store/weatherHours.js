import { defineStore } from 'pinia'
import { ref } from 'vue'
import {getHours} from '@/composables/weatherCachedManager/hoursEnCached'
export const useWeatherHoursStore = defineStore('weatherHours',()=>{
  const hours = ref([])
  const getHoursData = async ()=>{
    const hoursData = await getHours()
    hours.value = hoursData.hours
    console.log(hoursData.fromCache ? '📦 使用缓存数据' : '🌤️ 使用新数据');
  }
  return {
    hours,
    getHoursData
  }
})
