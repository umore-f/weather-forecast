<template>
  <div @mouseenter="setIsBig(true)" @mouseleave="setIsBig(false)"
    :class="[weather.weatherClass, { 'small-card': !isHover, 'magnify-card': isHover }]"
    style="  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
    <!-- 大图样式 -->
    <template v-if="isHover">
      <div class="header">
        <i :class="'qi-' + `${weather.iconDay}`" style="display: block;"></i>
        <span class="text">{{ weather.textDay }}</span>
        <span class="time">{{ weather.fxDate }}</span>
      </div>
      <div class="main">
        <span>↑{{ weather.tempMax }}℃</span>
        <span>{{ weather.tempMin }}℃↓</span>
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
    </template>
    <!-- 小图样式 -->
    <template v-else>
      <div>{{ weather.fxDate }}</div>
      <div><i :class="'qi-' + `${weather.iconDay}`"></i></div>
      <div>{{ weather.textDay }}</div>
      <div>↑{{ weather.tempMax }}℃</div>
      <div>↓{{ weather.tempMin }}℃</div>
      <span>{{ weather.fxData }}</span>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue';
defineProps({
  // isHover:number,
  weather: {
    type: Object,
    default: () => { }
  }
})
const isHover = ref(false)
function setIsBig(state) {
  isHover.value = state
}

</script>

<style scoped>
.small-card {
  flex: 0 0 14%;
  height: 254px;
  background: white;
  box-shadow: inset 0 -3em 3em rgba(0, 0, 0, 0.1),
    0 0 0 2px rgb(190, 190, 190),
    0.3em 0.3em 1em rgba(0, 0, 0, 0.3);
  transition: border-radius 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border-radius: 15%;
  display: flex;
  flex-direction: column;
  margin: 10px;
  align-items: center;
  justify-content: space-around;
}

.small-card i {
  font-size: 40px;
  margin-right: 10px;
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

.magnify-card {
  height: 254px;
  border-radius: 15%;
  background: white;
  box-shadow: inset 0 -3em 3em rgba(0, 0, 0, 0.1),
    0 0 0 2px rgb(190, 190, 190),
    0.3em 0.3em 1em rgba(0, 0, 0, 0.3);
  transition: border-radius 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  transition-duration: 0.2s;
  /* transition-property: all; */
  flex: 0 0 30%;
  margin: 10px;
}

.header {
  display: flex;
  justify-content: start;
  width: 90%;
}

.header .text {
  font-size: 28px;
}

.header .time {
  margin-left: auto;
  font-size: 24px;
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
.weather-sunny {
  background:
     linear-gradient(300deg, #FFE259 0%, #FFA751 100%);
  color: #5a3e1b;
  position: relative;
  overflow: hidden;
}

.weather-sunny::before {
  content: '';
  position: absolute;
  top: 20%;
  right: 15%;
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: sunPulse 8s infinite alternate;
  z-index: 0;
}

/* 雨天 - 简约风格 */
.weather-rainy {
  background:
    linear-gradient(160deg, #4a6572 0%, #34495e 100%);
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
    linear-gradient(to bottom, transparent 90%, rgba(52, 152, 219, 0.2) 100%);
  animation: rainFall 2s infinite linear;
  z-index: 0;
}

/* 雪天 - 简约风格 */
.weather-snowy {
  background:
    linear-gradient(160deg, #e6e9f0 0%, #d9e1e8 100%);
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
    radial-gradient(circle at 20% 20%, white 1px, transparent 2px),
    radial-gradient(circle at 60% 80%, white 1px, transparent 2px),
    radial-gradient(circle at 80% 40%, white 1px, transparent 2px);
  background-size: 200px 200px;
  animation: snowfall 15s infinite linear;
  z-index: 0;
}

/* 雾天 - 简约风格 */
.weather-foggy {
  background:
    linear-gradient(160deg, #8592b3 0%, #a8c0ff 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.weather-foggy::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    linear-gradient(90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%);
  animation: fogMove 20s infinite linear;
  z-index: 0;
}

/* 多云 - 简约风格 */
.weather-cloudy {
  background:
    linear-gradient(160deg, #bdc3c7 0%, #ecf0f1 100%);
  color: #2c3e50;
  position: relative;
  overflow: hidden;
}

.weather-cloudy::before {
  content: '';
  position: absolute;
  top: 20%;
  left: 10%;
  width: 100px;
  height: 40px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  animation: cloudMove 30s infinite linear;
  z-index: 0;
}

.weather-cloudy::after {
  content: '';
  position: absolute;
  top: 40%;
  right: 15%;
  width: 80px;
  height: 30px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  animation: cloudMove 25s infinite linear reverse;
  z-index: 0;
}

/* 雾霾 - 简约风格 */
.weather-haze {
  background:
    linear-gradient(160deg, #ff9068 0%, #ffb6a3 100%);
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
    linear-gradient(90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.15) 50%,
      transparent 100%);
  animation: hazeMove 25s infinite linear;
  z-index: 0;
}

/* 默认天气 - 简约风格 */
.weather-default {
  background:
    linear-gradient(160deg, #667eea 0%, #764ba2 100%);
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
    radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  z-index: 0;
}

/* 确保伪元素不干扰交互 */
.weather-sunny::before,
.weather-rainy::before,
.weather-snowy::before,
.weather-foggy::before,
.weather-cloudy::before,
.weather-cloudy::after,
.weather-haze::before,
.weather-default::before {
  pointer-events: none;
}

/* 简化动画 */
@keyframes sunPulse {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

@keyframes rainFall {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 50px;
  }
}

@keyframes snowfall {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 200px;
  }
}

@keyframes fogMove {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes cloudMove {
  0% {
    transform: translateX(-100px);
  }
  100% {
    transform: translateX(calc(100vw + 100px));
  }
}

@keyframes hazeMove {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
