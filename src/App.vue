<script setup>
import SearchBar from './components/SearchBar.vue';
</script>

<template>
  <div class="container">
    <el-container>
      <el-header style="background-color: greenyellow;"><SearchBar/></el-header>
      <el-container>
        <el-aside style="background-color: antiquewhite; width: 8vw;">Aside</el-aside>
        <el-main style="background-color: bisque;">Main</el-main>
        <el-aside style="background-color: antiquewhite; width: 30vw;">Aside</el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>

</style>
