<template>
  <div class="weather-chart-container">
    <ControlsPanel
      v-model:selectedCities="selectedCities"
      v-model:selectedFields="selectedFields"
      v-model:selectedSource="selectedSource"
      v-model:dateRange="dateRange"
      v-model:chartType="chartType"
      v-model:barDate="selectedBarDate"
      v-model:scatterX="selectedScatterX"
      v-model:scatterY="selectedScatterY"
    />
    <ChartDisplay :options="chartOptions" :loading="loading" @chartClick="handleChartClick" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ControlsPanel from './components/ControlsPanel.vue'
import ChartDisplay from './components/ChartDisplay.vue'
import { useWeatherData } from '../../composables/useWeatherData'
import { useChartOptions } from '../../composables/useChartOptions'

// 状态定义
const selectedCities = ref([])
const selectedFields = ref([])
const selectedSource = ref(['QWeather'])
const dateRange = ref(null)
const chartType = ref('line')
const selectedBarDate = ref(null)
const selectedScatterX = ref('temp')
const selectedScatterY = ref('humidity')
const selectedHeatmapCity = ref('')
const selectedHeatmapField = ref('temp')
const selectedHeatmapSource = ref('QWeather')

// 数据请求
const { daysList, loading } = useWeatherData(selectedCities, selectedFields, selectedSource, dateRange)

// 图表配置
const extraConfig = {
  barDate: selectedBarDate,
  scatterX: selectedScatterX,
  scatterY: selectedScatterY,
  heatmapCity: selectedHeatmapCity,
  heatmapField: selectedHeatmapField,
  heatmapSource: selectedHeatmapSource
}
const { chartOptions } = useChartOptions(
  chartType,
  selectedCities,
  selectedFields,
  selectedSource,
  daysList,
  extraConfig
)

const handleChartClick = (params) => {
  console.log('图表点击：', params)
}
</script>

<style scoped>
.weather-chart-container {
  background: #f5f7fa;
  border-radius: 16px;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}
/* 其他容器样式可根据需要保留 */
</style>
