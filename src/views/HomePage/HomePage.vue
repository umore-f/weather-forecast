<template>
  <div class="container">
    <el-container>
      <el-header><GlobalHeaderNav/></el-header>
      <el-main>
        <router-view/>
      </el-main>
    </el-container>
  </div>

</template>

<script setup>
import GlobalHeaderNav from './components/GlobalHeaderNav.vue';
</script>

<style scoped></style>
