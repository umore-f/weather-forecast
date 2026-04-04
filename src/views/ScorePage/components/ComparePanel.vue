<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <!-- 控制面板 -->
    <div class="controls-panel">
      <el-row :gutter="20" class="controls-row">
        <el-col :span="24">
          <div class="control-group">
            <div class="control-header">
              <label>城市（最多选2个）</label>
              <el-button type="text" @click="toggleCityExpand" :icon="isCityExpanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'">
                {{ isCityExpanded ? '收起' : '展开' }}
              </el-button>
            </div>
            <el-checkbox-group v-model="selectedCities" :max="2" class="horizontal-checkbox-group" :class="{ expanded: isCityExpanded }">
              <el-checkbox v-for="city in cityOptions" :key="city.value" :value="city.value" :label="city.label" />
            </el-checkbox-group>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="controls-row">
        <el-col :span="24">
          <div class="control-group">
            <div class="control-header">
              <label>数据来源（最多选3个）</label>
            </div>
            <el-checkbox-group v-model="selectedSources" :max="3" class="horizontal-checkbox-group">
              <el-checkbox v-for="source in sourceOptions" :key="source.value" :value="source.value" :label="source.label" />
            </el-checkbox-group>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="controls-row">
        <el-col :span="24">
          <div class="control-group">
            <div class="control-header">
              <label>气象字段（最多选2个）</label>
            </div>
            <el-checkbox-group v-model="selectedFields" :max="2" class="horizontal-checkbox-group">
              <el-checkbox v-for="field in fieldOptions" :key="field.value" :value="field.value" :label="field.label" />
            </el-checkbox-group>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="controls-row">
        <el-col :span="8">
          <div class="control-group">
            <label>时间范围</label>
            <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
              end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 100%" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-group">
            <label>显示模式</label>
            <el-radio-group v-model="mode" size="small">
              <el-radio-button label="error">误差值</el-radio-button>
              <el-radio-button label="score">可信度分数</el-radio-button>
            </el-radio-group>
          </div>
        </el-col>
        <el-col :span="10">
          <div class="control-group">
            <label>时间滑块播放器</label>
            <PlayerControls
              v-model:isPlaying="isPlaying"
              v-model:step="playbackStep"
              v-model:maxStep="maxPlaybackStep"
              v-model:uniqueDates="uniqueDates"
            />
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 折线图 -->
    <div class="chart-card">
      <div class="chart-header">多源趋势对比（点击图例可隐藏/显示数据源）</div>
      <EChartsWrapper :options="enhancedLineOptions" height="500px" :loading="loading" @click="handleLineChartClick" />
    </div>

    <!-- 柱状图折叠面板 -->
    <el-collapse class="aux-chart-collapse">
      <el-collapse-item title="柱状图（某日对比）" name="bar">
        <div class="chart-card" style="margin-top: 0;">
          <EChartsWrapper :options="barChartOptions" height="400px" :loading="loading" />
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import EChartsWrapper from '../../../components/EChartsWrapper.vue'
import PlayerControls from './PlayerControls.vue'
import { convertToLocalDate } from '../../../utils/dateUtils'

// 静态选项
const cityOptions = [
  { label: '北京', value: '北京' }, { label: '上海', value: '上海' }, { label: '广州', value: '广州' },
  { label: '深圳', value: '深圳' }, { label: '杭州', value: '杭州' }, { label: '成都', value: '成都' },
  { label: '南京', value: '南京' }, { label: '武汉', value: '武汉' }, { label: '重庆', value: '重庆' },
  { label: '苏州', value: '苏州' }, { label: '天津', value: '天津' }, { label: '长沙', value: '长沙' },
  { label: '青岛', value: '青岛' }, { label: '西安', value: '西安' }, { label: '郑州', value: '郑州' },
  { label: '合肥', value: '合肥' }, { label: '宁波', value: '宁波' }, { label: '无锡', value: '无锡' },
  { label: '济南', value: '济南' }, { label: '福州', value: '福州' },
]

const sourceOptions = [
  { label: '和风天气', value: 'QWeather' },
  { label: 'tomorrow.io', value: 'tomorrow.io' },
  { label: 'visualcrossing', value: 'visualcrossing' }
]

const fieldOptions = [
  { label: '最高温度', value: 'tempMax' },
  { label: '最低温度', value: 'tempMin' },
  { label: '平均温度', value: 'temp' },
  { label: '相对湿度', value: 'humidity' },
  { label: '降水量', value: 'precip' },
  { label: '气压', value: 'pressure' }
]

const rawData = defineModel('rawData', { type: Array })
const loading = defineModel('loading', { type: Boolean })
const uniqueDates = defineModel('uniqueDates', { type: Array })
const selectedCities = defineModel('selectedCities', { type: Array })
const selectedSources = defineModel('selectedSources', { type: Array })
const selectedFields = defineModel('selectedFields', { type: Array })
const dateRange = defineModel('dateRange', { type: Object })
const mode = defineModel('mode', { type: String })
const isPlaying = defineModel('isPlaying', { type: Boolean })
const playbackStep = defineModel('playbackStep', { type: Number })
const maxPlaybackStep = defineModel('maxPlaybackStep', { type: Number })

// 本地 UI 状态
const isCityExpanded = ref(false)
const toggleCityExpand = () => { isCityExpanded.value = !isCityExpanded.value }

// 折线图点击事件
const emit = defineEmits(['lineChartClick'])
const handleLineChartClick = (params) => {
  let clickedDate = null
  if (params.componentType === 'xAxis' && params.value) {
    clickedDate = params.value
  } else if (params.componentType === 'series' && params.dataIndex !== undefined) {
    clickedDate = params.name
  }
  if (clickedDate) {
    emit('lineChartClick', clickedDate)
  }
}

// 折线图配置
const enhancedLineOptions = computed(() => {
  if (!selectedCities.value?.length || !selectedSources.value?.length || !selectedFields.value?.length || !rawData.value?.length) return {}
  const series = []
  const cities = selectedCities.value
  const sources = selectedSources.value
  const fields = selectedFields.value
  const currentMode = mode.value

  for (const city of cities) {
    for (const source of sources) {
      for (const field of fields) {
        const cityLabel = cityOptions.find(c => c.value === city)?.label || city
        const sourceLabel = sourceOptions.find(s => s.value === source)?.label || source
        const fieldLabel = fieldOptions.find(f => f.value === field)?.label || field
        const name = `${cityLabel}-${sourceLabel}-${fieldLabel}`
        const filtered = rawData.value.filter(item =>
          item.city === city && item.source === source && item[currentMode === 'error' ? 'error_type' : 'score_type'] === field
        )
        filtered.sort((a, b) => new Date(a.target_date) - new Date(b.target_date))
        const data = filtered.map(item => currentMode === 'error' ? item.error_value : item.score)
        series.push({ name, type: 'line', data, smooth: true, symbol: 'circle', symbolSize: 6 })
      }
    }
  }

  const allDates = uniqueDates.value.map(d => convertToLocalDate(d))
  const total = allDates.length
  const endPercent = total > 0 ? (playbackStep.value + 1) / total * 100 : 100
  return {
    title: { text: `${currentMode === 'error' ? '误差' : '分数'}趋势对比（播放器控制显示范围）`, left: 'left' },
    tooltip: { trigger: 'axis', formatter: function(params) {
      let res = params[0].axisValue + '<br/>'
      params.forEach(p => {
        res += `${p.marker} ${p.seriesName}: ${p.value}<br/>`
      })
      return res
    } },
    legend: { data: series.map(s => s.name), top: 30, left: 'center', selectedMode: true },
    grid: { left: '5%', right: '5%', top: '15%', bottom: '15%', containLabel: true },
    xAxis: { type: 'category', data: allDates, boundaryGap: false },
    yAxis: { type: 'value', name: currentMode === 'error' ? '误差值' : '分数' },
    series,
    dataZoom: [
      { type: 'slider', start: 0, end: endPercent, bottom: 10 },
      { type: 'inside', start: 0, end: endPercent }
    ]
  }
})

// 柱状图配置
const barChartOptions = computed(() => {
  if (!selectedCities.value?.length || !selectedSources.value?.length || !selectedFields.value?.length || !rawData.value?.length) return {}
  const dates = [...uniqueDates.value].sort()
  if (!dates.length) return {}
  const targetDate = convertToLocalDate(dates[dates.length - 1])
  const dataForDate = rawData.value.filter(item => convertToLocalDate(item.target_date) === targetDate)
  const cities = [...new Set(dataForDate.map(d => d.city))]
  const fields = selectedFields.value
  const currentMode = mode.value
  const series = fields.map(field => ({
    name: fieldOptions.find(f => f.value === field)?.label || field,
    type: 'bar',
    data: cities.map(city => {
      const items = dataForDate.filter(d => d.city === city && d[currentMode === 'error' ? 'error_type' : 'score_type'] === field)
      if (!items.length) return null
      const sum = items.reduce((acc, cur) => acc + (currentMode === 'error' ? cur.error_value : cur.score), 0)
      return sum / items.length
    }),
    label: { show: true, position: 'top' }
  }))
  return {
    title: { text: `${currentMode === 'error' ? '误差' : '分数'}对比（${targetDate}）`, left: 'left' },
    tooltip: { trigger: 'axis' },
    legend: { data: series.map(s => s.name), top: 30 },
    xAxis: { type: 'category', data: cities, name: '城市' },
    yAxis: { type: 'value', name: currentMode === 'error' ? '误差值' : '分数' },
    series
  }
})
</script>

<style scoped>
/* 原样式保持不变 */
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
}
.horizontal-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  max-height: 44px;
  overflow: hidden;
  transition: max-height 0.4s;
}
.horizontal-checkbox-group.expanded {
  max-height: 120px;
  overflow-y: auto;
}
:deep(.el-checkbox) {
  margin-right: 0;
  background: #f9fafb;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
}
.chart-card {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #eef2f6;
  padding: 16px;
  margin-bottom: 20px;
}
.chart-header {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  border-left: 4px solid #3498db;
  padding-left: 12px;
}
.aux-chart-collapse {
  margin-top: 8px;
}
</style>
