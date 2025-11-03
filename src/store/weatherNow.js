import { defineStore } from 'pinia'
import { ref } from 'vue'
import {getNow} from '@/composables/weatherCachedManager/nowEnCached'
export const useWeatherNowStore = defineStore('weatherNow',()=>{
  const now = ref([])
  const getNowData = async ()=>{
    const nowData = await getNow()
    now.value = nowData.now
    console.log(nowData.fromCache ? '📦 使用缓存数据' : '🌤️ 使用新数据');
  }
  return {
    now,
    getNowData
  }
})
