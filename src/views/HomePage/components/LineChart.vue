<template>
  <div class="dashboard">
    <!-- 标题区域 -->
    <div class="dashboard-header" v-if="date">
      <h2>{{ titleText }}</h2>
    </div>

    <!-- 趋势图模式（原图表网格） -->
    <div v-if="isTimeView" class="chart-grid">
      <div class="chart-card">
        <EChartsWrapper :options="humidityOptions" height="300px" :loading="loading" />
      </div>
      <div class="chart-card">
        <EChartsWrapper :options="windOptions" height="300px" :loading="loading" />
      </div>
      <div class="chart-card">
        <EChartsWrapper :options="temperatureOptions" height="300px" :loading="loading" />
      </div>
      <div class="chart-card">
        <EChartsWrapper :options="precipOptions" height="300px" :loading="loading" />
      </div>
      <div class="chart-card">
        <EChartsWrapper :options="uvGaugeOptions" height="300px" :loading="loading" />
      </div>
      <div class="chart-card">
        <EChartsWrapper :options="windPieOptions" height="300px" :loading="loading" />
      </div>
    </div>

    <!-- 卡片模式（最近一小时数据） -->
    <div v-else>
      <!-- 数值卡片网格 -->
      <div class="cards-grid">
        <div class="info-card">
          <div class="card-icon">🌡️</div>
          <div class="card-title">温度</div>
          <div class="card-value">{{ latestData?.temperature ?? '--' }} °C</div>
        </div>
        <div class="info-card">
          <div class="card-icon">🤒</div>
          <div class="card-title">体感温度</div>
          <div class="card-value">{{ latestData?.feelslike ?? '--' }} °C</div>
        </div>
        <div class="info-card">
          <div class="card-icon">💧</div>
          <div class="card-title">湿度</div>
          <div class="card-value">{{ latestData?.humidity ?? '--' }} %</div>
        </div>
        <div class="info-card">
          <div class="card-icon">💨</div>
          <div class="card-title">风速</div>
          <div class="card-value">{{ latestData?.wind_speed ?? '--' }} m/s</div>
        </div>
        <div class="info-card">
          <div class="card-icon">🌧️</div>
          <div class="card-title">降雨量</div>
          <div class="card-value">{{ latestData?.precipitation ?? '--' }} mm</div>
        </div>
        <div class="info-card">
          <div class="card-icon">☔</div>
          <div class="card-title">降雨概率</div>
          <div class="card-value">{{ latestData?.precipitation_probability ?? '--' }} %</div>
        </div>
        <div class="info-card">
          <div class="card-icon">⏲️</div>
          <div class="card-title">大气压</div>
          <div class="card-value">{{ latestData?.pressure ?? '--' }} hPa</div>
        </div>
      </div>

      <!-- 仪表盘网格 -->
      <div class="chart-grid">
        <div class="chart-card">
          <EChartsWrapper :options="tempGaugeOptions" height="280px" :loading="loading" />
        </div>
        <div class="chart-card">
          <EChartsWrapper :options="humidityGaugeOptions" height="280px" :loading="loading" />
        </div>
        <div class="chart-card">
          <EChartsWrapper :options="windGaugeOptions" height="280px" :loading="loading" />
        </div>
        <div class="chart-card">
          <EChartsWrapper :options="uvGaugeOptions" height="280px" :loading="loading" />
        </div>
        <div class="chart-card">
          <EChartsWrapper :options="windPieOptions" height="280px" :loading="loading" />
        </div>
      </div>
    </div>

    <!-- 手动刷新按钮（可选） -->
    <div class="refresh-btn-wrapper" v-if="!isTimeView">
      <button class="refresh-btn" @click="refreshData" :disabled="loading">
        {{ loading ? '刷新中...' : '手动刷新' }}
      </button>
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

// 工具函数
function convertToLocalTime(utcTimeStr) {
  return dayjs(utcTimeStr).tz('Asia/Shanghai').format('HH:mm')
}

// 数据存储
const hfHoursList = ref([])
const tiHoursList = ref([])
const hoursList = ref([])
const date = ref('')
const loading = ref(false)
const error = ref(null)
const selectedCity = ref('广州')
const isTimeView = ref(false) // false: 卡片模式, true: 趋势图模式

// 最新一条数据（用于卡片模式）
const latestData = computed(() => {
  if (!hoursList.value.length) return null
  return hoursList.value[hoursList.value.length - 1]
})

// 标题文本
const titleText = computed(() => `小时气象 日期：${date.value}`)

// 风向饼图数据（基于24小时数据）
const windPieData = computed(() => {
  const data = hoursList.value
  if (!data.length) return []
  const directionNames = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']
  const counts = Array(8).fill(0)
  data.forEach(item => {
    const angle = item.wind_direction
    if (angle !== undefined && angle !== null) {
      const idx = Math.round(angle / 45) % 8
      counts[idx]++
    }
  })
  return directionNames.map((name, idx) => ({ name, value: counts[idx] }))
})

// 紫外线仪表盘数值（取最新一条）
const currentUvIndex = computed(() => {
  const data = hoursList.value
  if (!data.length) return 0
  const latest = data[data.length - 1]
  return latest.uv_index !== undefined && latest.uv_index !== null ? latest.uv_index : 0
})

// ==================== 趋势图图表配置 ====================
// 温度组（双面积折线图）
const temperatureOptions = reactive({
  title: { text: '温度趋势', left: 'left', top: 0 },
  tooltip: { trigger: 'axis' },
  legend: { data: ['温度', '体感温度'], top: 20, left: 'left' },
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

// 湿度与露点组（柱状图+折线，双Y轴）
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

// 风组（折线+散点标记最大风速）
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

// 降水组（柱状图+折线）
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

// 紫外线仪表盘图配置（趋势图和卡片模式共用）
const uvGaugeOptions = reactive({
  title: { text: '紫外线指数', left: 'left' },
  series: [
    {
      type: 'gauge',
      center: ['50%', '55%'],
      radius: '70%',
      min: 0,
      max: 15,
      splitNumber: 5,
      progress: { show: true, width: 18, itemStyle: { color: '#ee6666' } },
      axisLine: {
        lineStyle: {
          width: 18,
          color: [
            [0.3, '#67e0e3'],
            [0.7, '#fac858'],
            [1, '#ee6666']
          ]
        }
      },
      axisTick: { show: true, length: 8, lineStyle: { color: '#eee' } },
      splitLine: { show: true, length: 12, lineStyle: { color: '#eee' } },
      axisLabel: { show: true, fontSize: 10 },
      pointer: { show: true, length: '70%', width: 8, itemStyle: { color: 'auto' } },
      detail: { offsetCenter: [0, 25], valueAnimation: true, fontSize: 14, formatter: '{value}' },
      title: { show: true, offsetCenter: [0, -20], fontSize: 12 },
      data: [{ value: 0, name: 'UV Index' }]
    }
  ]
})

// 风向频率饼图配置（共用）
const windPieOptions = reactive({
  title: { text: '风向频率', left: 'left' },
  tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
  legend: { orient: 'vertical', left: 'left', top: 'middle' },
  series: [
    {
      name: '风向频率',
      type: 'pie',
      radius: '55%',
      center: ['50%', '55%'],
      data: [],
      label: { show: true, formatter: '{b}: {d}%' },
      emphasis: { scale: true }
    }
  ]
})

// ==================== 卡片模式仪表盘配置 ====================
// 温度仪表盘
const tempGaugeOptions = reactive({
  title: { text: '温度', left: 'center', top: 5 },
  series: [{
    type: 'gauge',
    center: ['50%', '55%'],
    radius: '70%',
    min: -20,
    max: 40,
    splitNumber: 6,
    progress: { show: true, width: 18, itemStyle: { color: '#ee6666' } },
    axisLine: {
      lineStyle: {
        width: 18,
        color: [
          [0.2, '#67e0e3'],
          [0.5, '#fac858'],
          [0.8, '#91cc75'],
          [1, '#ee6666']
        ]
      }
    },
    axisTick: { show: true, length: 8, lineStyle: { color: '#eee' } },
    splitLine: { show: true, length: 12, lineStyle: { color: '#eee' } },
    axisLabel: { show: true, fontSize: 10 },
    pointer: { show: true, length: '70%', width: 8, itemStyle: { color: 'auto' } },
    detail: { offsetCenter: [0, 25], valueAnimation: true, fontSize: 14, formatter: '{value}°C' },
    title: { show: true, offsetCenter: [0, -20], fontSize: 12 },
    data: [{ value: 0, name: '温度' }]
  }]
})

// 湿度仪表盘
const humidityGaugeOptions = reactive({
  title: { text: '相对湿度', left: 'center', top: 5 },
  series: [{
    type: 'gauge',
    center: ['50%', '55%'],
    radius: '70%',
    min: 0,
    max: 100,
    splitNumber: 5,
    progress: { show: true, width: 18, itemStyle: { color: '#91cc75' } },
    axisLine: {
      lineStyle: {
        width: 18,
        color: [
          [0.3, '#67e0e3'],
          [0.7, '#fac858'],
          [1, '#ee6666']
        ]
      }
    },
    axisTick: { show: true, length: 8, lineStyle: { color: '#eee' } },
    splitLine: { show: true, length: 12, lineStyle: { color: '#eee' } },
    axisLabel: { show: true, fontSize: 10 },
    pointer: { show: true, length: '70%', width: 8, itemStyle: { color: 'auto' } },
    detail: { offsetCenter: [0, 25], valueAnimation: true, fontSize: 14, formatter: '{value}%' },
    title: { show: true, offsetCenter: [0, -20], fontSize: 12 },
    data: [{ value: 0, name: '湿度' }]
  }]
})

// 风速仪表盘
const windGaugeOptions = reactive({
  title: { text: '风速', left: 'center', top: 5 },
  series: [{
    type: 'gauge',
    center: ['50%', '55%'],
    radius: '70%',
    min: 0,
    max: 20,
    splitNumber: 5,
    progress: { show: true, width: 18, itemStyle: { color: '#73c0de' } },
    axisLine: {
      lineStyle: {
        width: 18,
        color: [
          [0.25, '#67e0e3'],
          [0.6, '#fac858'],
          [1, '#ee6666']
        ]
      }
    },
    axisTick: { show: true, length: 8, lineStyle: { color: '#eee' } },
    splitLine: { show: true, length: 12, lineStyle: { color: '#eee' } },
    axisLabel: { show: true, fontSize: 10 },
    pointer: { show: true, length: '70%', width: 8, itemStyle: { color: 'auto' } },
    detail: { offsetCenter: [0, 25], valueAnimation: true, fontSize: 14, formatter: '{value} m/s' },
    title: { show: true, offsetCenter: [0, -20], fontSize: 12 },
    data: [{ value: 0, name: '风速' }]
  }]
})

// ==================== 数据更新函数 ====================
// 更新趋势图
function updateTrendCharts() {
  const data = hoursList.value
  if (!data || data.length === 0) return

  const times = data.map(item => convertToLocalTime(item.forecast_time))

  temperatureOptions.xAxis.data = times
  temperatureOptions.series[0].data = data.map(item => item.temperature)
  temperatureOptions.series[1].data = data.map(item => item.feelslike)

  humidityOptions.xAxis.data = times
  humidityOptions.series[0].data = data.map(item => item.humidity)
  humidityOptions.series[1].data = data.map(item => item.dew)

  windOptions.xAxis.data = times
  windOptions.series[0].data = data.map(item => item.wind_speed)
  windOptions.series[1].data = data.map(item => item.wind_gust)

  precipOptions.xAxis.data = times
  precipOptions.series[0].data = data.map(item => item.precipitation || 0)
  precipOptions.series[1].data = data.map(item => item.precipitation_probability || 0)
}

// 更新紫外线仪表盘
function updateUvGauge() {
  uvGaugeOptions.series[0].data[0].value = currentUvIndex.value
}

// 更新风向饼图
function updateWindPie() {
  windPieOptions.series[0].data = windPieData.value
}

// 更新卡片模式的仪表盘（温度、湿度、风速）
function updateCardGauges() {
  const data = latestData.value
  if (!data) return
  tempGaugeOptions.series[0].data[0].value = data.temperature ?? 0
  humidityGaugeOptions.series[0].data[0].value = data.humidity ?? 0
  windGaugeOptions.series[0].data[0].value = data.wind_speed ?? 0
}

// 总更新函数（两种模式都需要的更新）
function refreshAllCharts() {
  updateTrendCharts()
  updateUvGauge()
  updateWindPie()
  updateCardGauges()
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
      hfHoursList.value = resultQ.data || []
      tiHoursList.value = resultT.data || []
      hoursList.value = hfHoursList.value
      if (hoursList.value.length) {
        date.value = convertToLocalTime(hoursList.value[0].forecast_time)
      }
      refreshAllCharts()
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

// 手动刷新（卡片模式用）
const refreshData = () => {
  fetchData(selectedCity.value)
}

// 城市切换
const handleCityChange = (cityName) => {
  if (cityName) fetchData(cityName)
}

// 数据源切换
const switchChartsSource = (source) => {
  if (source) {
    hoursList.value = hfHoursList.value
  } else {
    hoursList.value = tiHoursList.value
  }
  if (hoursList.value.length) {
    date.value = convertToLocalTime(hoursList.value[0].forecast_time)
  }
  refreshAllCharts()
}

// 切换显示模式（time 事件）
const switchChartsTime = (showTrend) => {
  isTimeView.value = showTrend == true
}

// 监听数据变化，自动刷新图表
watch(hoursList, () => {
  if (hoursList.value && hoursList.value.length) {
    refreshAllCharts()
    date.value = convertToLocalTime(hoursList.value[0].forecast_time)
  }
}, { deep: false })

watch(currentUvIndex, () => updateUvGauge())
watch(windPieData, () => updateWindPie(), { deep: true })
watch(latestData, () => updateCardGauges(), { deep: false })

// 生命周期
onMounted(() => {
  console.log('接受数据');

  emitter.on('cityName', handleCityChange)
  emitter.on('source', switchChartsSource)
  emitter.on('time', switchChartsTime)
  fetchData()
})

onUnmounted(() => {
  emitter.off('cityName', handleCityChange)
  emitter.off('source', switchChartsSource)
  emitter.off('time', switchChartsTime)
})
</script>

<style scoped>
/* 全局样式 */
.dashboard {
  max-width: 1500px;
  margin: 16px auto;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
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

/* 两列网格布局（趋势图和卡片模式下的仪表盘网格） */
.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

/* 卡片模式数值卡片网格 */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.info-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  border-radius: 28px;
  padding: 20px 12px 16px;
  text-align: center;
  box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.1);
  transition: all 0.25s ease;
  border: 1px solid rgba(255, 255, 255, 0.5);
  position: relative;
  overflow: hidden;
}

.info-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  opacity: 0;
  transition: opacity 0.25s;
}

.info-card:hover {
  transform: translateY(-5px);
  background: white;
  box-shadow: 0 20px 30px -12px rgba(0, 0, 0, 0.15);
  border-color: #e2e8f0;
}

.info-card:hover::before {
  opacity: 1;
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 8px;
  opacity: 0.8;
}

.card-title {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 12px;
}

.card-value {
  font-size: 1.7rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

/* 手动刷新按钮 */
.refresh-btn-wrapper {
  text-align: center;
  margin-top: 20px;
}

.refresh-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  padding: 10px 32px;
  border-radius: 40px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
}

.refresh-btn:hover:not(:disabled) {
  transform: scale(1.02);
  box-shadow: 0 6px 14px rgba(59, 130, 246, 0.4);
}

.refresh-btn:disabled {
  background: #94a3b8;
  box-shadow: none;
  cursor: not-allowed;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .dashboard {
    padding: 12px;
  }
  .chart-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }
  .cards-grid {
    gap: 14px;
  }
  .info-card {
    padding: 16px 8px;
  }
  .card-value {
    font-size: 1.4rem;
  }
  .card-icon {
    font-size: 1.5rem;
  }
}
</style>
