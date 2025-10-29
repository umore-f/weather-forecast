<template>
  <div class="big-card" :class="weather?.weatherClass">
    <div class="header">
      <i :class="'qi-' + `${weather?.icon}`" style="display: block;"></i>
      <span class="text">{{ weather?.text }}</span>
    </div>
    <div class="main">
      <span>{{ weather?.temp }}℃</span>
      <span>体感温度:{{ weather?.feelsLike }}℃</span>

    </div>
    <div class="footer">
      <div class="pressure">
        <span class="title">风速</span>
        <span class="text">{{ weather?.windSpeed }}公里/时</span>
      </div>
      <div class="vis">
        <span class="title">能见度</span>
        <span class="text">{{ weather?.vis }}公里</span>
      </div>
      <div class="humidity">
        <span class="title">相对湿度</span>
        <span class="text">{{ weather?.humidity }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  weather: {
    type: Object,
    default: () => { }
  }
})

</script>

<style scoped>
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
  /* background: white; */
  /* box-shadow: inset 0 -3em 3em rgba(0, 0, 0, 0.1),
    0 0 0 2px rgb(190, 190, 190),
    0.3em 0.3em 1em rgba(0, 0, 0, 0.3); */
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
  /* background: rgba(255, 255, 255, 0.8); */
  backdrop-filter: blur(5px);
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

</style>
