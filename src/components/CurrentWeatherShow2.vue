<template>
  <div v-loading="!showLoading" element-loading-text="加载天气数据中...">
    <div class="weather-card" @mousedown="startDrag" @mousemove="onDrag" @mouseup="endDrag" @mouseleave="endDrag"
      @touchstart="startDrag" @touchmove="onDrag" @touchend="endDrag">
      <WeatherNowCard :weather="nowStore.now[0]" />
      <WeatherDaysCard v-show="showValue" v-for="weather in daysStore.days" :weather="weather"
        :key="weather?.fxDate" />
      <WeatherHoursCard v-show="!showValue" v-for="weather in hoursStore.hours" :weather="weather"
        :key="weather?.fxTime" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import WeatherNowCard from './WeatherNow2.vue'
import WeatherDaysCard from './DaysCardList2.vue'
import WeatherHoursCard from './HourCardList2.vue'
import '@/assets/icon/iconfont.js'
// import { fetchCityAndWeather } from '@/utils/weatherHelper'
import emitter from '@/utils/emitter'
import {useWeatherNowStore,useWeatherHoursStore,useWeatherDaysStore} from '@/store/index'
const nowStore = useWeatherNowStore()
const hoursStore = useWeatherHoursStore()
const daysStore = useWeatherDaysStore()

const showLoading = ref(true)
// const loadWeatherData = async (cityName) => {
//   showLoading.value = false;
//   try {
//     const data = await fetchCityAndWeather(cityName);
//     console.log(data);
//     const hasData = computed(() => {
//       return data.days?.length > 0 ||
//         data.hours?.length > 0 ||
//         data.now?.length > 0
//     })
//     showLoading.value = hasData;

//   } catch (error) {
//     console.error('加载数据失败:', error);
//     showLoading.value = true;
//   }
// }
// onMounted(() => loadWeatherData('北京'))
let showValue = ref()

onMounted(() => {
  emitter.on('showOne', (value) => {
    showValue.value = value
  })
  emitter.on('loadingShow', (isLoading) => {
    showLoading.value = !isLoading
  })
})
onUnmounted(()=>{
  emitter.off('loadingShow','showOne')
})
// 滑动效果
const isDragging = ref(false);
const startX = ref(0);
const startScrollLeft = ref(0);
const startDrag = (e) => {
  const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  isDragging.value = true;
  startX.value = clientX;
  startScrollLeft.value = e.currentTarget.scrollLeft;
  e.preventDefault();
};
const onDrag = (e) => {
  if (!isDragging.value) return;
  const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  const walk = (clientX - startX.value) * 1.5;
  e.currentTarget.scrollLeft = startScrollLeft.value - walk;
};
const endDrag = () => {
  isDragging.value = false;
};
</script>

<style scoped>
.weather-card {
  height: 95%;
  display: flex;
  justify-content: space-between;
  overflow-x: auto;
  flex-wrap: nowrap;
  scrollbar-width: none;

  -ms-overflow-style: none;
  user-select: none;
  cursor: grab;

}

::-webkit-scrollbar {
  width: 4px;
  /* 滚动条宽度 */
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  /* 滑块颜色 */
  border-radius: 4px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  /* 轨道颜色 */
}
</style>
