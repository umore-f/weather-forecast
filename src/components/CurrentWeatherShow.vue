<template>
  <div class="weather-card">
    <WeatherNowCard :weather="enhancedWeatherNowData[0]"/>
    <WeatherDaysCard v-show="computedValue" v-for="weather in enhancedWeatherDaysData" :weather="weather"
      :key="weather.fxDate" />
    <WeatherHoursCard v-show="!computedValue" v-for="weather in enhancedWeatherHoursData" :weather="weather"
      :key="weather.fxTime" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import WeatherNowCard from './WeatherNow.vue'
import WeatherDaysCard from './weatherDays/WeatherCardList.vue'
import WeatherHoursCard from './weatherHour/WeatherCardList.vue'
import '@/assets/icon/iconfont.js'

// 使用计算属性处理时间字段
import { useWeather } from '@/utils/enhancedData'

const { enhancedWeatherNowData,enhancedWeatherDaysData,enhancedWeatherHoursData } = useWeather()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: true
  }
});
const emit = defineEmits(['update:modelValue']);
const computedValue = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  }
});
</script>

<style scoped>


.weather-card {
  height: 95%;
  display: flex;
  justify-content: space-between;
  overflow-x: auto;
  /* 允许水平滚动 */
  flex-wrap: nowrap;
  /* transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); */
  /* 不换行 */
}


</style>
