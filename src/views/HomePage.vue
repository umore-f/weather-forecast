<template>
  <div class="container">
    <el-container>
      <el-aside style="background-color: antiquewhite; width: 6vw;">Aside</el-aside>
      <el-main style="background-color: bisque;">
        <el-container>
          <el-header style="justify-content: end; display: flex; align-items: center">
            <HeaderNav />
          </el-header>
          <el-main>
            <CurrentWeather />
          </el-main>
        </el-container>
      </el-main>
      <el-aside style="background-color: antiquewhite; width: 16vw;"></el-aside>
    </el-container>
  </div>

</template>

<script setup>
import HeaderNav from '../components/HeaderNav.vue';
import CurrentWeather from '../components/CurrentWeather.vue';
import { onMounted } from 'vue'
import { useWeatherStore } from '@/store/weather.js'
const weatherStore = useWeatherStore()
onMounted(async () => {
  await weatherStore.getWeather('北京')
  console.log('数据加载完成后的 weatherHoursInfo:', weatherStore.weatherHoursInfo)
})
</script>

<style lang="scss" scoped></style>
