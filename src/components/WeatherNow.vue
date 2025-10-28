<template>
  <div class="big-card" :class="weather.weatherClass">
    <div class="background-design" :class="weather.weatherClass">
      <div class="circle"></div>
      <div class="circle"></div>
      <div class="circle"></div>
    </div>
    <div class="header">
      <i :class="'qi-' + `${weather.icon}`" style="display: block;"></i>
      <span class="text">{{ weather.text }}</span>
    </div>
    <div class="main">
      <span>{{ weather.temp }}℃</span>
      <span>{{ weather.feelsLike }}℃</span>

    </div>
    <div class="footer">
      <div class="pressure">
        <span class="title">大气压</span>
        <span class="text">{{ weather.pressure }}mb</span>
      </div>
      <div class="vis">
        <span class="title">能见度</span>
        <span class="text">{{ weather.vis }}公里</span>
      </div>
      <div class="humidity">
        <span class="title">相对湿度</span>
        <span class="text">{{ weather.humidity }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  weather:{
    type:Object,
    default: () => { }
  }
})

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
  height: 200px;
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
  line-height: 24px;
}

.header .text {
  font-size: 24px;
}

.main {
  display: flex;
  width: 90%;
}

.main span {
  display: inline-block;
  justify-self: start;
  line-height: 24px;
}

.main span:first-child {
  font-size: 24px;
  margin-right: 10px;
}

.main span:last-child {
  font-size: 12px;
  background-color: white;
  height: 24px;
  line-height: 24px;
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
  width: 25%;
  height: 45px;
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
  font-size: 12px;
  display: block;
}

.pressure {
  color: white;
  background: rgb(63, 49, 49);
  ;
  /* box-shadow: inset 0 -3em 3em rgba(0, 0, 0, 0.1),
    0 0 0 2px rgb(190, 190, 190),
    0.3em 0.3em 1em rgba(0, 0, 0, 0.3); */
}


.vis {
  background: white;
  /* box-shadow: inset 0 -3em 3em rgba(0, 0, 0, 0.1),
    0 0 0 2px rgb(190, 190, 190),
    0.3em 0.3em 1em rgba(0, 0, 0, 0.3); */
  color: rgb(90, 158, 55);
}

.humidity {
  background: white;
  /* box-shadow: inset 0 -3em 3em rgba(0, 0, 0, 0.1),
    0 0 0 2px rgb(190, 190, 190),
    0.3em 0.3em 1em rgba(0, 0, 0, 0.3); */
}
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
</style>
