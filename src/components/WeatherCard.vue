<template>
  <div style="height: 95%; background-color: gray;display: flex;justify-content: space-between;">
    <div class="big-card">
      <div>{{ weatherStore.weatherInfo.icon }}</div>
      <div class="main">
        <span>{{weatherStore.weatherInfo.temp}}℃</span>
        <span>体感温度{{weatherStore.weatherInfo.feelsLike}}℃</span>
        <span>{{ weatherStore.weatherInfo.text }}</span>
      </div>
      <div class="footer">
        <span>
          <svg class="small-icon" aria-hidden="true">
            <use xlink:href="#icon-wind"></use>
          </svg>{{weatherStore.weatherInfo.windSpeed}}公里/小时
        </span>
        <span>
          <svg class="small-icon" aria-hidden="true">
            <use xlink:href="#icon-humidity"></use>
          </svg>
          {{ weatherStore.weatherInfo.humidity }}
        </span>
      </div>

    </div>
  </div>
</template>

<script setup>
import '@/assets/icon/iconfont.js'
import {useWeatherStore} from '@/store/weather.js'
// import { storeToRefs } from 'pinia'
const weatherStore = useWeatherStore()
</script>

<style scoped>
.big-icon {
  width: 6em;
  height: 6em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.small-icon {
  width: 2em;
  height: 2em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.big-card {
  width: 30%;
  height: 260px;
  background: rgb(236, 236, 236);
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
  border-radius: 15%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center
}

.small-card {
  width: 20%;
  height: 260px;
  background: rgb(236, 236, 236);
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
  border-radius: 15%;


}

.main span {
  display: block;
}
.footer {
  display: flex;

  width: 80%;
}
.footer span {
  display:block
}
.footer span:first-child{
  margin-right: auto;
}
</style>
