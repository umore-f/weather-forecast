<template>
  <div class="box">
    <div class="title">
      <div>日升:&nbsp;&nbsp;{{ weatherDaysStore.days[0]?.sunrise }}</div>
      <div>月升:&nbsp;&nbsp;{{ weatherDaysStore.days[0]?.moonrise }}</div>
      <!-- <div>{{ weatherDaysStore.days[0]?.moonPhase }}</div> -->
    </div>
    <div class="main">
      <div><i :class="'qi-' + `${+weatherDaysStore.days[0]?.iconDay || '0'}`"></i></div>
      <div>{{ weatherDaysStore.days[0]?.moonPhase }}</div>
      <div><i :class="'qi-' + `${+weatherDaysStore.days[0]?.moonPhaseIcon || '0'}`"></i></div>
    </div>
    <div class="footer">
      <div>日落:&nbsp;&nbsp;{{ weatherDaysStore.days[0]?.sunset }}</div>
      <div>月落:&nbsp;&nbsp;{{ weatherDaysStore.days[0]?.moonset }}</div>
    </div>
  </div>
</template>

<script setup>
import { useWeatherDaysStore } from '@/store/index'
const weatherDaysStore = useWeatherDaysStore()

</script>

<style scoped>
i {
  font-size: 60px;
}

.box {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 240px;
  justify-content: space-around;
  border-radius: 15px;
  border: 2px solid #c3c6ce;
  align-items: center;
  margin-bottom: 25px;
}

.title {
  display: flex;
  justify-content: space-between;
  /* margin-top: 10px; */
  width: 90%;
}

.main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
}

.footer {
  display: flex;
  justify-content: space-between;
  width: 90%;
}
</style>
