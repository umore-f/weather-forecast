import { defineStore } from 'pinia'
import { ref } from 'vue'
import {getDays} from '@/composables/weatherCachedManager/daysEnCached'
export const useWeatherDaysStore = defineStore('weatherDays',()=>{
  const days = ref({})
  const getDaysData = async ()=>{
    const daysData = await getDays()
    days.value = daysData.days
    console.log(daysData.fromCache ? '📦 使用缓存数据' : '🌤️ 使用新数据');
  }
  return {
    days,
    getDaysData
  }
})
