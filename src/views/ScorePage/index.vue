<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="weather-quality-container">
    <el-tabs v-model="activeTab" type="border-card" class="analysis-tabs"  @tab-click="handleClick">
      <el-tab-pane label="误差对比分析" name="error">
        <ErrorAnalysis />
      </el-tab-pane>
      <el-tab-pane label="可信度诊断" name="score">
        <ScoreAnalysis />
      </el-tab-pane>
      <el-tab-pane label="地图" name="map">
        <MapAnalysis />
      </el-tab-pane>
      <el-tab-pane label="表格" name="table">
        <div>全部数据表格（后续实现）</div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ErrorAnalysis from './components/ErrorAnalysis.vue'
import ScoreAnalysis from './components/ScoreAnalysis.vue'
import MapAnalysis from './components/MapAnalysis.vue';

const activeTab = ref('error')
</script>

<style scoped>
.weather-quality-container {
  background: #f5f7fa;
  border-radius: 16px;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}
.analysis-tabs {
  border-radius: 16px;
  overflow: hidden;
}
</style>
