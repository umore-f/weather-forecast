<template>
  <el-container>
    <el-header>
      <HeaderNav />
    </el-header>
    <el-main>
      <CurrentWeatherShow/>
      <LineChart/>
    </el-main>
  </el-container>
</template>

<script setup>
import HeaderNav from './components/HeaderNav.vue';
import LineChart from './components/LineChart.vue';
import CurrentWeatherShow from './components/CurrentWeatherShow.vue'
</script>

<style scoped></style>
