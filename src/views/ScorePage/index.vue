<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="weather-quality-container">
    <el-tabs v-model="activeTab" type="border-card" class="analysis-tabs">
      <el-tab-pane label="多源对比分析" name="compare">
        <ComparePanel v-model:raw-data="rawData" v-model:loading="loading" v-model:unique-dates="uniqueDates"
          v-model:selected-cities="selectedCities" v-model:selected-sources="selectedSources"
          v-model:selected-fields="selectedFields" v-model:date-range="dateRange" v-model:mode="mode"
          v-model:is-playing="isPlaying" v-model:playback-step="playbackStep"
          v-model:max-playback-step="maxPlaybackStep" @line-chart-click="handleLineChartClick" />
      </el-tab-pane>

      <el-tab-pane label="可信度诊断" name="diagnose">
        <DiagnosePanel :raw-data="rawData" v-model:active-scene="activeScene" :selected-trace-date="selectedTraceDate"
          :radar-diagnose-options="radarDiagnoseOptions" :boxplot-options="boxplotOptions"
          :sankey-options="sankeyOptions" :diagnose-loading="diagnoseLoading" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ComparePanel from './components/ComparePanel.vue'
import DiagnosePanel from './components/DiagnosePanel.vue'
import { useWeatherData } from './composables/useWeatherData'
import { usePlayback } from './composables/usePlayback'
import { useDiagnose } from './composables/useDiagnose'

// 筛选条件
const selectedCities = ref([])
const selectedSources = ref(['QWeather'])
const selectedFields = ref([])
const dateRange = ref(null)
const mode = ref('error')

// 数据获取
const { rawData, loading, uniqueDates } = useWeatherData(
  selectedCities, selectedSources, selectedFields, dateRange, mode
)

// 播放器控制（返回响应式变量，不传递函数）
const { isPlaying, playbackStep, maxPlaybackStep } = usePlayback(uniqueDates)

// 诊断页相关
const activeScene = ref('all')
const selectedTraceDate = ref(null)
const diagnoseLoading = ref(false)

const { radarDiagnoseOptions, boxplotOptions, sankeyOptions } = useDiagnose(rawData, activeScene, selectedTraceDate)

const handleLineChartClick = (date) => {
  selectedTraceDate.value = date
  activeTab.value = 'diagnose'
}

const activeTab = ref('compare')
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
