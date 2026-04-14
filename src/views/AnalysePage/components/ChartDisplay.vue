<template>
  <div class="chart-wrapper">
    <EChartsWrapper
    :key="chartType"
    :not-merge="true"
    v-if="options"
    :options="options"
    height="600px"
    :loading="loading"
    @click="handleChartClick" />
    <div v-else class="no-data">请至少选择一个城市和一个字段</div>
  </div>
</template>

<script setup>
import EChartsWrapper from '@/components/EChartsWrapper.vue'

defineProps({
  options: Object,
  loading: Boolean
})

const emit = defineEmits(['chartClick'])

const handleChartClick = (params) => {
  emit('chartClick', params)
}
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  min-height: 400px;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #eef2f6;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.no-data {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px 24px;
  border-radius: 32px;
  backdrop-filter: blur(4px);
  pointer-events: none;
}
</style>
