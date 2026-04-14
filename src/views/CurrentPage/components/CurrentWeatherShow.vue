<!-- eslint-disable no-undef -->
<!-- eslint-disable no-undef -->
<template>
  <div>
    <div class="weather-card">
      <!-- 天气卡片列表 -->
      <div class="reliability-card1">
        <WeatherHoursCard v-for="weather in filteredDaysList" :weather="weather"
        :key="weather.id || weather.forecast_time" />
      </div>
      <!-- 可信度卡片 -->
      <div v-if="currentSourceScoreItems.length" class="reliability-card">
        <div class="reliability-header">
          <span class="reliability-title">📊 数据源可信度</span>
          <span class="reliability-source">{{ currentSourceName }}</span>
        </div>
        <div class="reliability-items">
          <!-- 遍历当前数据源的各个评分维度，使用 Element Plus 进度条展示 -->
          <div v-for="item in currentSourceScoreItems" :key="item.key" class="reliability-item"
            :class="{ 'total-item': item.isTotal }">
            <div class="item-label">
              <span>{{ item.label }}</span>
              <span class="item-score">{{ formatScore(item.score) }}%</span>
            </div>
            <el-progress
              :percentage="item.score"
              :format="() => formatScore(item.score)"
              :color="getProgressColor(item.score)"
              :stroke-width="8"
              :show-text="true"
            />
          </div>
        </div>
      </div>
      <div v-else-if="sortedScoreList.length === 0 && !sortedScoreListLoading" class="reliability-card">
        <div class="reliability-header">
          <span class="reliability-title">📊 数据源可信度</span>
          <span class="reliability-source">暂无评分数据</span>
        </div>
        <div style="text-align: center; padding: 20px; color: #999;">请选择城市或稍后重试</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import WeatherHoursCard from '../../../components/WeatherCard.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { weatherApi } from '../../../apis/weatherApi'
import { errorScoreApi } from '../../../apis/score'
import { emitter } from '../../../utils/eventBus'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

// 数据状态
const daysList = ref([])
const hfdaysList = ref([])
const tidaysList = ref([])
const heFengScoreList = ref([])
const tiScoreList = ref([])
const currentScoreList = ref([])
const loading = ref(false)
const error = ref(null)
const selectedCity = ref('北京')
const currentSource = ref(true)    // true=和风, false=tomorrow.io

// 当前数据源名称
const currentSourceName = computed(() => {
  return currentSource.value ? '和风天气' : 'Tomorrow.io'
})

// 过滤最近N小时天气（当前小时起）
const filterRecentHours = (list, hours = 1) => {
  if (!list || !list.length) return []
  const now = dayjs().tz('Asia/Shanghai')
  const startOfHour = now.startOf('hour')
  const endOfRange = startOfHour.add(hours, 'hour')
  return list
    .filter(item => {
      if (!item.forecast_time) return false
      const itemTime = dayjs(item.forecast_time).tz('Asia/Shanghai')
      return itemTime.isSameOrAfter(startOfHour) && itemTime.isBefore(endOfRange)
    })
    .sort((a, b) => {
      const timeA = dayjs(a.forecast_time).tz('Asia/Shanghai').valueOf()
      const timeB = dayjs(b.forecast_time).tz('Asia/Shanghai').valueOf()
      return timeA - timeB
    })
}

const filteredDaysList = computed(() => filterRecentHours(daysList.value))

// ---------- 可信度评分数据处理 ----------
// 接口返回的原始数据（多数据源各维度平均分）
const sortedScoreList = ref([])
const sortedScoreListLoading = ref(false)

// 根据当前数据源（和风/Tomorrow.io）从 sortedScoreList 中提取对应的评分对象
const currentSourceRawScore = computed(() => {
  const targetSource = currentSource.value ? 'QWeather' : 'tomorrow.io'
  const matched = sortedScoreList.value.find(item => item.source === targetSource)
  if (matched) return matched
  return null
})

// 将原始评分对象转换为前端进度条列表（包含字段映射、标签、是否总分）
const currentSourceScoreItems = computed(() => {
  const raw = currentSourceRawScore.value
  if (!raw) return []

  const getValue = (fieldName) => {
    if (raw[fieldName] !== undefined) return raw[fieldName]
    return null
  }

  const items = [
    { key: 'temp', label: '温度评分', field: 'avg_temp_score', isTotal: false },
    { key: 'humidity', label: '湿度评分', field: 'avg_humidity_score', isTotal: false },
    { key: 'pressure', label: '气压评分', field: 'avg_pressure_score', isTotal: false },
    { key: 'temp_max', label: '最高温评分', field: 'avg_temp_max_score', isTotal: false },
    { key: 'temp_min', label: '最低温评分', field: 'avg_temp_min_score', isTotal: false },
    { key: 'precip', label: '降水量评分', field: 'avg_precip_score', isTotal: false },
    { key: 'total', label: '综合得分', field: 'avg_total_score', isTotal: true }
  ]

  return items
    .map(item => {
      let score = getValue(item.field)
      if (score === null || score === undefined) return null
      // 确保分数在 0-100 之间
      const numericScore = Number(score)
      return {
        ...item,
        score: numericScore
      }
    })
    .filter(item => item !== null)
})

const formatScore = (score) => {
  return score !== undefined && score !== null ? Math.round(score * 10) / 10 : '--'
}

const getProgressColor = (score) => {
  if (score >= 80) return '#67C23A'
  if (score >= 60) return '#E6A23C'
  return '#F56C6C'
}

// ---------- 天气数据获取 ----------
const fetchDataHeFeng = async (city) => {
  const cityToUse = city || selectedCity.value
  loading.value = true
  try {
    const response = await weatherApi.getWeatherNowInfo(cityToUse, undefined, 'QWeather')
    const result = response.data
    if (result.code === 200) {
      hfdaysList.value = result.data
      if (currentSource.value) daysList.value = hfdaysList.value
      selectedCity.value = cityToUse
    } else {
      error.value = result.message
    }
  } catch (err) {
    error.value = err.message || '网络请求失败'
  } finally {
    loading.value = false
  }
}

const fetchDataTi = async (city) => {
  const cityToUse = city || selectedCity.value
  loading.value = true
  try {
    const response = await weatherApi.getWeatherNowInfo(cityToUse, undefined, 'tomorrow.io')
    const result = response.data
    if (result.code === 200) {
      tidaysList.value = result.data
      if (!currentSource.value) daysList.value = tidaysList.value
      selectedCity.value = cityToUse
    } else {
      error.value = result.message
    }
  } catch (err) {
    error.value = err.message || '网络请求失败'
  } finally {
    loading.value = false
  }
}

// 获取城市所有数据源各维度平均分
const fetchSingleCityScore = async () => {
  if (!selectedCity.value) {
    sortedScoreList.value = []
    return
  }
  sortedScoreListLoading.value = true
  try {
    let start_date = '2026-3-26', end_date = '2027-3-26'
    const res = await errorScoreApi.getWeatherDaysScoreSourceAvgByCity({
      city: selectedCity.value,
      dateRange: [start_date, end_date]
    })
    if (res.data?.code === 200) {
      sortedScoreList.value = res.data.data || []
      heFengScoreList.value = sortedScoreList.value
      tiScoreList.value = sortedScoreList.value
    } else {
      sortedScoreList.value = []
      // eslint-disable-next-line no-undef
      ElMessage.error(res.data?.message || '获取城市雷达图数据失败')
    }
  } catch (err) {
    console.error(err)
    sortedScoreList.value = []
  } finally {
    sortedScoreListLoading.value = false
  }
}

// 城市切换事件
const handleCityChange = (cityName) => {
  if (!cityName) return
  selectedCity.value = cityName
  fetchDataTi(cityName)
  fetchDataHeFeng(cityName)
  fetchSingleCityScore()   // 切换城市时重新获取评分数据
}

// 数据源切换事件
const switchSource = (useHeFeng) => {
  currentSource.value = useHeFeng
  daysList.value = useHeFeng ? hfdaysList.value : tidaysList.value
  currentScoreList.value = useHeFeng ? heFengScoreList.value : tiScoreList.value
}

// 初始化加载
onMounted(() => {
  emitter.on('cityName', handleCityChange)
  emitter.on('source', switchSource)
  fetchDataTi()
  fetchDataHeFeng()
  fetchSingleCityScore()
})

onUnmounted(() => {
  emitter.off('cityName', handleCityChange)
  emitter.off('source', switchSource)
})
</script>

<style scoped>
.weather-card {
  height: 95%;
  display: flex;
  justify-content: space-between;
  overflow-x: auto;
  flex-wrap: nowrap;
  scrollbar-width: none;
  -ms-overflow-style: none;
  user-select: none;
  cursor: grab;
  gap: 16px;
  padding-bottom: 4px;
  overflow: visible;
  width: 400px;
  flex-shrink: 0;
}
.weather-card::-webkit-scrollbar {
  display: none;
}

/* 可信度卡片样式 */
.reliability-card {
  flex: 0 0 600px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  padding: 16px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.reliability-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.12);
  border-color: rgba(255, 255, 255, 0.5);
}

.reliability-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.reliability-title {
  font-weight: 700;
  font-size: 16px;
  color: #1e2a3a;
}

.reliability-source {
  font-size: 12px;
  font-weight: 500;
  color: #ff8c42;
  background: rgba(255, 140, 66, 0.15);
  padding: 4px 8px;
  border-radius: 20px;
}

.reliability-items {
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
}

.reliability-item {
  width: 100%;
}

.total-item .item-label {
  font-weight: 700;
  color: #ff8c42;
}

.item-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #3a5a78;
}

.item-score {
  font-weight: 700;
  color: #1e2f41;
}

.total-item .item-score {
  color: #ff8c42;
  font-size: 13px;
}

/* 响应式 */
@media (max-width: 768px) {
  .weather-card {
    flex-direction: column;
    height: auto;
    gap: 12px;
  }

  .reliability-card {
    flex: none;
    width: auto;
    margin-right: 0;
  }
}
</style>