<template>
  <div class="container">
    <el-container>
      <el-aside style="width: 6vw;display: flex;justify-self: center;align-items: start;"><AsideNav/></el-aside>
      <el-main>
        <router-view/>
      </el-main>
    </el-container>
  </div>

</template>

<script setup>
import AsideNav from './components/AsideNav.vue';
</script>

<style scoped></style>
