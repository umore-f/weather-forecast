<template>
  <div class="weather-card" :class="{ 'is-loading': loading }" :style="{ background: gradientBackground }">
    <!-- 自定义加载效果 -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
    </div>

    <div class="card-content" :class="{ 'content-blur': loading }">
      <!-- 头部：天气图标 + 文字 & 时间（小时:分钟） -->
      <div class="header">
        <div class="weather-main">
          <span class="weather-icon">{{ weatherIcon }}</span>
          <span class="weather-text">{{ weatherCondition }}</span>
          <span class="weather-text">{{ weatherPrecipitation }}</span>
        </div>
        <div class="time-info">
          <span class="time">{{ formattedTime }}</span>
        </div>
      </div>

      <!-- 当前温度卡片：大号温度 + 体感温度 -->

      <div class="current-temp-card">
        <div class="current-temp">
          <span class="temp-value">{{ displayTemp }}</span>
          <span class="temp-unit">°C</span>
        </div>
        <div class="feels-like">
          体感 {{ feelsLike }}°
        </div>
      </div>

      <!-- 底部指标：湿度 / 风速 / 紫外线 -->
      <div class="metrics">
        <div class="metric-item">
          <span class="metric-icon">💧</span>
          <div class="metric-info">
            <span class="metric-label">湿度</span>
            <span class="metric-value">{{ humidity }}%</span>
          </div>
        </div>
        <div class="metric-item">
          <span class="metric-icon">💨</span>
          <div class="metric-info">
            <span class="metric-label">风速</span>
            <span class="metric-value">{{ windSpeed }} km/h</span>
          </div>
        </div>
        <div class="metric-item">
          <span class="metric-icon">☀️</span>
          <div class="metric-info">
            <span class="metric-label">紫外线</span>
            <span class="metric-value">{{ uvIndex }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import 'dayjs/locale/zh-cn'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('zh-cn')

// 工具函数：UTC 转东八区时间（仅小时:分钟）
function convertToLocalTime(utcTimeStr) {
  if (!utcTimeStr) return '--:--'
  return dayjs(utcTimeStr).tz('Asia/Shanghai').format('HH:mm')
}

// ---------- Props ----------
const props = defineProps({
  weather: {
    type: Object,
    required: true,
    // 期望字段: temperature, feelslike, forecast_time,
    // 可选: condition, icon, humidity, wind_speed, uv
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// ---------- 计算属性 ----------
const displayTemp = computed(() => {
  const temp = props.weather?.temperature
  return temp !== undefined && temp !== null ? Math.round(temp) : '--'
})

const feelsLike = computed(() => {
  const fl = props.weather?.feelslike
  return fl !== undefined && fl !== null ? Math.round(fl) : '--'
})

const weatherPrecipitation = computed(() => {
  const p = props.weather?.precipitation
  return p > 0 ? '雨' : ''
})
// 格式化时间（HH:mm）
const formattedTime = computed(() => convertToLocalTime(props.weather?.forecast_time))

// 天气状况与图标 (优先使用传入的 condition/icon，否则根据温度区间简单推断)
const weatherCondition = computed(() => {
  if (props.weather?.condition) return props.weather.condition
  const temp = props.weather?.temperature
  if (temp === undefined) return '未知'
  if (temp <= 0) return '寒冷'
  if (temp <= 10) return '冷'
  if (temp <= 20) return '凉爽'
  if (temp <= 28) return '舒适'
  return '炎热'
})

const weatherIcon = computed(() => {
  if (props.weather?.icon) return props.weather.icon
  const temp = props.weather?.temperature
  const precipitation = props.weather?.precipitation
  if (precipitation > 0) {
    if (temp === undefined) return '🌡️ 💧'
    if (temp <= 0) return '❄️ 💧'
    if (temp <= 10) return '🧥 💧'
    if (temp <= 20) return '🍂 💧'
    if (temp <= 28) return '☀️ 💧'
  } else {
    if (temp === undefined) return '🌡️'
    if (temp <= 0) return '❄️'
    if (temp <= 10) return '🧥'
    if (temp <= 20) return '🍂'
    if (temp <= 28) return '☀️'
  }
  return '🔥'
})

const humidity = computed(() => {
  const val = props.weather?.humidity
  return val !== undefined && val !== null ? val : '--'
})

const windSpeed = computed(() => {
  const val = props.weather?.wind_speed
  return val !== undefined && val !== null ? Math.round(val) : '--'
})

const uvIndex = computed(() => {
  const val = props.weather?.uv_index
  if (val !== undefined && val !== null) return val
  return '暂无'
})

// 动态渐变背景 (基于温度)
const gradientBackground = computed(() => {
  const temp = props.weather?.temperature
  if (temp === undefined || temp === null) return 'linear-gradient(135deg, #f0f4fa 0%, #e2e8f0 100%)'
  if (temp <= 0) return 'linear-gradient(135deg, #cbdde8 0%, #9fb7cd 100%)'
  if (temp <= 15) return 'linear-gradient(135deg, #d9eaff 0%, #b5d1f0 100%)'
  if (temp <= 25) return 'linear-gradient(135deg, #fff3e0 0%, #ffe0b5 100%)'
  return 'linear-gradient(135deg, #ffded5 0%, #ffbc8c 100%)'
})
</script>

<style scoped>
.weather-card {
  flex: 0 0 80%;
  border-radius: 28px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
  backdrop-filter: blur(2px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  overflow: hidden;
}

.weather-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.12);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 加载遮罩 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 28px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: #ff8c42;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.card-content {
  padding: 20px 16px;
  width: 90%;
  display: flex;
  flex-direction: column;
  /* gap: 18px; */
  transition: filter 0.2s;
}

.content-blur {
  filter: blur(2px);
}

/* 头部区域 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
}

.weather-main {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  padding: 6px 14px;
  border-radius: 40px;
}

.weather-icon {
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.weather-text {
  font-weight: 600;
  font-size: 14px;
  color: #1e2a3a;
  letter-spacing: -0.2px;
}

.time-info {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  padding: 6px 12px;
  border-radius: 40px;
  display: flex;
  align-items: center;
}

.time {
  font-size: 14px;
  font-weight: 600;
  color: #1f3b4c;
  letter-spacing: 0.3px;
}

/* 当前温度卡片 */
.current-temp-card {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
  padding: 8px 16px;
  border-radius: 40px;
  margin: 36px 0;
}

.current-temp {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.temp-value {
  font-size: 28px;
  font-weight: 800;
  color: #0a1c2f;
  line-height: 1;
}

.temp-unit {
  font-size: 14px;
  font-weight: 600;
  color: #3a5a78;
}

.feels-like {
  font-size: 13px;
  font-weight: 500;
  color: #5b6e8c;
  background: rgba(255, 255, 240, 0.6);
  padding: 4px 10px;
  border-radius: 30px;
}

/* 底部指标 */
.metrics {
  display: flex;
  justify-content: space-around;
  width: 90%;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 12px 8px;
  margin-top: 24px;
}

.metric-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 6px 4px;
  border-radius: 20px;
  transition: background 0.2s;
}

.metric-item:hover {
  background: rgba(255, 255, 255, 0.7);
}

.metric-icon {
  font-size: 20px;
  opacity: 0.8;
}

.metric-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.metric-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: #5b6e8c;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: 14px;
  font-weight: 700;
  color: #1e2f41;
}

/* 响应式 */
@media (max-width: 768px) {
  .weather-card {
    flex: 0 0 100%;
    margin-bottom: 12px;
  }

  .card-content {
    padding: 16px;
  }

  .current-temp-card {
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-align: center;
  }

  .temp-value {
    font-size: 32px;
  }

  .metrics {
    gap: 8px;
    padding: 10px;
  }

  .metric-item {
    flex-direction: column;
    text-align: center;
    gap: 4px;
  }

  .metric-info {
    align-items: center;
  }
}
</style>
