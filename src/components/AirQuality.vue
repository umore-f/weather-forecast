<template>
  <div class="air-quality-container">
    <div class="dashboard-section">
      <div class="dashboard-content">
        <el-progress type="dashboard" :percentage="aqiPercentage" :color="aqiColor" :width="200">
          <template #default>
            <div class="aqi-value">
              <div class="aqi-number">{{ airQualityIndex }}</div>
              <div class="aqi-label">空气指数</div>
              <div class="quality-indicator" :style="{ color: aqiColor }">{{ aqiDescription }}</div>
            </div>
          </template>
        </el-progress>
      </div>
    </div>

    <div class="pollutants-section">
      <div v-for="pollutant in pollutants" :key="pollutant.name" class="pollutant-item">
        <div class="pollutant-label">{{ pollutant.name }}</div>
        <div class="pollutant-value">{{ pollutant.value }} {{ pollutant.unit }}</div>
        <div class="pollutant-progress">
          <el-progress :percentage="pollutant.percentage" :color="pollutant.color" :show-text="false">
          </el-progress>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, computed } from 'vue'
const airQualityIndex = ref(158)
const pollutants = ref([
  { name: 'PM2.5', value: 65, unit: 'μg/m³', max: 75, percentage: 0, color: '#67C23A' },
  { name: 'PM10', value: 120, unit: 'μg/m³', max: 150, percentage: 0, color: '#67C23A' },
  { name: 'SO₂', value: 45, unit: 'μg/m³', max: 80, percentage: 0, color: '#E6A23C' },
  { name: 'NO₂', value: 85, unit: 'μg/m³', max: 100, percentage: 0, color: '#F56C6C' },
  { name: 'O₃', value: 160, unit: 'μg/m³', max: 200, percentage: 0, color: '#F56C6C' }
])
// 计算属性
const aqiPercentage = computed(() => {
  // 将AQI转换为百分比 (假设AQI最大值为300)
  return Math.min(100, (airQualityIndex.value / 300) * 100);
});

const aqiDescription = computed(() => {
  if (airQualityIndex.value <= 50) return '优';
  if (airQualityIndex.value <= 100) return '良';
  if (airQualityIndex.value <= 150) return '轻度污染';
  if (airQualityIndex.value <= 200) return '中度污染';
  return '重度污染';
});

const aqiColor = computed(() => {
  if (airQualityIndex.value <= 50) return '#67C23A'; // 绿色
  if (airQualityIndex.value <= 100) return '#E6A23C'; // 黄色
  if (airQualityIndex.value <= 150) return '#F56C6C'; // 红色
  if (airQualityIndex.value <= 200) return '#8B0000'; // 深红色
  return '#4B0082'; // 紫色
});


</script>

<style scoped>
.air-quality-container {
  /* max-width: 900px; */
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 10px;
}

.dashboard-section {
  display: flex;
  justify-content: center;
}

.dashboard-content {
  text-align: center;
  position: relative;
}

.aqi-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.aqi-number {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 5px;
}

.aqi-label {
  font-size: 16px;
  color: #666;
}

.pollutants-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.pollutant-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.pollutant-label {
  width: 120px;
  font-size: 14px;
}

.pollutant-value {
  width: 80px;
  text-align: right;
  font-size: 14px;
  margin-right: 10px;
}

.pollutant-progress {
  flex: 1;
}

.header {
  text-align: center;
  margin-bottom: 12px;
}

.header h1 {
  color: #409EFF;
  margin-bottom: 10px;
}


.quality-indicator {
  margin-top: 10px;
  font-size: 18px;
  font-weight: bold;
}
</style>
