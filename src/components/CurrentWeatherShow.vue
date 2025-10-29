<template>
  <div class="weather-card" @mousedown="startDrag" @mousemove="onDrag" @mouseup="endDrag" @mouseleave="endDrag"
    @touchstart="startDrag" @touchmove="onDrag" @touchend="endDrag">
    <WeatherNowCard :weather="weatherStore?.weatherNowInfo[0]" />
    <WeatherDaysCard v-show="computedValue" v-for="weather in weatherStore.weatherDaysInfo" :weather="weather"
      :key="weather.fxDate" />
    <WeatherHoursCard v-show="!computedValue" v-for="weather in weatherStore.weatherHoursInfo" :weather="weather"
      :key="weather.fxTime" />
  </div>
</template>

<script setup>
import { computed, ref} from 'vue'
import WeatherNowCard from './WeatherNow.vue'
import WeatherDaysCard from './weatherDays/WeatherCardList.vue'
import WeatherHoursCard from './weatherHour/WeatherCardList.vue'
import '@/assets/icon/iconfont.js'
import { useWeatherStore } from '@/store/weather'
const weatherStore = useWeatherStore()




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
const isDragging = ref(false);
const startX = ref(0);
const startScrollLeft = ref(0);

const startDrag = (e) => {
  // 如果是触摸事件，取touches[0]
  const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  isDragging.value = true;
  startX.value = clientX;
  startScrollLeft.value = e.currentTarget.scrollLeft;
  // 阻止默认行为，防止文本选中等
  e.preventDefault();
};

const onDrag = (e) => {
  if (!isDragging.value) return;
  const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  const walk = (clientX - startX.value) * 1.5; // 乘以2可以增加拖动的灵敏度，根据需要调整
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
  /* 允许水平滚动 */
  flex-wrap: nowrap;
  /* transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); */
  /* 不换行 */
  /* 隐藏默认滚动条 */
  scrollbar-width: none;

  -ms-overflow-style: none;
  user-select: none;
  /* 防止文本选中 */
  cursor: grab;
  /* 拖动时显示抓取手势 */

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
