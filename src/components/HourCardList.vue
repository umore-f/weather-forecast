<template>
  <div class="weather-card" v-loading="loading">
    <div class="card-content">
      <div class="header">
        <span class="text">{{ weather?.weather_text || '0' }}</span>
        <span class="time">
          <span>{{ weather?.forecast_time.split('-')[1] || '0' }}</span>-
          <span>{{ weather?.forecast_time.split('-')[2] || '0' }}</span>
        </span>
      </div>
      <div class="main">
        <span class="temp">{{ weather?.temp || '0' }}℃</span>
      </div>
      <div class="footer">
        <div class="pressure">
          <span class="label">大气压</span>
          <span class="value">{{ weather?.wind_speed || '0' }}公里/时</span>
        </div>
        <div class="humidity">
          <span class="label">相对湿度</span>
          <span class="value">{{ weather?.humidity || '0' }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// import { props } from 'vue'

const props = defineProps({
  weather: {
    type: Object,
    required: true,   // 如果 title 是必需的，可以设置
  },
})
</script>

<style scoped>
.weather-card {
  flex: 0 0 16%;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.25s ease, transform 0.25s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  border: 1px solid #f0f2f5;
}

.weather-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.04);
  transform: translateY(-3px);
  border-color: #e9ecef;
}

.card-content {
  padding: 16px 10px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 头部区域 - 增强文字对比 */
.header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #1e2a3a;
}

.icon {
  width: 32px;
  height: 32px;
  fill: #4a6a8b;
  color: #4a6a8b;
}

.text {
  font-weight: 600;
  color: #0f172a;
  letter-spacing: -0.2px;
}

.time {
  margin-left: auto;
  font-size: 13px;
  font-weight: 500;
  color: #5b6e8c;
  background: #f8fafc;
  padding: 2px 8px;
  border-radius: 20px;
}

/* 温度主区域 - 更突出 */
.main {
  text-align: center;
  margin: 6px 0;
}

.temp {
  font-size: 42px;
  font-weight: 700;
  color: #0a1c2f;
  letter-spacing: -1px;
  line-height: 1.1;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.02);
}

/* 底部信息 - 更清晰的分隔和对比 */
.footer {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  border-top: 1px solid #e9edf2;
  padding-top: 14px;
  margin-top: 6px;
}

.pressure,
.humidity {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #fafcff;
  padding: 8px 4px;
  border-radius: 14px;
  transition: background 0.2s ease;
}

.pressure:hover,
.humidity:hover {
  background: #f5f9ff;
}

.label {
  font-size: 11px;
  font-weight: 600;
  color: #5b6e8c;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.value {
  font-size: 14px;
  font-weight: 700;
  color: #1e2f41;
}

/* 响应式调整 - 保持移动端同样清晰 */
@media (max-width: 768px) {
  .weather-card {
    flex: 0 0 100%;
    margin: 8px 0;
    border-radius: 18px;
  }
  
  .card-content {
    padding: 14px;
  }

  .temp {
    font-size: 38px;
  }

  .footer {
    flex-direction: column;
    gap: 10px;
  }

  .pressure,
  .humidity {
    flex-direction: row;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
    padding: 10px 12px;
  }
  
  .label {
    font-size: 12px;
  }
  
  .value {
    font-size: 15px;
  }
}
</style>