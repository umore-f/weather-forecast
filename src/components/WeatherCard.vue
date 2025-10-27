<template>
  <div class="weather-card">
    <div class="big-card">
      <div class="header">
        <i :class="'qi-' + `${weatherStore.weatherInfo.icon}`" style="display: block;"></i>
        <span class="text">{{ weatherStore.weatherInfo.text }}</span>
      </div>
      <div class="main">
        <span>{{ weatherStore.weatherInfo.temp }}℃</span>
        <span>{{ weatherStore.weatherInfo.feelsLike }}℃</span>

      </div>
      <div class="footer">
        <div class="pressure">
          <span class="title">大气压</span>
          <span class="text">{{ weatherStore.weatherInfo.pressure }}mb</span>
        </div>
        <div class="vis">
          <span class="title">能见度</span>
          <span class="text">{{ weatherStore.weatherInfo.vis }}公里</span>
        </div>
        <div class="humidity">
          <span class="title">相对湿度</span>
          <span class="text">{{ weatherStore.weatherInfo.humidity }}%</span>
        </div>
      </div>
    </div>
    <SmallWeatherCard v-for="weather in enhancedWeatherHoursData" :weather="weather" :key="weather.fxTime" />
  </div>
</template>

<script setup>
// import { computed } from 'vue'
import SmallWeatherCard from './SmallWeatherCard.vue'
import '@/assets/icon/iconfont.js'
import { useWeatherStore } from '@/store/weather.js'
// import { formatTime } from '@/utils/formatTime.js'
const weatherStore = useWeatherStore()
// 使用计算属性处理时间字段
import { useWeather } from '@/utils/enhancedHoursData'

const { enhancedWeatherHoursData } = useWeather()
// console.log(enhancedWeatherData.value);
// enhancedWeatherHoursData

</script>

<style scoped>
.weather-card {
  height: 95%;
  display: flex;
  justify-content: space-between;
  overflow-x: auto;
  /* 允许水平滚动 */
  flex-wrap: nowrap;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
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
  background: rgb(63, 49, 49);;
  box-shadow: inset 0 -3em 3em rgba(0, 0, 0, 0.1),
    0 0 0 2px rgb(190, 190, 190),
    0.3em 0.3em 1em rgba(0, 0, 0, 0.3);
  transition: border-radius 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.vis {
  background: white;
  box-shadow: inset 0 -3em 3em rgba(0, 0, 0, 0.1),
    0 0 0 2px rgb(190, 190, 190),
    0.3em 0.3em 1em rgba(0, 0, 0, 0.3);
  transition: border-radius 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  color: rgb(90, 158, 55);
}

.humidity {
  background: white;
  box-shadow: inset 0 -3em 3em rgba(0, 0, 0, 0.1),
    0 0 0 2px rgb(190, 190, 190),
    0.3em 0.3em 1em rgba(0, 0, 0, 0.3);
  transition: border-radius 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
</style>
