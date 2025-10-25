<script setup>
import HeaderNav from './components/HeaderNav.vue';
import WeatherCard from './components/WeatherCard.vue';
</script>

<template>
  <div class="container">
    <el-container>
      <el-aside style="background-color: antiquewhite; width: 6vw;">Aside</el-aside>
      <el-main style="background-color: bisque;">
        <el-container>
          <el-header style="justify-content: end; display: flex; align-items: center"><HeaderNav/></el-header>
          <el-main><WeatherCard/></el-main>
        </el-container>
      </el-main>
      <el-aside style="background-color: antiquewhite; width: 16vw;">Aside</el-aside>
    </el-container>
  </div>
</template>

<style scoped></style>
