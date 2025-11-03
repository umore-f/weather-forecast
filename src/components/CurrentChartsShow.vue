<template>
  <div v-loading="!showLoading" element-loading-text="加载天气数据中...">
    <echarts />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import echarts from './eCharts.vue'
import emitter from '@/utils/emitter'
const showLoading = ref(true)
onMounted(() => {
  emitter.on('loadingShow', (isLoading) => {
    showLoading.value = !isLoading
  })
})
onUnmounted(()=>{
  emitter.off('loadingShow')
})
</script>

<style lang="scss" scoped></style>
