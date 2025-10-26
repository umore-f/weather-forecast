<template>
  <div @mouseenter="setIsBig(true)" @mouseleave="setIsBig(false)"
    :class="{ 'small-card': !isHover, 'magnify-card': isHover }"
    style="  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
    <!-- 大图样式 -->
    <template v-if="isHover">
      <div class="header">
        <i :class="'qi-' + `${hours.icon}`" style="display: block;"></i>
        <span class="text">{{ hours.text }}</span>
        <span class="time">{{ hours.fxTime }}</span>
      </div>
      <div class="main">
        <span>{{ hours.temp }}℃</span>
        <!-- <span>{{ hours.feelsLike }}℃</span> -->
      </div>
      <div class="footer">
        <div class="pressure">
          <span class="title">大气压</span>
          <span class="text">{{ hours.pressure }}mb</span>
        </div>
        <div class="humidity">
          <span class="title">相对湿度</span>
          <span class="text">{{ hours.humidity }}%</span>
        </div>
      </div>
    </template>
    <!-- 小图样式 -->
    <template v-else>
      <div><i :class="'qi-' + `${hours.icon}`"></i></div>
      <div>{{ hours.text }}</div>
      <div>{{ hours.temp }}℃</div>
      <span>{{ hours.fxTime }}</span>
    </template>

    <!-- <div>{{ weatherStore.timeNow }}</div> -->
  </div>
</template>

<script setup>
import { ref } from 'vue';

// import {ref} from 'vue'
defineProps({
  // isHover:number,
  hours: {
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
  /* width: 11%; */
  flex: 0 0 15%;
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
  /* background-color: wheat; */
}

i {
  font-size: 28px;
  margin-right: 10px;
  /* background-color: wheat;
  color: white; */

}

.magnify-card {
  /* height: 95%; */
  /* width: 26%; */
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
  /* transition-duration: 0.2s; */
  /* transition-property: all; */
  flex: 0 0 30%;
  margin: 10px;
}

/* .big-card:hover {
  transform: scale(1.05);
} */
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
  transition: border-radius 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.humidity {
  background: white;
  box-shadow: inset 0 -3em 3em rgba(0, 0, 0, 0.1),
    0 0 0 2px rgb(190, 190, 190),
    0.3em 0.3em 1em rgba(0, 0, 0, 0.3);
  transition: border-radius 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
</style>
