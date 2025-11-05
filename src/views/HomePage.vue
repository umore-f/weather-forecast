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
import HeaderNav from '../components/HeaderNav2.vue';
import CurrentWeather from '../components/CurrentWeatherShow2.vue';
import CurrentCharts from '../components/CurrentChartsShow2.vue';
import AirQuality from '../components/AirQuality2.vue';
import AsideNav from '../components/AsideNav2.vue';
import DetailMessage from '../components/DetailMessage2.vue';
</script>

<style scoped></style>
