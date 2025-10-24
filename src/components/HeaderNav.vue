<template>
  <div><el-button :icon="User" circle /></div>
  <div class="header" style="margin-right: 20px;">
    <el-input style="width: 240px;" placeholder="Please input" clearable :prefix-icon="Search" class="myInput"
      v-model="cityName"/>
  </div>
  <el-button :icon="Bell" circle />
  <!-- @keyup.enter="searchCityName" -->
</template>
<script setup>
import { Search, Bell, User } from '@element-plus/icons-vue'
// import { cityApi } from '@/apis/cityApi';
// import { weatherApi } from '../apis/weatherApi';

// import { onMounted, ref, } from 'vue'

// const cityName = ref('')

// function searchCityName() {
//   getWeather(cityName.value)

// }
// const weatherInfo = ref({})

// const getWeather = async (location) => {
//   const resCity = await cityApi.searchCity(location)
//   const cityId = +resCity.data.location[0].id
//   const resWeather = await weatherApi.getWearherInfo(cityId)
//   if (resWeather.data.code === '200') {
//     weatherInfo.value = resWeather.data.now || {}
//   }
//   else {
//     throw new Error(resWeather.data.message || '获取天气信息失败')
//   }
// }
// onMounted(() => getWeather('长春'))



</script>

<style scoped>
div:nth-child(1) {
  margin-right: auto;
}
</style>
