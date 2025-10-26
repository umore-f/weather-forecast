<template>
  <div>
    <el-button :icon="User" circle style="width: 40px;height: 40px;; text-align: center;" />
    <span>Hello,</span>
    <span>Jack Grealish</span>
  </div>
  <div class="header" style="margin-right: 20px;">
    <el-input style="width: 240px;" placeholder="Please input" clearable :prefix-icon="Search" class="myInput"
      v-model="cityName" @keyup.enter="searchCityName"/>
  </div>
  <el-button :icon="Bell" circle style="width: 40px;height: 40px;" />
  <!--  -->
</template>
<script setup>
import { Search, Bell, User } from '@element-plus/icons-vue'
import {ref} from 'vue'
import {useWeatherStore} from '@/store/weather.js'
const weatherStore = useWeatherStore()

const cityName = ref('')

function searchCityName() {
  weatherStore.getWeather(cityName.value)
}


</script>

<style scoped>
div:nth-child(1) {
  margin-right: auto;
}

span {
  line-height: 40px;
}
</style>
