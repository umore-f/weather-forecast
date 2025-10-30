<template>
  <div class="container">
    <el-container>
      <el-aside style="background-color: antiquewhite; width: 6vw;"><AsideNav/></el-aside>
      <el-main>
        <el-container>
          <el-header style="justify-content: end; display: flex; align-items: center">
            <HeaderNav/>
          </el-header>
          <el-main style="padding-bottom: 5px;">
            <CurrentWeather/>
            <eCharts/>
          </el-main>
        </el-container>
      </el-main>
      <el-aside style="background-color: antiquewhite; width: 16vw;">
        <AirQuality/>
      </el-aside>
    </el-container>
  </div>

</template>

<script setup>
import HeaderNav from '../components/HeaderNav.vue';
import CurrentWeather from '../components/CurrentWeatherShow.vue';
import eCharts from '@/components/eCharts.vue';
import AirQuality from '@/components/AirQuality.vue';
import AsideNav from '@/components/AsideNav.vue';
</script>

<style lang="scss" scoped></style>
