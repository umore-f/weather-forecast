<template>
  <div v-loading="!showLoading" element-loading-text="加载天气数据中...">
    <DaysChart v-show="showValue"/>
    <HoursChart v-show="!showValue"/>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import DaysChart from './daysLineChart.vue'
import HoursChart from './hoursLineChart.vue'
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
onUnmounted(()=>{
  emitter.off('loadingShow','showOne')
})
</script>

<style lang="scss" scoped></style>
