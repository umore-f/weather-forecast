<template>
  <div class="weather-map-page">
    <div class="controls-panel">
      <!-- 城市选择 -->
      <el-row :gutter="20" class="controls-row">
        <el-col :span="24">
          <div class="control-group">
            <div class="control-header">
              <label>城市（最多选3个）</label>
              <el-button type="text" @click="toggleCityExpand"
                :icon="isCityExpanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'">
                {{ isCityExpanded ? '收起' : '展开' }}
              </el-button>
            </div>
            <el-checkbox-group v-model="selectedCities" :max="3" class="horizontal-checkbox-group"
              :class="{ expanded: isCityExpanded }">
              <el-checkbox v-for="city in cityOptions" :key="city.value" :value="city.value" :label="city.label" />
            </el-checkbox-group>
          </div>
        </el-col>
      </el-row>

      <!-- 天气字段（仅用于地图弹窗） -->
      <el-row :gutter="20" class="controls-row">
        <el-col :span="24">
          <div class="control-group">
            <label>地图显示字段</label>
            <el-select v-model="mapField" placeholder="选择字段" style="width: 100%">
              <el-option v-for="field in fieldOptions" :key="field.value" :label="field.label" :value="field.value" />
            </el-select>
          </div>
        </el-col>
      </el-row>

      <!-- 时间范围 + 数据来源 -->
      <el-row :gutter="20" class="controls-row">
        <el-col :span="12">
          <div class="control-group">
            <label>时间范围</label>
            <el-date-picker v-model="dateRange" type="daterange" range-separator="至"
              start-placeholder="开始日期" end-placeholder="结束日期"
              :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
              value-format="YYYY-MM-DD" style="width: 100%" />
          </div>
        </el-col>
        <el-col :span="12">
          <div class="control-group">
            <label>数据来源</label>
            <el-select v-model="selectedSource" placeholder="请选择数据源" multiple style="width: 100%">
              <el-option v-for="source in sourceOptions" :key="source.value" :label="source.label"
                :value="source.value" />
            </el-select>
          </div>
        </el-col>
      </el-row>

      <!-- 热力图开关 -->
      <el-row :gutter="20" class="controls-row">
        <el-col :span="24">
          <div class="control-group">
            <el-switch v-model="showMapHeatmap" active-text="热力图模式" inactive-text="标记模式" />
            <el-select v-if="showMapHeatmap" v-model="mapHeatmapField" placeholder="热力图字段" style="width: 200px; margin-left: 16px;">
              <el-option v-for="field in fieldOptions" :key="field.value" :label="field.label" :value="field.value" />
            </el-select>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 地图区域 -->
    <div class="map-wrapper">
      <WeatherMap
        :cities="uniqueCities"
        :weatherData="daysList"
        :showHeatmap="showMapHeatmap"
        :heatmapField="mapHeatmapField"
      />
      <div v-if="!hasData" class="no-data">暂无数据，请选择城市和字段</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { weatherApi } from '../../apis/weatherApi'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import WeatherMap from './components/WeatherMap.vue' // 根据实际路径调整

dayjs.extend(utc)
dayjs.extend(timezone)

// 配置项
const cityOptions = [
  { label: '北京', value: '北京' }, { label: '上海', value: '上海' }, { label: '广州', value: '广州' },
  { label: '深圳', value: '深圳' }, { label: '杭州', value: '杭州' }, { label: '成都', value: '成都' },
  // ... 其他城市
];

const fieldOptions = [
  { label: '温度 (°C)', value: 'temp' }, { label: '湿度 (%)', value: 'humidity' },
  { label: '降水量 (mm)', value: 'precip_total' }, { label: '风速 (km/h)', value: 'wind_speed' },
  // ... 其他字段
];

const sourceOptions = [
  { label: '和风天气', value: 'QWeather' },
  { label: 'tomorrow.io', value: 'tomorrow.io' },
  { label: 'visualcrossing', value: 'visualcrossing' },
]

// 数据状态
const selectedCities = ref([])
const selectedSource = ref(['QWeather'])
const dateRange = ref(null)
const daysList = ref([])
const loading = ref(false)

// 地图相关
const showMapHeatmap = ref(false)
const mapHeatmapField = ref('temp')
const mapField = ref('temp')  // 用于地图弹窗显示的字段（可选）

// 展开状态
const isCityExpanded = ref(false)
const toggleCityExpand = () => { isCityExpanded.value = !isCityExpanded.value }

// 计算属性：从 daysList 中提取带经纬度的唯一城市
const uniqueCities = computed(() => {
  const map = new Map()
  for (const item of daysList.value) {
    if (!map.has(item.city) && item.lat && item.lon) {
      map.set(item.city, { city: item.city, lat: item.lat, lon: item.lon })
    }
  }
  return Array.from(map.values())
})

const hasData = computed(() => daysList.value.length > 0)

// 监听条件变化请求数据
watch(
  [selectedCities, selectedSource, dateRange],
  async () => {
    if (!selectedCities.value.length) {
      daysList.value = []
      return
    }

    loading.value = true
    try {
      const range = dateRange.value ? { start: dateRange.value[0], end: dateRange.value[1] } : undefined
      const response = await weatherApi.getWeatherDaysInfo(selectedCities.value, range, selectedSource.value)
      if (response.data && response.data.code === 200) {
        daysList.value = response.data.data || []
      } else {
        console.error('API 错误：', response.message)
        daysList.value = []
      }
    } catch (err) {
      console.error('请求失败：', err)
      daysList.value = []
    } finally {
      loading.value = false
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.weather-map-page {
  background: #f5f7fa;
  padding: 24px;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.controls-panel {
  background: #ffffff;
  border-radius: 20px;
  padding: 20px 24px;
  margin-bottom: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid #eef2f6;
}

.controls-row {
  margin-bottom: 24px;
}
.controls-row:last-child {
  margin-bottom: 0;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12px;
}

.control-group label {
  font-weight: 600;
  font-size: 14px;
  color: #2c3e50;
  margin-bottom: 8px;
  display: block;
}

.horizontal-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  transition: max-height 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  max-height: 44px;
  overflow: hidden;
}
.horizontal-checkbox-group.expanded {
  max-height: 120px;
  overflow-y: auto;
  overflow-x: hidden;
}

.map-wrapper {
  position: relative;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #eef2f6;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.no-data {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px 24px;
  border-radius: 32px;
  backdrop-filter: blur(4px);
  pointer-events: none;
}

/* 样式复用原有的 checkbox、input 等样式，此处略... */
:deep(.el-checkbox) {
  margin-right: 0;
  background: #f9fafb;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
}
:deep(.el-checkbox__input) { margin-right: 6px; }
:deep(.el-checkbox__label) { font-size: 13px; color: #4a5568; }
:deep(.el-checkbox.is-checked) { background: #eef2ff; border-color: #3b82f6; }
</style>
