<template>
  <div
    class="weather-card"
    v-loading="loading"
    :style="{ background: gradientBackground }"
  >
    <div class="card-content">
      <!-- 头部：天气图标 + 描述 + 日期/星期 -->
      <div class="header">
        <div class="weather-main">
          <span class="weather-icon">{{ weatherIcon }}</span>
          <span class="weather-text">{{ weather?.weather_text || '暂无天气描述' }}</span>
        </div>
        <div class="date-info">
          <span class="date">{{ formattedDate }}</span>
          <span class="weekday">{{ weekday }}</span>
        </div>
      </div>

      <!-- 当前温度卡片（小面积展示） -->
      <div class="current-temp-card">
        <div class="current-temp">
          <span class="temp-value">{{ weather?.temp ?? '0' }}</span>
          <span class="temp-unit">°C</span>
        </div>
        <!-- <div class="feels-like" v-if="weather?.feels_like">
          体感 {{ weather.feels_like }}°
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed,} from 'vue'

const props = defineProps({
  weather: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  // 图表数据：未来几小时的温度数组，例如 [22, 23, 24, 25, 24, 23]
  chartData: {
    type: Array,
    default: () => []
  },
  // 图表标签：对应每个时间点，例如 ['14时', '15时', ...]
  chartLabels: {
    type: Array,
    default: () => []
  }
})
// 以下为原有的计算属性（天气图标、日期、星期、动态背景等）
const weatherIcon = computed(() => {
  const text = props.weather?.weather_text?.toLowerCase() || ''
  if (text.includes('晴')) return '☀️'
  if (text.includes('多云')) return '⛅'
  if (text.includes('阴')) return '☁️'
  if (text.includes('雨')) return '🌧️'
  if (text.includes('雪')) return '❄️'
  if (text.includes('雷')) return '⛈️'
  if (text.includes('雾')) return '🌫️'
  return '🌈'
})

const formattedDate = computed(() => {
  const time = props.weather?.forecast_time
  if (!time) return '--'
  const parts = time.split('-')
  if (parts.length >= 3) {
    return `${parts[1]}-${parts[2]}`
  }
  return time
})

const weekday = computed(() => {
  const time = props.weather?.forecast_time
  if (!time) return ''
  const date = new Date(time)
  if (isNaN(date.getTime())) return ''
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[date.getDay()]
})

const gradientBackground = computed(() => {
  const temp = props.weather?.temp
  if (temp === undefined || temp === null) return 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)'
  if (temp <= 0) return 'linear-gradient(135deg, #d4e0f0 0%, #b0c4de 100%)'
  if (temp <= 15) return 'linear-gradient(135deg, #e0f0ff 0%, #c2e0f0 100%)'
  if (temp <= 25) return 'linear-gradient(135deg, #fff5e6 0%, #ffe0b5 100%)'
  return 'linear-gradient(135deg, #ffe6e6 0%, #ffccaa 100%)'
})
</script>

<style scoped>
.weather-card {
  flex: 0 0 16%;
  border-radius: 28px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
  backdrop-filter: blur(2px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

.weather-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.12);
  border-color: rgba(255, 255, 255, 0.5);
}

.card-content {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 18px;
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
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.weather-text {
  font-weight: 600;
  font-size: 14px;
  color: #1e2a3a;
  letter-spacing: -0.2px;
}

.date-info {
  text-align: right;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  padding: 6px 12px;
  border-radius: 40px;
  display: flex;
  gap: 8px;
}

.date {
  font-size: 13px;
  font-weight: 600;
  color: #1f3b4c;
}

.weekday {
  font-size: 13px;
  font-weight: 500;
  color: #5b6e8c;
}

/* 当前温度卡片（小面积） */
.current-temp-card {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
  padding: 8px 16px;
  border-radius: 40px;
  margin: 4px 0;
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
  background: rgba(255,255,240,0.6);
  padding: 4px 10px;
  border-radius: 30px;
}

/* 图表容器 */
.chart-container {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(4px);
  border-radius: 24px;
  padding: 12px;
  margin: 8px 0;
}

.temp-chart {
  width: 100%;
  height: auto;
  display: block;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 10px;
  font-weight: 500;
  color: #2c3e50;
  padding: 0 8px;
}

/* 底部指标 */
.metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 12px 8px;
  margin-top: 6px;
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

  .chart-labels {
    font-size: 9px;
  }
}
</style>
