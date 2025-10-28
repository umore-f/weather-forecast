<template>
  <div @mouseenter="setIsBig(true)" @mouseleave="setIsBig(false)"
    :class="[weather.weatherClass, { 'small-card': !isHover, 'magnify-card': isHover }]"
    style="  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
    <!-- 大图样式 -->
    <template v-if="isHover">
      <div class="header">
        <i :class="'qi-' + `${weather.icon}`" style="display: block;"></i>
        <span class="text">{{ weather.text }}</span>
        <span class="time">{{ weather.fxTime }}</span>
      </div>
      <div class="main">
        <span>{{ weather.temp }}℃</span>

      </div>
      <div class="footer">
        <div class="pressure">
          <span class="title">大气压</span>
          <span class="text">{{ weather.pressure }}mb</span>
        </div>
        <div class="humidity">
          <span class="title">相对湿度</span>
          <span class="text">{{ weather.humidity }}%</span>
        </div>
      </div>
    </template>
    <!-- 小图样式 -->
    <template v-else>
      <div><i :class="'qi-' + `${weather.icon}`"></i></div>
      <div>{{ weather.text }}</div>
      <div>{{ weather.temp }}℃</div>
      <span>{{ weather.fxTime }}</span>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({

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
    radial-gradient(circle at 20% 80%, rgba(255, 216, 155, 0.7) 0%, transparent 25%),
    radial-gradient(circle at 80% 20%, rgba(255, 237, 155, 0.5) 0%, transparent 25%),
    linear-gradient(135deg, #ffd89b 0%, #ffed9b 25%, #ffb347 50%, #ff8c00 75%, #ff7700 100%);
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
}

/* 雨天 - 复杂样式 */
.weather-rainy {
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
}

/* 雪天 - 复杂样式 */
.weather-snowy {
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
}

/* 雾天 - 复杂样式 */
.weather-foggy {
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
}

/* 多云 - 复杂样式 */
.weather-cloudy {
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
}

/* 雾霾 - 复杂样式 */
.weather-haze {
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
}

/* 默认天气 - 复杂样式 */
.weather-default {
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

/* 动画定义 */
@keyframes sunGlow {
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
}
</style>
