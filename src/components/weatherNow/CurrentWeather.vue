<template>
  <div class="weather-card">
    <div class="big-card" :class="enhancedWeatherNowData">
      <div class="background-design" :class="enhancedWeatherNowData">
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
      </div>
      <div class="header">
        <i :class="'qi-' + `${weatherStore.weatherNowInfo.icon}`" style="display: block;"></i>
        <span class="text">{{ weatherStore.weatherNowInfo.text }}</span>
      </div>
      <div class="main">
        <span>{{ weatherStore.weatherNowInfo.temp }}℃</span>
        <span>{{ weatherStore.weatherNowInfo.feelsLike }}℃</span>

      </div>
      <div class="footer">
        <div class="pressure">
          <span class="title">大气压</span>
          <span class="text">{{ weatherStore.weatherNowInfo.pressure }}mb</span>
        </div>
        <div class="vis">
          <span class="title">能见度</span>
          <span class="text">{{ weatherStore.weatherNowInfo.vis }}公里</span>
        </div>
        <div class="humidity">
          <span class="title">相对湿度</span>
          <span class="text">{{ weatherStore.weatherNowInfo.humidity }}%</span>
        </div>
      </div>
    </div>
    <weatherDaysCard v-show="computedValue" v-for="weather in enhancedWeatherDaysData" :weather="weather"
      :key="weather.fxDate" />
    <weatherNowCard v-show="!computedValue" v-for="weather in enhancedWeatherHoursData" :weather="weather"
      :key="weather.fxTime" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

import weatherDaysCard from '../weatherDays/WeatherCardList.vue'
import weatherNowCard from './WeatherCardList.vue'
import '@/assets/icon/iconfont.js'
import { useWeatherStore } from '@/store/weather.js'

const weatherStore = useWeatherStore()
// 使用计算属性处理时间字段
import { useWeather } from '@/utils/enhancedData'

const { enhancedWeatherDaysData, enhancedWeatherNowData, enhancedWeatherHoursData } = useWeather()

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
.background-design {
  position: absolute;
  height: 100%;
  width: 100%;
  /* background-color: #ec7263; */
  overflow: hidden;
  z-index: -1;
  transition: all 0.5s ease;
}

/* 根据天气类型设置不同的背景色 */
.weather-sunny .background-design {
  background-color: #ffd89b;
}

.weather-rainy .background-design {
  background-color: #2c3e50;
}

.weather-cloudy .background-design {
  background-color: #bdc3c7;
}

.weather-snowy .background-design {
  background-color: #e6e9f0;
}

/* 根据天气类型设置不同的圆形颜色 */
.weather-sunny .circle {
  background-color: #ffb347;
}

.weather-rainy .circle {
  background-color: #3498db;
}

.weather-cloudy .circle {
  background-color: #95a5a6;
}

.weather-snowy .circle {
  background-color: #ffffff;
}


.circle {
  /* background-color: #efc745; */
  z-index: -1;
  transition: all 0.5s ease;
}

.circle:nth-child(1) {
  position: absolute;
  top: -60%;
  right: -50%;
  width: 300px;
  height: 300px;
  opacity: 0.4;
  border-radius: 50%;

}

.circle:nth-child(2) {
  position: absolute;
  top: -45%;
  right: -30%;
  width: 210px;
  height: 210px;
  opacity: 0.4;
  border-radius: 50%;

}

.circle:nth-child(3) {
  position: absolute;
  top: -15%;
  right: -8%;
  width: 100px;
  height: 100px;
  opacity: 1;
  border-radius: 50%;

}

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

/* 隐藏进度条 */
/* .weather-card::-webkit-scrollbar {
  display: none;
} */
.icon {
  width: 2em;
  height: 2em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

i {
  font-size: 28px;
  margin-right: 10px;
}

.big-card {
  height: 254px;
  border-radius: 15%;
  background: white;
  box-shadow: inset 0 -3em 3em rgba(0, 0, 0, 0.1),
    0 0 0 2px rgb(190, 190, 190),
    0.3em 0.3em 1em rgba(0, 0, 0, 0.3);
  transition: border-radius 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  transition-duration: 0.3s;
  transition-property: all;
  flex: 0 0 31%;
  margin: 10px;
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.8);
  /* 半透明背景 */
  backdrop-filter: blur(5px);
  /* 毛玻璃效果 */
}

.big-card:hover {
  transform: scale(1.05);
}



.header {
  display: flex;
  justify-content: start;
  width: 90%;
}

.header .text {
  font-size: 28px;
}

.main {
  display: flex;
  width: 90%;
}

.main span {
  display: inline-block;
  justify-self: start;
}

.main span:first-child {
  font-size: 32px;
  margin-right: 10px;
}

.main span:last-child {
  font-size: 16px;
  background-color: white;
  height: 24px;
  line-height: 24px;
  margin-top: 12px;
  border-radius: 15%;
  transition-duration: 0.2s;
  transition-property: all;
}

.main span:last-child:hover {
  transform: scale(1.15);
}

.footer {
  display: flex;
  width: 90%;
  justify-content: space-evenly;
  align-items: center;

}

.footer div {
  width: 30%;
  height: 60px;
  border-radius: 15%;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  transition-duration: 0.2s;
  transition-property: all;
}

.footer div:hover {
  transform: scale(1.15);

}

.footer .title {
  font-size: 12px;
  display: block;

}

.footer .text {
  font-size: 16px;
  display: block;
}

.pressure {
  color: white;
  background: rgb(63, 49, 49);
  ;
  box-shadow: inset 0 -3em 3em rgba(0, 0, 0, 0.1),
    0 0 0 2px rgb(190, 190, 190),
    0.3em 0.3em 1em rgba(0, 0, 0, 0.3);
}


.vis {
  background: white;
  box-shadow: inset 0 -3em 3em rgba(0, 0, 0, 0.1),
    0 0 0 2px rgb(190, 190, 190),
    0.3em 0.3em 1em rgba(0, 0, 0, 0.3);
  color: rgb(90, 158, 55);
}

.humidity {
  background: white;
  box-shadow: inset 0 -3em 3em rgba(0, 0, 0, 0.1),
    0 0 0 2px rgb(190, 190, 190),
    0.3em 0.3em 1em rgba(0, 0, 0, 0.3);
}

/* ---------- Background ---------- */
/* 天气背景样式 */
/* 晴天 - 复杂样式 */
/* .weather-sunny {
  background:
    radial-gradient(circle at 20% 80%, rgba(255, 216, 155, 0.7) 0%, transparent 25%),
    radial-gradient(circle at 80% 20%, rgba(255, 237, 155, 0.5) 0%, transparent 25%),
    linear-gradient(300deg, #ffd89b 0%, #ffed9b 25%, #ffb347 50%, #ff8c00 75%, #ff7700 100%);
  color: #5a3e1b;
  position: relative;
  overflow: hidden;
}

.weather-sunny::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background:
    radial-gradient(circle at center, rgba(255, 255, 255, 0.8) 0%, transparent 50%);
  opacity: 0.3;
  animation: sunGlow 8s infinite linear;
  z-index: 0;
}

.weather-sunny::after {
  content: '';
  position: absolute;
  top: 10%;
  left: 10%;
  width: 80%;
  height: 80%;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 40%),
    radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.3) 0%, transparent 40%);
  border-radius: 50%;
  z-index: 0;
} */

/* 雨天 - 复杂样式 */
/* .weather-rainy {
  background:
    linear-gradient(160deg, #2c3e50 0%, #34495e 30%, #4a6572 70%, #5d6d7e 100%),
    repeating-linear-gradient(45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.1) 10px,
      rgba(255, 255, 255, 0.1) 20px);
  color: white;
  position: relative;
  overflow: hidden;
}

.weather-rainy::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    linear-gradient(to bottom, transparent 30%, rgba(52, 152, 219, 0.3) 100%);
  animation: rainFall 1.5s infinite linear;
  z-index: 0;
}

.weather-rainy::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(52, 152, 219, 0.2) 0%, transparent 20%),
    radial-gradient(circle at 80% 20%, rgba(41, 128, 185, 0.2) 0%, transparent 20%),
    radial-gradient(circle at 40% 40%, rgba(52, 152, 219, 0.15) 0%, transparent 30%);
  z-index: 0;
} */

/* 雪天 - 复杂样式 */
/* .weather-snowy {
  background:
    linear-gradient(160deg, #e6e9f0 0%, #eef1f5 30%, #d9e1e8 70%, #c8d6e5 100%),
    radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.8) 0%, transparent 30%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.8) 0%, transparent 30%);
  color: #2c3e50;
  position: relative;
  overflow: hidden;
}

.weather-snowy::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 20%, white 2px, transparent 3px),
    radial-gradient(circle at 40% 80%, white 1px, transparent 2px),
    radial-gradient(circle at 60% 10%, white 2px, transparent 3px),
    radial-gradient(circle at 80% 60%, white 1px, transparent 2px),
    radial-gradient(circle at 30% 50%, white 1px, transparent 2px),
    radial-gradient(circle at 70% 30%, white 2px, transparent 3px);
  background-size: 100% 100%;
  animation: snowfall 10s infinite linear;
  z-index: 0;
}

.weather-snowy::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    linear-gradient(45deg, transparent 48%, rgba(255, 255, 255, 0.6) 50%, transparent 52%),
    linear-gradient(-45deg, transparent 48%, rgba(255, 255, 255, 0.6) 50%, transparent 52%);
  background-size: 20px 20px;
  opacity: 0.3;
  z-index: 0;
} */

/* 雾天 - 复杂样式 */
/* .weather-foggy {
  background:
    linear-gradient(160deg, #636fa4 0%, #8592b3 25%, #a8c0ff 50%, #8592b3 75%, #636fa4 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.weather-foggy::before,
.weather-foggy::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
  animation: fogMove 15s infinite alternate;
  z-index: 0;
}

.weather-foggy::after {
  animation-delay: -7.5s;
  background:
    radial-gradient(circle at 60% 20%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 20% 60%, rgba(255, 255, 255, 0.3) 0%, transparent 50%);
} */

/* 多云 - 复杂样式 */
/* .weather-cloudy {
  background:
    linear-gradient(160deg, #bdc3c7 0%, #ecf0f1 30%, #bdc3c7 70%, #95a5a6 100%),
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.7) 0%, transparent 30%),
    radial-gradient(circle at 70% 60%, rgba(255, 255, 255, 0.6) 0%, transparent 30%);
  color: #2c3e50;
  position: relative;
  overflow: hidden;
}

.weather-cloudy::before,
.weather-cloudy::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  z-index: 0;
}

.weather-cloudy::before {
  top: 20%;
  left: 10%;
  width: 60px;
  height: 30px;
  animation: cloudMove 20s infinite linear;
  box-shadow:
    20px 10px 0 0 rgba(255, 255, 255, 0.7),
    -20px 15px 0 0 rgba(255, 255, 255, 0.5);
}

.weather-cloudy::after {
  top: 50%;
  right: 10%;
  width: 80px;
  height: 40px;
  animation: cloudMove 25s infinite linear reverse;
  box-shadow:
    25px 10px 0 0 rgba(255, 255, 255, 0.6),
    -15px 15px 0 0 rgba(255, 255, 255, 0.4);
} */

/* 雾霾 - 复杂样式 */
/* .weather-haze {
  background:
    linear-gradient(160deg, #fd746c 0%, #ff9068 25%, #ffa07a 50%, #ffb6a3 75%, #ffccbb 100%),
    radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.2) 0%, transparent 30%);
  color: #5a3e1b;
  position: relative;
  overflow: hidden;
}

.weather-haze::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    repeating-linear-gradient(90deg,
      transparent,
      transparent 5px,
      rgba(255, 255, 255, 0.1) 5px,
      rgba(255, 255, 255, 0.1) 10px);
  animation: hazeMove 20s infinite linear;
  z-index: 0;
}

.weather-haze::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 40%),
    radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.15) 0%, transparent 40%);
  z-index: 0;
} */

/* 默认天气 - 复杂样式 */
/* .weather-default {
  background:
    linear-gradient(160deg, #667eea 0%, #764ba2 25%, #8a64b5 50%, #9b7bd6 75%, #ac92ec 100%),
    radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.3) 0%, transparent 30%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.2) 0%, transparent 30%);
  color: white;
  position: relative;
  overflow: hidden;
}

.weather-default::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    repeating-linear-gradient(45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.05) 10px,
      rgba(255, 255, 255, 0.05) 20px);
  z-index: 0;
} */

/* 在所有天气样式的伪元素中添加 */
.weather-sunny::before,
.weather-sunny::after,
.weather-rainy::before,
.weather-rainy::after,
.weather-snowy::before,
.weather-snowy::after,
.weather-foggy::before,
.weather-foggy::after,
.weather-cloudy::before,
.weather-cloudy::after,
.weather-haze::before,
.weather-haze::after,
.weather-default::before {
  pointer-events: none;
  /* 关键：允许鼠标事件穿透 */
}

/* 动画定义 */
/* @keyframes sunGlow {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes rainFall {
  0% {
    background-position: 0 0;
  }

  100% {
    background-position: 0 100px;
  }
}

@keyframes snowfall {
  0% {
    background-position: 0 0;
  }

  100% {
    background-position: 0 100px;
  }
}

@keyframes fogMove {
  0% {
    opacity: 0.3;
    transform: translateX(0);
  }

  50% {
    opacity: 0.6;
  }

  100% {
    opacity: 0.3;
    transform: translateX(20px);
  }
}

@keyframes cloudMove {
  0% {
    transform: translateX(0);
  }

  50% {
    transform: translateX(10px);
  }

  100% {
    transform: translateX(0);
  }
}

@keyframes hazeMove {
  0% {
    background-position: 0 0;
  }

  100% {
    background-position: 50px 0;
  }
} */
</style>
