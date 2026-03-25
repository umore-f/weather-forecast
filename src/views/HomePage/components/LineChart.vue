<template>
  <div class="dashboard">
    <!-- 标题区域，显示当前日期 -->
    <div class="dashboard-header" v-if="date">
      <h2>{{ titleText }}</h2>
    </div>

    <!-- 图表网格容器 -->
    <div class="chart-grid">
      <!-- 温度组（面积图） -->
      <div class="chart-card">
        <EChartsWrapper
          :options="temperatureOptions"
          height="300px"
          :loading="loading"
        />
      </div>

      <!-- 湿度与露点组（柱状图+折线，双Y轴） -->
      <div class="chart-card">
        <EChartsWrapper
          :options="humidityOptions"
          height="300px"
          :loading="loading"
        />
      </div>

      <!-- 风组（折线 + 散点标记） -->
      <div class="chart-card">
        <EChartsWrapper
          :options="windOptions"
          height="300px"
          :loading="loading"
        />
        <EChartsWrapper
          :options="windRoseOptions"
          height="300px"
          :loading="loading"
        />
      </div>

      <!-- 降水组（柱状图+折线） -->
      <div class="chart-card">
        <EChartsWrapper
          :options="precipOptions"
          height="300px"
          :loading="loading"
        />
      </div>

      <!-- 紫外线指数（渐变面积图） -->
      <div class="chart-card">
        <EChartsWrapper
          :options="uvOptions"
          height="250px"
          :loading="loading"
        />
      </div>

      <!-- 风向玫瑰图（替代原风向卡片） -->
      <!-- <div class="chart-card">

      </div> -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, computed, watch } from 'vue'
import { weatherApi } from '../../../apis/weatherApi'
import { emitter } from '../../../utils/eventBus'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

// 工具函数：UTC 转东八区时间（仅时间）
function convertToLocalTime(utcTimeStr) {
  return dayjs(utcTimeStr).tz('Asia/Shanghai').format('HH:mm')
}

// 工具函数：UTC 转东八区日期（仅日期）
function convertToLocalDate(utcTimeStr) {
  return dayjs(utcTimeStr).tz('Asia/Shanghai').format('YYYY/MM/DD')
}

// 数据存储
const hoursList = ref([])      // 和风天气数据
const hoursList1 = ref([])     // tomorrow.io 数据
const date = ref('')           // 当前日期
const loading = ref(false)
const error = ref(null)
const selectedCity = ref('广州')

// 计算标题文本（带日期）
const titleText = computed(() => `小时气象趋势 日期：${date.value}`)

// 风向文字映射（用于玫瑰图的半径轴标签，不再需要单独卡片）
// 统计风向频率（响应式，供玫瑰图使用）
const windRoseData = computed(() => {
  if (!hoursList.value.length) return []
  const counts = Array(8).fill(0)
  hoursList.value.forEach(item => {
    const angle = item.wind_direction
    if (angle !== undefined) {
      const idx = Math.round(angle / 45) % 8
      counts[idx]++
    }
  })
  return counts
})

// 风向玫瑰图配置（响应式更新）
const windRoseOptions = reactive({
  title: { text: '风向玫瑰图', left: 'left' },
  tooltip: { trigger: 'item' },
  angleAxis: { startAngle: 0 },
  radiusAxis: { 
    type: 'category', 
    data: ['北', '东北', '东', '东南', '南', '西南', '西', '西北'],
    axisLabel: { rotate: 0 }
  },
  polar: {},
  series: [{
    type: 'bar',
    data: [],  // 初始为空
    coordinateSystem: 'polar',
    name: '风向频率',
    roundCap: true,
    barWidth: 30,
    itemStyle: { color: '#5470c6', borderRadius: [4,4,0,0] },
    label: { show: true, position: 'top', formatter: '{c}' }
  }]
})

// 监听 windRoseData 变化，更新玫瑰图数据
watch(windRoseData, (newData) => {
  if (windRoseOptions.series[0]) {
    windRoseOptions.series[0].data = newData
  }
}, { immediate: true })

// ==================== 图表配置 ====================

// 温度组（双面积折线图）
const temperatureOptions = reactive({
  title: { text: '温度趋势', left: 'left' },
  tooltip: { trigger: 'axis' },
  legend: { data: ['和风天气温度', 'tomorrow.io 温度'], top: 30, left: 'left' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'category', boundaryGap: false, data: [] },
  yAxis: { name: '摄氏度 (°C)' },
  series: [
    {
      name: '温度',
      type: 'line',
      data: [],
      smooth: true,
      lineStyle: { width: 2, color: '#5470c6' },
      areaStyle: { opacity: 0.2, color: '#5470c6' },
      symbol: 'circle',
      symbolSize: 6
    },
    {
      name: '体感温度',
      type: 'line',
      data: [],
      smooth: true,
      lineStyle: { width: 2, color: '#fac858' },
      areaStyle: { opacity: 0.2, color: '#fac858' },
      symbol: 'diamond',
      symbolSize: 6
    }
  ]
})

// 湿度与露点组（柱状图 + 折线，双Y轴）
const humidityOptions = reactive({
  title: { text: '湿度与露点温度', left: 'left' },
  tooltip: { trigger: 'axis' },
  legend: { data: ['相对湿度 (%)', '露点温度 (°C)'], top: 30, left: 'left' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'category', boundaryGap: false, data: [] },
  yAxis: [
    { name: '相对湿度 (%)', type: 'value', min: 0, max: 100 },
    { name: '露点温度 (°C)', type: 'value' }
  ],
  series: [
    {
      name: '相对湿度',
      type: 'bar',
      data: [],
      yAxisIndex: 0,
      itemStyle: { color: '#91cc75', borderRadius: [4, 4, 0, 0] },
      barWidth: '60%'
    },
    {
      name: '露点温度',
      type: 'line',
      data: [],
      yAxisIndex: 1,
      smooth: true,
      lineStyle: { width: 2, color: '#ee6666' },
      symbol: 'circle',
      symbolSize: 6
    }
  ]
})

// 风组（折线 + 散点标记最大风速）
const windOptions = reactive({
  title: { text: '风速趋势', left: 'left' },
  tooltip: { trigger: 'axis' },
  legend: { data: ['风速 (m/s)', '风强 (m/s)'], top: 30, left: 'left' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'category', boundaryGap: false, data: [] },
  yAxis: { name: '米/秒 (m/s)' },
  series: [
    {
      name: '风速',
      type: 'line',
      data: [],
      smooth: true,
      lineStyle: { width: 2, color: '#73c0de' },
      symbol: 'circle',
      symbolSize: 6
    },
    {
      name: '风强',
      type: 'line',
      data: [],
      smooth: true,
      lineStyle: { width: 1, type: 'dashed', color: '#3ba272' },
      symbol: 'diamond',
      symbolSize: 8,
      markPoint: {
        data: [{ type: 'max', name: '最大风速' }],
        symbol: 'pin',
        symbolSize: 50
      }
    }
  ]
})

// 降水组（柱状图 + 折线）
const precipOptions = reactive({
  title: { text: '降水趋势', left: 'left' },
  tooltip: { trigger: 'axis' },
  legend: { data: ['降雨量 (mm)', '降雨率 (mm/h)'], top: 30, left: 'left' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'category', boundaryGap: false, data: [] },
  yAxis: { name: '毫米 (mm)' },
  series: [
    {
      name: '降雨量',
      type: 'bar',
      data: [],
      itemStyle: { color: '#5470c6', borderRadius: [4, 4, 0, 0] },
      barWidth: '60%'
    },
    {
      name: '降雨率',
      type: 'line',
      data: [],
      smooth: true,
      lineStyle: { width: 2, color: '#fac858' },
      symbol: 'circle',
      symbolSize: 6
    }
  ]
})

// 紫外线指数组（渐变面积图）
const uvOptions = reactive({
  title: { text: '紫外线指数', left: 'left' },
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', boundaryGap: false, data: [] },
  yAxis: { name: '等级 (0-15)' },
  series: [
    {
      name: '紫外线指数',
      type: 'line',
      data: [],
      smooth: true,
      lineStyle: { width: 2, color: '#ee6666' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(238,102,102,0.5)' },
            { offset: 1, color: 'rgba(238,102,102,0.1)' }
          ]
        }
      },
      symbol: 'circle',
      symbolSize: 6
    }
  ]
})

// ==================== 数据更新函数 ====================
function updateAllCharts(dataQ, dataT) {
  if (!dataQ || !dataT || dataQ.length === 0 || dataT.length === 0) return

  // 使用和风天气的时间作为 x 轴（假设两个数据源时间对齐）
  const times = dataQ.map(item => convertToLocalTime(item.forecast_time))
  
  // 温度组
  temperatureOptions.xAxis.data = times
  temperatureOptions.series[0].data = dataQ.map(item => item.temperature)
  temperatureOptions.series[1].data = dataQ.map(item => item.feelslike)

  // 湿度与露点组（使用和风天气数据）
  humidityOptions.xAxis.data = times
  humidityOptions.series[0].data = dataQ.map(item => item.humidity)
  humidityOptions.series[1].data = dataQ.map(item => item.dew)

  // 风组（使用和风天气数据）
  windOptions.xAxis.data = times
  windOptions.series[0].data = dataQ.map(item => item.wind_speed)
  windOptions.series[1].data = dataQ.map(item => item.wind_gust)

  // 降水组（使用和风天气数据，字段名根据实际API调整）
  // 注意：这里假设和风天气数据有 precipitation_amount 和 precipitation_rate
  // 如果字段名不同，请修改下面两行
  precipOptions.series[0].data = dataQ.map(item => item.precipitation || 0)
  precipOptions.series[1].data = dataQ.map(item => item.precipitation_probability || 0)
  precipOptions.xAxis.data = times

  // 紫外线指数（使用和风天气数据）
  uvOptions.xAxis.data = times
  uvOptions.series[0].data = dataQ.map(item => item.uv_index || 0)
}

// ==================== 数据获取 ====================
const fetchData = async (city) => {
  const cityToUse = city || selectedCity.value
  loading.value = true
  error.value = null
  try {
    const [resQ, resT] = await Promise.all([
      weatherApi.getWeatherNowInfo(cityToUse, undefined, 'QWeather'),
      weatherApi.getWeatherNowInfo(cityToUse, undefined, 'tomorrow.io')
    ])
    const resultQ = resQ.data
    const resultT = resT.data

    if (resultQ.code === 200 || resultT.code === 200) {
      hoursList.value = resultQ.data || []
      hoursList1.value = resultT.data || []
      if (hoursList.value.length) {
        date.value = convertToLocalDate(hoursList.value[0].forecast_time)
      }
      updateAllCharts(hoursList.value, hoursList1.value)
      selectedCity.value = cityToUse
    } else {
      error.value = resultQ.message || resultT.message
      console.error('API 错误：', error.value)
    }
  } catch (err) {
    error.value = err.message || '网络请求失败'
    console.error('请求失败：', err)
  } finally {
    loading.value = false
  }
}

// 城市切换事件处理
const handleCityChange = (cityName) => {
  if (cityName) {
    fetchData(cityName)
  }
}

// 监听数据变化（当外部修改时也更新）
watch([hoursList, hoursList1], () => {
  if (hoursList.value.length && hoursList1.value.length) {
    updateAllCharts(hoursList.value, hoursList1.value)
  }
})

// 生命周期
onMounted(() => {
  emitter.on('cityName', handleCityChange)
  fetchData()
})

onUnmounted(() => {
  emitter.off('cityName', handleCityChange)
})
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 16px auto;
  padding: 20px;
  background: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

.dashboard-header {
  text-align: left;
  margin-bottom: 16px;
}

.dashboard-header h2 {
  font-size: 1.4rem;
  font-weight: 500;
  color: #1f2f3d;
  margin: 0;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 24px;
}

.chart-card {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid #e9ecef;
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

@media (max-width: 768px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }
  .chart-card {
    padding: 12px;
  }
}
</style>