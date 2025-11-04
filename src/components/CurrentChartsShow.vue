<template>
  <div v-loading="!showLoading" element-loading-text="加载天气数据中...">
    <keep-alive>
      <DaysChart v-if="showValue" />
      <HoursChart v-else />
    </keep-alive>

  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import DaysChart from './DaysLineChart.vue'
import HoursChart from './HoursLineChart.vue'
import emitter from '@/utils/emitter'
const showLoading = ref(true)
let showValue = ref()

onMounted(() => {
  emitter.on('loadingShow', (isLoading) => {
    showLoading.value = !isLoading
  })
  emitter.on('showOne', (value) => {
    showValue.value = value
  })
})
onUnmounted(() => {
  emitter.off('loadingShow', 'showOne')
})
</script>

<style scoped>

</style>
