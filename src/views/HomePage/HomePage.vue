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
            <LineChart/>
            <!-- <CurrentCharts/> -->
          </el-main>
        </el-container>
      </el-main>
    </el-container>
  </div>

</template>

<script setup>
import HeaderNav from './components/HeaderNav.vue';
import LineChart from './components/LineChart.vue';
import CurrentWeatherShow from './components/CurrentWeatherShow.vue'
import AsideNav from './components/AsideNav.vue';
</script>

<style scoped></style>
