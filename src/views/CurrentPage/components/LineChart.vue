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
        <EChartsWrapper :options="uvLineOptions" height="300px" :loading="loading" />
      </div>
      <div class="chart-card">
        <EChartsWrapper :options="windPieOptions" height="300px" :loading="loading" />
      </div>
    </div>

    <!-- 卡片模式（仅展示数值卡片） -->
    <div v-else>
      <div class="cards-grid">
        <div class="info-card">
          <div class="card-icon">🌡️</div>
          <div class="card-title">温度</div>
          <div class="card-value">{{ currentHourData?.temperature ?? '--' }} °C</div>
        </div>
        <div class="info-card">
          <div class="card-icon">🤒</div>
          <div class="card-title">体感温度</div>
          <div class="card-value">{{ currentHourData?.feelslike ?? '--' }} °C</div>
        </div>
        <div class="info-card">
          <div class="card-icon">💧</div>
          <div class="card-title">湿度</div>
          <div class="card-value">{{ currentHourData?.humidity ?? '--' }} %</div>
        </div>
        <div class="info-card">
          <div class="card-icon">💨</div>
          <div class="card-title">风速</div>
          <div class="card-value">{{ currentHourData?.wind_speed ?? '--' }} m/s</div>
        </div>
        <div class="info-card">
          <div class="card-icon">🌧️</div>
          <div class="card-title">降雨量</div>
          <div class="card-value">{{ currentHourData?.precipitation ?? '--' }} mm</div>
        </div>
        <div class="info-card">
          <div class="card-icon">☔</div>
          <div class="card-title">降雨概率</div>
          <div class="card-value">{{ currentHourData?.precipitation_probability ?? '--' }} %</div>
        </div>
        <div class="info-card">
          <div class="card-icon">⏲️</div>
          <div class="card-title">大气压</div>
          <div class="card-value">{{ currentHourData?.pressure ?? '--' }} hPa</div>
        </div>
        <div class="info-card">
          <div class="card-icon">☀️</div>
          <div class="card-title">紫外线指数</div>
          <div class="card-value">{{ currentHourData?.uv_index ?? '--' }}</div>
        </div>
      </div>
    </div>

    <!-- 手动刷新按钮（卡片模式） -->
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

// 工具函数：UTC 转东八区时间（仅时间）
function convertToLocalTime(utcTimeStr) {
  return dayjs(utcTimeStr).tz('Asia/Shanghai').format('HH:mm')
}

// 工具函数：将 UTC 时间字符串转为东八区 dayjs 对象
function toLocalDayjs(utcTimeStr) {
  return dayjs(utcTimeStr).tz('Asia/Shanghai')
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
const currentSource = ref('hf') // 当前数据源: 'hf' 或 'ti'



// 根据当前时间（东八区）查找最接近的整点数据
const currentHourData = computed(() => {
  const data = hoursList.value
  if (!data.length) return null

  const now = dayjs().tz('Asia/Shanghai')
  const currentHour = now.startOf('hour')

  let closest = null
  let minDiff = Infinity

  for (const item of data) {
    const itemTime = toLocalDayjs(item.forecast_time)
    const diff = Math.abs(itemTime.diff(currentHour, 'millisecond'))
    if (diff < minDiff) {
      minDiff = diff
      closest = item
    }
  }

  if (minDiff > 60 * 60 * 1000) {
    console.warn('未找到当前小时的整点数据，使用最后一条数据作为fallback')
    return data[data.length - 1]
  }
  return closest
})

// 标题文本（卡片模式显示当前整点数据日期，趋势图模式显示第一个数据日期）
const titleText = computed(() => {
  if (isTimeView.value) {
    // 趋势图模式：显示数据日期（年月日）
    if (!hoursList.value.length) return '小时气象'
    const firstData = hoursList.value[0]
    const dateStr = toLocalDayjs(firstData.forecast_time).format('YYYY年MM月DD日')
    return `小时气象 · ${dateStr}`
  } else {
    // 卡片模式：显示当前小时数据的时间点（小时:分钟）
    if (!currentHourData.value) return '小时气象'
    const timeStr = toLocalDayjs(currentHourData.value.forecast_time).format('HH:mm')
    return `小时气象 · ${timeStr}`
  }
})

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

// 紫外线折线图配置（支持无数据提示）
const uvLineOptions = reactive({
  title: { text: '紫外线指数趋势', left: 'left', top: 0 },
  tooltip: { trigger: 'axis' },
  legend: { data: ['紫外线指数'], top: 20, left: 'left' },
  grid: {
    left: '8%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: { type: 'category', boundaryGap: false, data: [] },
  yAxis: {
    name: '紫外线指数 (UV Index)',
    nameLocation: 'middle',
    nameTextStyle: {
      fontWeight: 'normal',
      fontSize: 12
    },
    nameGap: 40,
    axisLabel: {
      fontSize: 10
    }
  },
  series: [
    {
      name: '紫外线指数',
      type: 'line',
      data: [],
      smooth: true,
      lineStyle: { width: 2, color: '#ee6666' },
      areaStyle: { opacity: 0.2, color: '#ee6666' },
      symbol: 'circle',
      symbolSize: 6
    }
  ],
  graphic: [] // 用于显示无数据提示
})

// 风向频率饼图配置（仅趋势图使用）
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

// ==================== 数据更新函数 ====================
// 更新所有趋势图（包括新增的紫外线折线图）
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

  // 处理紫外线折线图：根据数据源决定是否显示数据或提示
  if (currentSource.value === 'hf') {
    // 和风数据：不显示紫外线数据，展示无数据提示
    uvLineOptions.xAxis.data = []
    uvLineOptions.series[0].data = []
    uvLineOptions.graphic = [{
      type: 'text',
      left: 'center',
      top: 'middle',
      style: {
        text: '暂无紫外线数据',
        fill: '#999',
        fontSize: 14,
        fontWeight: 'normal'
      },
      z: 100
    }]
  } else {
    // tomorrow.io 数据：正常显示紫外线指数
    uvLineOptions.xAxis.data = times
    uvLineOptions.series[0].data = data.map(item => item.uv_index ?? 0)
    uvLineOptions.graphic = [] // 清除提示
  }
}

// 更新风向饼图（趋势图用）
function updateWindPie() {
  windPieOptions.series[0].data = windPieData.value
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
      // 根据当前选中的数据源决定 hoursList
      hoursList.value = currentSource.value === 'hf' ? hfHoursList.value : tiHoursList.value
      if (hoursList.value.length) {
        date.value = convertToLocalTime(hoursList.value[0].forecast_time)
      }
      // 更新所有趋势图
      updateTrendCharts()
      updateWindPie()
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
  // source: true -> 和风数据 (hf), false -> tomorrow.io 数据 (ti)
  if (source) {
    currentSource.value = 'hf'
    hoursList.value = hfHoursList.value
  } else {
    currentSource.value = 'ti'
    hoursList.value = tiHoursList.value
  }
  if (hoursList.value.length) {
    date.value = convertToLocalTime(hoursList.value[0].forecast_time)
  }
  updateTrendCharts()
  updateWindPie()
}

// 切换显示模式（time 事件）
const switchChartsTime = (showTrend) => {
  isTimeView.value = showTrend === true
}

// 监听数据变化，自动刷新图表
watch(hoursList, () => {
  if (hoursList.value && hoursList.value.length) {
    updateTrendCharts()
    updateWindPie()
    date.value = convertToLocalTime(hoursList.value[0].forecast_time)
  }
}, { deep: false })

watch(windPieData, () => updateWindPie(), { deep: true })
// watch(latestData, () => updateCardGauges(), { deep: false })

// 生命周期
onMounted(() => {
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
/* 基础样式保持不变，新增可信度区域样式 */
.dashboard {
  max-width: 1500px;
  margin: 16px auto;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

.dashboard-header {
  text-align: left;
  margin-bottom: 12px;
}

.dashboard-header h2 {
  font-size: 1.4rem;
  font-weight: 500;
  color: #1f2f3d;
  margin: 0;
}

/* 可信度展示区域 - 显眼位置 */
.credibility-section {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  padding: 12px 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
  transition: all 0.2s ease;
}

.credibility-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.label-icon {
  font-size: 1.2rem;
}

.label-text {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1e293b;
  letter-spacing: 0.5px;
}

.credibility-progress-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.credibility-progress {
  flex: 1;
  min-width: 180px;
}

.credibility-source {
  font-size: 0.8rem;
  color: #475569;
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
}

.credibility-tip {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 8px;
  padding-top: 4px;
  border-top: 1px dashed #e2e8f0;
}

/* 趋势图网格布局 */
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
  .credibility-section {
    padding: 10px 16px;
    margin-bottom: 18px;
  }
  .credibility-progress-wrapper {
    flex-direction: column;
    align-items: flex-start;
  }
  .credibility-progress {
    width: 100%;
  }
}
</style>
