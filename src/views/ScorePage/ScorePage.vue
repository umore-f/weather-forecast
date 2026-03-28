<template>
  <div class="weather-quality-container">

    <div class="controls-panel">
      <!-- 城市选择 -->
      <el-row :gutter="20" class="controls-row">
        <el-col :span="24">
          <div class="control-group">
            <div class="control-header">
              <label>城市（最多选2个）</label>
              <el-button type="text" @click="toggleCityExpand"
                :icon="isCityExpanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'">
                {{ isCityExpanded ? '收起' : '展开' }}
              </el-button>
            </div>
            <el-checkbox-group v-model="selectedCities" :max="2" class="horizontal-checkbox-group"
              :class="{ expanded: isCityExpanded }">
              <el-checkbox v-for="city in cityOptions" :key="city.value" :value="city.value" :label="city.label" />
            </el-checkbox-group>
          </div>
        </el-col>
      </el-row>

      <!-- 数据源选择 -->
      <el-row :gutter="20" class="controls-row">
        <el-col :span="24">
          <div class="control-group">
            <div class="control-header">
              <label>数据来源（最多选2个）</label>
              <el-button type="text" @click="toggleSourceExpand"
                :icon="isSourceExpanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'">
                {{ isSourceExpanded ? '收起' : '展开' }}
              </el-button>
            </div>
            <el-checkbox-group v-model="selectedSources" :max="3" class="horizontal-checkbox-group"
              :class="{ expanded: isSourceExpanded }">
              <el-checkbox v-for="source in sourceOptions" :key="source.value" :value="source.value" :label="source.label" />
            </el-checkbox-group>
          </div>
        </el-col>
      </el-row>

      <!-- 字段选择（误差类型/分数类型） -->
      <el-row :gutter="20" class="controls-row">
        <el-col :span="24">
          <div class="control-group">
            <div class="control-header">
              <label>字段（最多选2个）</label>
              <el-button type="text" @click="toggleFieldsExpand"
                :icon="isFieldsExpanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'">
                {{ isFieldsExpanded ? '收起' : '展开' }}
              </el-button>
            </div>
            <el-checkbox-group v-model="selectedFields" :max="2" class="horizontal-checkbox-group"
              :class="{ expanded: isFieldsExpanded }">
              <el-checkbox v-for="field in fieldOptions" :key="field.value" :value="field.value" :label="field.label" />
            </el-checkbox-group>
          </div>
        </el-col>
      </el-row>

      <!-- 时间范围 + 模式切换（误差/分数） -->
      <el-row :gutter="20" class="controls-row">
        <el-col :span="12">
          <div class="control-group">
            <label>时间范围</label>
            <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
              end-placeholder="结束日期" :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
              value-format="YYYY-MM-DD" style="width: 100%" />
          </div>
        </el-col>
        <el-col :span="12">
          <div class="control-group">
            <label>显示模式</label>
            <el-radio-group v-model="mode" size="small">
              <el-radio-button label="error">误差值</el-radio-button>
              <el-radio-button label="score">可信度分数</el-radio-button>
            </el-radio-group>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 所有图表区域（已移除不支持多选的热力图） -->
    <div v-if="hasValidSelection" class="charts-grid">
      <!-- 折线图 -->
      <div class="chart-card">
        <div class="chart-header">折线图（趋势对比）</div>
        <EChartsWrapper :options="lineChartOptions" height="400px" :loading="loading" @click="handleChartClick" />
      </div>

      <!-- 柱状图 -->
      <div class="chart-card">
        <div class="chart-header">柱状图（某日对比）</div>
        <EChartsWrapper :options="barChartOptions" height="400px" :loading="loading" @click="handleChartClick" />
      </div>

      <!-- 雷达图 -->
      <div class="chart-card">
        <div class="chart-header">雷达图（多指标对比）</div>
        <EChartsWrapper :options="radarChartOptions" height="400px" :loading="loading" @click="handleChartClick" />
      </div>

      <!-- 散点图 -->
      <div class="chart-card">
        <div class="chart-header">散点图（相关性分析）</div>
        <EChartsWrapper :options="scatterChartOptions" height="400px" :loading="loading" @click="handleChartClick" />
      </div>
    </div>
    <div v-else class="no-data-message">请至少选择一个城市、一个数据源和一个字段</div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { errorScoreApi } from '../../apis/score'
import { cityApi } from '../../apis/city'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

// 工具函数：将 UTC 时间转为本地日期（格式 YYYY/MM/DD）
function convertToLocalDate(utcTimeStr) {
  return dayjs(utcTimeStr).tz('Asia/Shanghai').format('YYYY/MM/DD')
}

// ---------- 静态配置 ----------
const cityOptions = [
  { label: '北京', value: '北京' }, { label: '上海', value: '上海' }, { label: '广州', value: '广州' },
  { label: '深圳', value: '深圳' }, { label: '杭州', value: '杭州' }, { label: '成都', value: '成都' },
  { label: '南京', value: '南京' }, { label: '武汉', value: '武汉' }, { label: '重庆', value: '重庆' },
  { label: '苏州', value: '苏州' }, { label: '天津', value: '天津' }, { label: '长沙', value: '长沙' },
  { label: '青岛', value: '青岛' }, { label: '西安', value: '西安' }, { label: '郑州', value: '郑州' },
  { label: '合肥', value: '合肥' }, { label: '宁波', value: '宁波' }, { label: '无锡', value: '无锡' },
  { label: '济南', value: '济南' }, { label: '福州', value: '福州' }, { label: '厦门', value: '厦门' },
  { label: '东莞', value: '东莞' }, { label: '佛山', value: '佛山' }, { label: '大连', value: '大连' },
  { label: '沈阳', value: '沈阳' }, { label: '昆明', value: '昆明' }, { label: '南昌', value: '南昌' },
  { label: '哈尔滨', value: '哈尔滨' }, { label: '泉州', value: '泉州' }, { label: '常州', value: '常州' }
]

const sourceOptions = [
  { label: '和风天气', value: 'QWeather' },
  { label: 'tomorrow.io', value: 'tomorrow.io' },
  { label: 'visualcrossing', value: 'visualcrossing' }
]

// 字段选项（误差类型/分数类型共用）
const fieldOptions = [
  { label: '最高温度', value: 'tempMax' },
  { label: '最低温度', value: 'tempMin' },
  { label: '平均温度', value: 'temp' },
  { label: '相对湿度', value: 'humidity' },
  { label: '降水量', value: 'precip' },
  { label: '气压', value: 'pressure' }
]

// ---------- 响应式数据 ----------
const selectedCities = ref([])           // 选中的城市（最多2个）
const selectedSources = ref(['QWeather']) // 选中的数据源（最多2个）
const selectedFields = ref([])           // 选中的字段（最多2个）
const dateRange = ref(null)              // 时间范围 [start, end]
const mode = ref('error')                // 显示模式：'error' 或 'score'

const loading = ref(false)
const rawData = ref([])                  // 从 API 获取的原始数据列表
const cityInfoList = ref([])             // 城市经纬度信息（若地图需要，保留）

// 展开状态
const isCityExpanded = ref(false)
const isSourceExpanded = ref(false)
const isFieldsExpanded = ref(false)

// ---------- 计算属性 ----------
const hasValidSelection = computed(() => {
  return selectedCities.value.length > 0 &&
         selectedSources.value.length > 0 &&
         selectedFields.value.length > 0
})

// 城市唯一信息（含经纬度，可用于地图）
const uniqueCities = computed(() => {
  const map = new Map()
  for (const item of cityInfoList.value) {
    if (!map.has(item.name) && item.lat && item.lon) {
      map.set(item.name, { city: item.name, lat: item.lat, lon: item.lon, province: item.province })
    }
  }
  return Array.from(map.values())
})

// 辅助函数：获取字段的友好标签
const getFieldLabel = (fieldValue) => {
  const field = fieldOptions.find(f => f.value === fieldValue)
  return field ? field.label : fieldValue
}

// 辅助函数：根据模式获取 API 数据
const fetchData = async () => {
  if (!hasValidSelection.value) {
    rawData.value = []
    return
  }

  loading.value = true
  try {
    const cities = selectedCities.value
    const sources = selectedSources.value
    const range = dateRange.value ? { start: dateRange.value[0], end: dateRange.value[1] } : undefined

    // 根据 mode 选择调用哪个 API
    let response
    if (mode.value === 'error') {
      response = await errorScoreApi.getWeatherDaysErrors(cities, range, sources)
    } else {
      response = await errorScoreApi.getWeatherDaysScore(cities, range, sources)
    }

    if (response.data && response.data.code === 200) {
      rawData.value = response.data.data || []
    } else {
      console.error('API 错误：', response.message || '未知错误')
      rawData.value = []
    }
  } catch (err) {
    console.error('请求失败：', err)
    rawData.value = []
  } finally {
    loading.value = false
  }
}

// ---------- 各图表配置生成函数 ----------
// 1. 折线图（趋势对比）
const lineChartOptions = computed(() => {
  if (!hasValidSelection.value || !rawData.value.length) return {}

  const series = []
  const cityMap = new Map(cityOptions.map(c => [c.value, c.label]))
  const sourceMap = new Map(sourceOptions.map(s => [s.value, s.label]))
  const fieldMap = new Map(fieldOptions.map(f => [f.value, f.label]))

  const cities = selectedCities.value
  const sources = selectedSources.value
  const fields = selectedFields.value

  for (const city of cities) {
    for (const source of sources) {
      for (const field of fields) {
        const cityLabel = cityMap.get(city) ?? city
        const sourceLabel = sourceMap.get(source) ?? source
        const fieldLabel = fieldMap.get(field) ?? field

        const name = `${cityLabel}-${sourceLabel}-${fieldLabel}`
        const filtered = rawData.value.filter(item =>
          item.city === city && item.source === source && item[mode.value === 'error' ? 'error_type' : 'score_type'] === field
        )
        filtered.sort((a, b) => new Date(a.target_date) - new Date(b.target_date))
        const data = filtered.map(item => mode.value === 'error' ? item.error_value : item.score)

        series.push({
          name,
          type: 'line',
          data,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6
        })
      }
    }
  }

  // X轴数据：所有日期去重排序
  const dateStrings = rawData.value.map(item => convertToLocalDate(item.target_date))
  const uniqueDates = [...new Set(dateStrings)].sort((a, b) => new Date(a) - new Date(b))

  return {
    title: { text: `${mode.value === 'error' ? '误差' : '分数'}趋势对比`, left: 'left' },
    tooltip: { trigger: 'axis' },
    legend: { data: series.map(s => s.name), top: 30, left: 'center' },
    grid: { left: '5%', right: '5%', top: '15%', bottom: '5%', containLabel: true },
    xAxis: { type: 'category', data: uniqueDates, boundaryGap: false },
    yAxis: { type: 'value', name: mode.value === 'error' ? '误差值' : '分数' },
    series,
    dataZoom: [{ type: 'slider', start: 0, end: 100, bottom: 10 }, { type: 'inside' }]
  }
})

// 2. 柱状图（某日对比，默认使用日期范围内的最后一天）
const barChartOptions = computed(() => {
  if (!hasValidSelection.value || !rawData.value.length) return {}

  // 确定展示哪一天的数据
  const dates = rawData.value.map(item => item.target_date).sort()
  const targetDate = dates.length ? convertToLocalDate(dates[dates.length - 1]) : null
  if (!targetDate) return {}

  const dataForDate = rawData.value.filter(item => convertToLocalDate(item.target_date) === targetDate)
  if (!dataForDate.length) return {}

  const cities = [...new Set(dataForDate.map(d => d.city))]
  const fields = selectedFields.value

  const series = fields.map(field => {
    const fieldLabel = getFieldLabel(field)
    return {
      name: fieldLabel,
      type: 'bar',
      data: cities.map(city => {
        const items = dataForDate.filter(d => d.city === city &&
          d[mode.value === 'error' ? 'error_type' : 'score_type'] === field)
        if (!items.length) return null
        const sum = items.reduce((acc, cur) => acc + (mode.value === 'error' ? cur.error_value : cur.score), 0)
        return sum / items.length
      }),
      label: { show: true, position: 'top' }
    }
  })

  return {
    title: { text: `${mode.value === 'error' ? '误差' : '分数'}对比（${targetDate}）`, left: 'left' },
    tooltip: { trigger: 'axis' },
    legend: { data: series.map(s => s.name), top: 30 },
    xAxis: { type: 'category', data: cities, name: '城市' },
    yAxis: { type: 'value', name: mode.value === 'error' ? '误差值' : '分数' },
    series
  }
})

// 3. 雷达图（多指标对比，展示各城市的平均值）
const radarChartOptions = computed(() => {
  if (!hasValidSelection.value || !rawData.value.length) return {}

  const cities = selectedCities.value
  const fields = selectedFields.value

  // 计算每个字段的最大最小值作为指标范围
  const indicator = fields.map(field => {
    const values = rawData.value
      .filter(item => item[mode.value === 'error' ? 'error_type' : 'score_type'] === field)
      .map(item => mode.value === 'error' ? item.error_value : item.score)
      .filter(v => v !== null && v !== undefined)
    const max = Math.max(...values)
    const min = Math.min(...values)
    return { name: getFieldLabel(field), max, min }
  })

  const seriesData = cities.map(city => {
    const cityData = rawData.value.filter(d => d.city === city)
    const values = fields.map(field => {
      const items = cityData.filter(d => d[mode.value === 'error' ? 'error_type' : 'score_type'] === field)
      if (!items.length) return 0
      const sum = items.reduce((acc, cur) => acc + (mode.value === 'error' ? cur.error_value : cur.score), 0)
      return sum / items.length
    })
    return {
      name: cityOptions.find(c => c.value === city)?.label || city,
      value: values,
      areaStyle: { color: 'rgba(59,130,246,0.3)' },
      lineStyle: { width: 2 }
    }
  })

  return {
    title: { text: `${mode.value === 'error' ? '误差' : '分数'}雷达图（平均值）`, left: 'left' },
    tooltip: {},
    legend: { data: seriesData.map(s => s.name), top: 30 },
    radar: { indicator, center: ['50%', '50%'], radius: '60%' },
    series: [{ type: 'radar', data: seriesData, areaStyle: {} }]
  }
})

// 4. 散点图（相关性分析，X轴为第一个选中字段，Y轴为第二个选中字段）
const scatterChartOptions = computed(() => {
  if (!hasValidSelection.value || !rawData.value.length) return {}
  const fields = selectedFields.value
  if (fields.length < 2) return {}

  const xField = fields[0]
  const yField = fields[1]
  const cities = selectedCities.value

  const series = cities.map(city => {
    const cityData = rawData.value.filter(d => d.city === city)
    // 将数据按日期对齐
    const dateMap = new Map()
    for (const item of cityData) {
      const date = item.target_date
      const type = mode.value === 'error' ? item.error_type : item.score_type
      const value = mode.value === 'error' ? item.error_value : item.score
      if (!dateMap.has(date)) dateMap.set(date, {})
      dateMap.get(date)[type] = value
    }
    const data = []
    for (const [date, values] of dateMap.entries()) {
      if (values[xField] !== undefined && values[yField] !== undefined) {
        data.push([values[xField], values[yField]])
      }
    }
    return {
      name: cityOptions.find(c => c.value === city)?.label || city,
      type: 'scatter',
      data,
      symbolSize: 8,
      emphasis: { scale: true }
    }
  })

  return {
    title: { text: `${getFieldLabel(xField)} vs ${getFieldLabel(yField)}`, left: 'left' },
    tooltip: {
      trigger: 'item',
      formatter: params => `${params.seriesName}<br/>${getFieldLabel(xField)}: ${params.value[0]}<br/>${getFieldLabel(yField)}: ${params.value[1]}`
    },
    xAxis: { name: getFieldLabel(xField), nameLocation: 'middle', nameGap: 30 },
    yAxis: { name: getFieldLabel(yField), nameLocation: 'middle', nameGap: 30 },
    series
  }
})

// 图表点击事件（可扩展）
const handleChartClick = (params) => {
  console.log('图表点击：', params)
}

// 获取城市经纬度信息（用于地图，此处仅保留数据结构）
const fetchCityInfo = async (city) => {
  try {
    const res = await cityApi.getCityInfo(city)
    if (res.data && res.data.code === 200) {
      return { city, data: res.data.data }
    } else {
      throw new Error(`获取 ${city} 信息失败：${res.data?.msg || '未知错误'}`)
    }
  } catch (error) {
    console.error(`请求 ${city} 出错`, error)
    return { city, error: true }
  }
}
const getAllCitiesInfo = async () => {
  const promises = cityOptions.map(option => fetchCityInfo(option.value))
  const results = await Promise.all(promises)
  cityInfoList.value = results.filter(item => !item.error).map(item => item.data)
  console.log("城市信息：", cityInfoList.value)
}

// 监听筛选条件变化，重新获取数据
watch(
  [selectedCities, selectedSources, selectedFields, dateRange, mode],
  () => {
    fetchData()
  },
  { immediate: true }
)

// 初始化时获取城市信息
onMounted(() => {
  getAllCitiesInfo()
})

// 展开/收起控制函数
const toggleCityExpand = () => { isCityExpanded.value = !isCityExpanded.value }
const toggleSourceExpand = () => { isSourceExpanded.value = !isSourceExpanded.value }
const toggleFieldsExpand = () => { isFieldsExpanded.value = !isFieldsExpanded.value }
</script>

<style scoped>
.weather-quality-container {
  background: #f5f7fa;
  border-radius: 16px;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

.controls-panel {
  background: #ffffff;
  border-radius: 20px;
  padding: 20px 24px;
  margin-bottom: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.02);
  border: 1px solid #eef2f6;
}

.controls-panel .controls-row {
  margin-bottom: 24px;
}
.controls-panel .controls-row:last-child {
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
  margin: 0;
}

.control-header .el-button--text {
  font-size: 13px;
  color: #7f8c8d;
  padding: 0 4px;
  transition: color 0.2s;
}
.control-header .el-button--text:hover {
  color: #3498db;
  background: transparent;
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

:deep(.el-checkbox) {
  margin-right: 0;
  background: #f9fafb;
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;
}
:deep(.el-checkbox__input) { margin-right: 6px; }
:deep(.el-checkbox__label) { font-size: 13px; color: #4a5568; padding-left: 0; }
:deep(.el-checkbox.is-checked) { background: #eef2ff; border-color: #3b82f6; }
:deep(.el-checkbox.is-checked .el-checkbox__label) { color: #1e40af; }
:deep(.el-checkbox:hover) { background: #f1f5f9; border-color: #cbd5e1; }

:deep(.el-input__wrapper) {
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}
:deep(.el-input__wrapper:hover) { box-shadow: 0 0 0 1px #3b82f6 inset; }
:deep(.el-input__wrapper.is-focus) { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2), 0 0 0 1px #3b82f6 inset; }

.charts-grid {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.chart-card {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #eef2f6;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  padding: 16px;
}

.chart-header {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #2c3e50;
  border-left: 4px solid #3498db;
  padding-left: 12px;
}

.no-data-message {
  text-align: center;
  padding: 60px 20px;
  background: #ffffff;
  border-radius: 20px;
  color: #94a3b8;
  font-size: 16px;
}
</style>
