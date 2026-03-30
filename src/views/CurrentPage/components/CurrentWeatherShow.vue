<template>
  <div>
    <div class="weather-card">
      <!-- 天气卡片列表（水平滚动） -->
       <div class="reliability-card1">
        <WeatherHoursCard v-for="weather in filteredDaysList" :weather="weather"
        :key="weather.id || weather.forecast_time" />
      </div>
      <!-- 可信度卡片 -->
      <div v-if="currentScoreList.length" class="reliability-card">
        <div class="reliability-header">
          <span class="reliability-title">📊 数据源可信度</span>
          <span class="reliability-source">{{ currentSourceName }}</span>
        </div>
        <div class="reliability-items">
          <div v-for="item in sortedScoreList" :key="item.score_type" class="reliability-item"
            :class="{ 'total-item': item.score_type === 'totalScore' }">
            <div class="item-label">
              <span>{{ getScoreTypeName(item.score_type) }}</span>
              <span class="item-score">{{ formatScore(item.score) }}%</span>
            </div>
            <el-progress :percentage="item.score" :stroke-width="item.score_type === 'totalScore' ? 10 : 6"
              :color="getProgressColor(item.score)" :show-text="false" />
          </div>
        </div>
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
const daysList = ref([])           // 当前显示的天气数据
const hfdaysList = ref([])         // 和风天气原始数据
const tidaysList = ref([])         // tomorrow.io天气原始数据
const heFengScoreList = ref([])    // 和风可信度数据
const tiScoreList = ref([])        // tomorrow.io可信度数据
const currentScoreList = ref([])   // 当前显示的可信度数据
const loading = ref(false)
const error = ref(null)
const selectedCity = ref('北京')
const currentSource = ref(true)    // true=和风, false=tomorrow.io

// 获取昨天日期
const yesterdayDate = computed(() => {
  return dayjs().tz('Asia/Shanghai').subtract(1, 'day').format('YYYY-MM-DD')
})

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

// 可信度列表排序（总分置顶）
const sortedScoreList = computed(() => {
  return [...currentScoreList.value].sort((a, b) => {
    if (a.score_type === 'totalScore') return -1
    if (b.score_type === 'totalScore') return 1
    return 0
  })
})

// 得分类型映射
const getScoreTypeName = (type) => {
  const map = {
    totalScore: '综合得分',
    temp: '温度',
    humidity: '湿度',
    pressure: '气压',
    tempMax: '最高温',
    tempMin: '最低温',
    precip: '降水量'
  }
  return map[type] || type
}

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

const fetchDataScore = async (city, source) => {
  const cityToUse = city || selectedCity.value
  const date = yesterdayDate.value
  try {
    const response = await errorScoreApi.getWeatherDaysScore(cityToUse, '2026-03-28', source)
    const result = response.data
    if (result.code === 200) {
      if (source === 'QWeather') {
        heFengScoreList.value = result.data
        if (currentSource.value) currentScoreList.value = heFengScoreList.value
      } else if (source === 'tomorrow.io') {
        tiScoreList.value = result.data
        if (!currentSource.value) currentScoreList.value = tiScoreList.value
      }
    } else {
      console.warn(`获取${source}可信度失败:`, result.message)
    }
  } catch (err) {
    console.error(`获取${source}可信度出错:`, err)
  }
}

// 城市切换事件
const handleCityChange = (cityName) => {
  if (!cityName) return
  selectedCity.value = cityName
  fetchDataTi(cityName)
  fetchDataHeFeng(cityName)
  fetchDataScore(cityName, 'QWeather')
  fetchDataScore(cityName, 'tomorrow.io')
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
  fetchDataScore(selectedCity.value, 'QWeather')
  fetchDataScore(selectedCity.value, 'tomorrow.io')
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
  width: 400px;      /* 固定宽度 */
  flex-shrink: 0;    /* 禁止收缩 */
}
.weather-card::-webkit-scrollbar {
  display: none;
}
/* .weather-card > * {
  flex-shrink: 0;
} */

/* 可信度卡片样式（与天气卡片风格一致） */
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
/* .weather-card > .reliability-card1 > * {
  flex-shrink: 1;
  width: 280px;
} */
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

/* 响应式：小屏幕下进度条卡片占满宽度，下方天气卡片正常滚动 */
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
