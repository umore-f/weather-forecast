<template>
  <div class="container">
    <el-container>
      <el-aside style="width: 6vw;display: flex;justify-self: center;align-items: start;"><AsideNav/></el-aside>
      <el-main>
        <el-container>
          <el-header style="justify-content: end; display: flex; align-items: center">
            <HeaderNav/>
          </el-header>
          <el-main style="padding-bottom: 5px;">
            <CurrentWeather/>
            <CurrentCharts/>
          </el-main>
        </el-container>
      </el-main>
      <el-aside style="width: 16vw; display: flex;flex-direction:column;justify-content: space-between;align-items: center;">
        <AirQuality/>
        <DetailMessage/>
      </el-aside>
    </el-container>
  </div>

</template>

<script setup>
import HeaderNav from '../components/HeaderNav.vue';
import CurrentWeather from '../components/CurrentWeatherShow.vue';
import CurrentCharts from '../components/CurrentChartsShow.vue';
import AirQuality from '../components/AirQuality.vue';
import AsideNav from '../components/AsideNav.vue';
import DetailMessage from '@/components/DetailMessage.vue';
</script>

<style lang="scss" scoped></style>
