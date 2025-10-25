<template>
  <div style="height: 95%; background-color: gray;display: flex; justify-content:space-between;">
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
    <div class="small-card">
      <div><i :class="'qi-' + `${weatherStore.weatherInfo.icon}`"></i></div>
      <div>{{ weatherStore.wearherHoursInfo[0]?.text }}</div>
      <div>{{ weatherStore.wearherHoursInfo[0]?.temp }}℃</div>
    </div>
    <div class="small-card">
      <div><i :class="'qi-' + `${weatherStore.weatherInfo.icon}`"></i></div>
      <div>{{ weatherStore.wearherHoursInfo[1]?.text }}</div>
      <div>{{ weatherStore.wearherHoursInfo[1]?.temp }}℃</div>
    </div>
    <div class="small-card">
      <div><i :class="'qi-' + `${weatherStore.weatherInfo.icon}`"></i></div>
      <div>{{ weatherStore.wearherHoursInfo[2]?.text }}</div>
      <div>{{ weatherStore.wearherHoursInfo[2]?.temp }}℃</div>
    </div>
    <div class="small-card">
      <div><i :class="'qi-' + `${weatherStore.weatherInfo.icon}`"></i></div>
      <div>{{ weatherStore.wearherHoursInfo[3]?.text }}</div>
      <div>{{ weatherStore.wearherHoursInfo[3]?.temp }}℃</div>
    </div>
    <div class="small-card">
      <div><i :class="'qi-' + `${weatherStore.weatherInfo.icon}`"></i></div>
      <div>{{ weatherStore.wearherHoursInfo[4]?.text }}</div>
      <div>{{ weatherStore.wearherHoursInfo[4]?.temp }}℃</div>
    </div>
    <div class="small-card">
      <div><i :class="'qi-' + `${weatherStore.weatherInfo.icon}`"></i></div>
      <div>{{ weatherStore.wearherHoursInfo[5]?.text }}</div>
      <div>{{ weatherStore.wearherHoursInfo[5]?.temp }}℃</div>
    </div>
  </div>
</template>

<script setup>
import '@/assets/icon/iconfont.js'
import { useWeatherStore } from '@/store/weather.js'
// import { storeToRefs } from 'pinia'
const weatherStore = useWeatherStore()


</script>

<style scoped>
.icon {
  width: 2em;
  height: 2em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
  /* background-color: wheat; */
}

i {
  font-size: 28px;
  margin-right: 10px;
  /* background-color: wheat;
  color: white; */

}

.big-card {
  width: 26%;
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
  align-items: center
}

.small-card {
  width: 11%;
  height: 260px;
  background: white;
  box-shadow: inset 0 -3em 3em rgba(0, 0, 0, 0.1),
    0 0 0 2px rgb(190, 190, 190),
    0.3em 0.3em 1em rgba(0, 0, 0, 0.3);
  transition: border-radius 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border-radius: 15%;
  display: flex;
  flex-direction: column;
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
  background-color: rgb(63, 49, 49);
  color: white;
}

.vis {
  background-color: rgb(90, 158, 55);
}

.humidity {
  background-color: white;
}
</style>
