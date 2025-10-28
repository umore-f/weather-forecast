<template>
  <div class="container">
    <el-container>
      <el-aside style="background-color: antiquewhite; width: 6vw;">Aside</el-aside>
      <el-main style="background-color: bisque;">
        <el-container>
          <el-header style="justify-content: end; display: flex; align-items: center">
            <HeaderNav v-model="model"/>
          </el-header>
          <el-main style="padding-bottom: 5px;">
            <CurrentWeather v-model="model"/>
            <eCharts/>
          </el-main>
        </el-container>
      </el-main>
      <el-aside style="background-color: antiquewhite; width: 16vw;"></el-aside>
    </el-container>
  </div>

</template>

<script setup>
import HeaderNav from '../components/HeaderNav.vue';
import CurrentWeather from '../components/CurrentWeatherShow.vue';
import eCharts from '@/components/eCharts.vue';
import { onMounted, ref } from 'vue'
import { useWeatherStore } from '@/store/weather.js'
const weatherStore = useWeatherStore()
// weatherStore.clearCache()
onMounted(async () => {
  await weatherStore.getWeather('北京')
})
const model = ref(false)
</script>

<style lang="scss" scoped></style>
