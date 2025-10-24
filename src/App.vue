<script setup>
import HeaderNav from './components/HeaderNav.vue';
</script>

<template>
  <div class="container">
    <el-container>
      <el-aside style="background-color: antiquewhite; width: 8vw;">Aside</el-aside>
      <el-main style="background-color: bisque;">
        <el-container>
          <el-header style="justify-content: end; display: flex;"><HeaderNav/></el-header>
          <el-main>Main</el-main>
        </el-container>
      </el-main>
      <el-aside style="background-color: antiquewhite; width: 20vw;">Aside</el-aside>
    </el-container>
  </div>
</template>

<style scoped></style>
