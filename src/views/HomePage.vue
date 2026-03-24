<template>
  <div class="container">
    <el-container>
      <el-aside style="width: 6vw;display: flex;justify-self: center;align-items: start;"><AsideNav/></el-aside>
      <el-main>
        <el-container>
          <el-header>
            <HeaderNav/>
          </el-header>
          <el-main>
            <CurrentWeatherShow/>
            <DaysLineChart/>
            <!-- <CurrentCharts/> -->
          </el-main>
        </el-container>
      </el-main>
    </el-container>
  </div>

</template>

<script setup>
import HeaderNav from '../components/HeaderNav.vue';
import DaysLineChart from '@/components/DaysLineChart.vue';
// import HourCardList from '../components/HourCardList.vue';
// import CurrentCharts from '../components/CurrentChartsShow.vue';
import CurrentWeatherShow from '../components/CurrentWeatherShow.vue'
// import AirQuality from '../components/AirQuality.vue';
import AsideNav from '../components/AsideNav.vue';
// import DetailMessage from '../components/DetailMessage.vue';
</script>

<style scoped></style>
