<template>
  <div class="air-quality-container mbe-weather-widget" v-loading="!aqiLoadingShow" element-loading-text="加载空气质量数据中...">
    <div class="dashboard-section">
      <div class="dashboard-content">
        <div class="mbe-progress-container">
          <div class="mbe-progress-circle">
            <div class="mbe-progress-bg"></div>
            <div class="mbe-progress-fill" :style="{
              'background': aqiColor,
              'transform': `rotate(${aqiPercentage * 3.6}deg)`
            }"></div>
            <div class="mbe-progress-center">
              <div class="aqi-value">
                <div class="aqi-number">{{ airQualityIndex || "0" }}</div>
                <!-- <div class="aqi-label">空气指数</div> -->
                <div class="quality-indicator" :style="{ color: aqiColor }">{{ aqiDescription|| '0' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pollutants-section">
      <div v-for="pollutant in pollutantList" :key="pollutant.name" class="pollutant-item mbe-pollutant-card">
        <div class="pollutant-info">
          <span class="pollutant-label mbe-pollutant-label">{{ pollutant.name || '0'}}</span>
          <span class="pollutant-value mbe-pollutant-value">{{ pollutant.value || '0'}} <span class="unit">{{ pollutant.unit || '0'}}</span></span>
        </div>
        <div class="pollutant-progress mbe-progress-bar">
          <div class="mbe-progress-track">
            <div class="mbe-progress-indicator" :style="{
              'width': `${pollutant.percentage}%`,
              'background': pollutant.color
            }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- MBE装饰元素 -->
    <div class="mbe-decoration mbe-cloud-1"></div>
    <!-- <div class="mbe-decoration mbe-cloud-2"></div> -->
    <div class="mbe-decoration mbe-leaf-1"></div>
    <!-- <div class="mbe-decoration mbe-leaf-2"></div> -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted} from 'vue'
import {useAqiStore} from '@/store/index'
import emitter from '@/utils/emitter'
const aqiStore = useAqiStore()
const airQualityIndex = computed(() =>  aqiStore.aqi?.[0]?.components.pm2_5.toFixed(0))
const aqiLoadingShow = ref(true)
onMounted(() => {
  emitter.on('aqiLoadingShow', (isLoading) => {
    aqiLoadingShow.value = !isLoading
  })
})
onUnmounted(()=>{
  emitter.off('aqiLoadingShow')
})

// 污染物配置
const pollutantConfigs = [
  { name: 'PM2.5', key: 'pm2_5', unit: 'μg/m³', max: 75 },
  { name: 'PM10', key: 'pm10', unit: 'μg/m³', max: 150 },
  { name: 'SO₂', key: 'so2', unit: 'μg/m³', max: 80 },
  { name: 'NO₂', key: 'no2', unit: 'μg/m³', max: 100 },
  { name: 'O₃', key: 'o3', unit: 'μg/m³', max: 200 }
]

// 污染物列表
const pollutantList = ref([])

// 计算属性
const aqiPercentage = computed(() => {
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
  if (airQualityIndex.value <= 50) return '#67C23A';
  if (airQualityIndex.value <= 100) return '#E6A23C';
  if (airQualityIndex.value <= 150) return '#F56C6C';
  if (airQualityIndex.value <= 200) return '#8B0000';
  return '#4B0082';
});

// 更新污染物数据的函数
const updatePollutants = () => {
  pollutantList.value = pollutantConfigs.map(config => {
    const value = aqiStore.aqi?.[0]?.components?.[config.key] || 0;
    const percentage = Math.min(100, (value / config.max) * 100);

    let color = '#67C23A'; // 绿色
    if (percentage >= 80) {
      color = '#F56C6C'; // 红色
    } else if (percentage >= 60) {
      color = '#E6A23C'; // 黄色
    }

    return {
      ...config,
      value,
      percentage,
      color
    };
  });
};

// 生命周期钩子
onMounted(() => {
  updatePollutants();
});

// 监听 AQIStore 数据变化
watch(
  () => aqiStore.aqi,
  () => {
    updatePollutants();
  },
  { deep: true }
);
</script>

<style scoped>
/* MBE风格基础样式 */
.mbe-weather-widget {
  width: 95%;
  margin: 0 auto;
  margin-top: 15px;
  border-radius: 25px;
  padding: 25px 20px;
  max-width: 800px;
  position: relative;
  overflow: hidden;
  font-family: 'Fredoka One', 'Balsamiq Sans', 'Comic Sans MS', cursive;
  transition: all 0.3s ease;

  /* MBE样式 */
  background: linear-gradient(160deg, #a8e6cf 0%, #dcedc1 100%);
  border: 2px solid #000;
  box-shadow:
    4px 4px 0 #000,
    inset 3px 3px 0 rgba(255, 255, 255, 0.5);
}

/* 仪表盘部分 */
.dashboard-section {
  display: flex;
  justify-content: center;
  /* margin-bottom: 25px; */
}

.dashboard-content {
  text-align: center;
  position: relative;
}

/* MBE圆形进度条 */
.mbe-progress-container {
  display: flex;
  justify-content: center;
  align-items: center;
  /* margin-bottom: 10px; */
}

.mbe-progress-circle {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  border: 3px solid #000;
  /* box-shadow:
    4px 4px 0 #000,
    inset 2px 2px 0 rgba(255, 255, 255, 0.8); */
}

.mbe-progress-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  clip: rect(0, 180px, 180px, 90px);
}

.mbe-progress-fill {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  clip: rect(0, 90px, 180px, 0);
  transform-origin: center;
  transition: transform 1s ease;
}

.mbe-progress-center {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 3px solid #000;
  box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.1);
}

.aqi-value {
  text-align: center;
}

.aqi-number {
  font-size: 32px;
  font-weight: bold;
  /* margin-bottom: 5px; */
  color: #000;
  text-shadow:
    2px 2px 0 rgba(255, 255, 255, 0.8),
    -1px -1px 0 rgba(255, 255, 255, 0.8);
}

.aqi-label {
  font-size: 16px;
  color: #333;
  /* margin-bottom: 5px; */
  text-shadow:
    1px 1px 0 rgba(255, 255, 255, 0.8);
}

.quality-indicator {
  /* margin-top: 5px; */
  font-size: 18px;
  font-weight: bold;
  text-shadow:
    1px 1px 0 rgba(255, 255, 255, 0.8);
}

/* 污染物部分 */
.pollutants-section {
  display: flex;
  flex-direction: column;
  /* gap: 12px; */
}

.mbe-pollutant-card {
  display: flex;
  flex-direction: column;
  /* background: rgba(255, 255, 255, 0.7); */
  /* border: 2px solid #000; */
  border-radius: 15px;
  /* padding: 10px 15px; */
  /* box-shadow: 3px 3px 0 #000; */
  transition: all 0.2s ease;
}

.mbe-pollutant-card:hover {
  transform: translate(2px, 2px);
  /* box-shadow: 1px 1px 0 #000; */
}

.pollutant-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* margin-bottom: 8px; */
}

.mbe-pollutant-label {
  font-size: 16px;
  font-weight: 700;
  color: #000;
  text-shadow:
    1px 1px 0 rgba(255, 255, 255, 0.8);
}

.mbe-pollutant-value {
  font-size: 16px;
  color: #000;
  font-weight: 700;
  text-shadow:
    1px 1px 0 rgba(255, 255, 255, 0.8);
}

.unit {
  font-size: 12px;
  color: #666;
}

/* MBE进度条 */
.mbe-progress-bar {
  width: 100%;
}

.mbe-progress-track {
  width: 100%;
  height: 20px;
  background: white;
  border: 2px solid #000;
  border-radius: 10px;
  box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.mbe-progress-indicator {
  height: 100%;
  border-radius: 8px;
  transition: width 0.5s ease;
  box-shadow: inset 1px 1px 0 rgba(255, 255, 255, 0.5);
}

/* MBE装饰元素 */
.mbe-decoration {
  position: absolute;
  pointer-events: none;
  z-index: 0;
}

.mbe-cloud-1 {
  top: 16px;
  right: 16px;
  width: 40px;
  height: 20px;
  background: white;
  border: 2px solid #000;
  border-radius: 20px;
  box-shadow: 2px 2px 0 #000;
}

.mbe-cloud-2 {
  bottom: 30px;
  left: 25px;
  width: 30px;
  height: 15px;
  background: white;
  border: 2px solid #000;
  border-radius: 15px;
  box-shadow: 2px 2px 0 #000;
}

.mbe-leaf-1 {
  top: 50px;
  right: 20px;
  width: 15px;
  height: 15px;
  background: #a8e6cf;
  border: 2px solid #000;
  border-radius: 50% 0 50% 50%;
  transform: rotate(45deg);
  box-shadow: 2px 2px 0 #000;
}

.mbe-leaf-2 {
  bottom: 50px;
  left: 40px;
  width: 12px;
  height: 12px;
  background: #dcedc1;
  border: 2px solid #000;
  border-radius: 0 50% 50% 50%;
  transform: rotate(-45deg);
  box-shadow: 2px 2px 0 #000;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .mbe-weather-widget {
    width: 95%;
    padding: 20px 15px;
  }

  .mbe-progress-circle {
    width: 150px;
    height: 150px;
  }

  .mbe-progress-center {
    width: 120px;
    height: 120px;
    top: 15px;
    left: 15px;
  }

  .aqi-number {
    font-size: 26px;
  }

  .aqi-label {
    font-size: 14px;
  }

  .quality-indicator {
    font-size: 16px;
  }

  .mbe-pollutant-label,
  .mbe-pollutant-value {
    font-size: 14px;
  }

  .mbe-progress-track {
    height: 16px;
  }

  .mbe-cloud-1,
  .mbe-cloud-2 {
    display: none;
  }
}
</style>
