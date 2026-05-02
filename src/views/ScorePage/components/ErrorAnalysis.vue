<template>
  <div class="error-analysis">
    <!-- 全局筛选卡片（玻璃态） -->
    <el-card class="global-filter-card" shadow="never">
      <!-- <template #header>
        <div class="card-header">
          <div class="header-title">
            <span class="header-icon">⚙️</span>
            <span>全局筛选条件</span>
          </div>
          <el-tooltip content="所有图表将基于以下条件展示数据" placement="top">
            <el-icon class="help-icon">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>
      </template> -->
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-select v-model="globalCity" multiple collapse-tags placeholder="城市" clearable filterable>
            <template #header>
              <el-checkbox v-model="cityCheckAll" :indeterminate="cityIndeterminate" @change="handleCityCheckAll">
                全选
              </el-checkbox>
            </template>
            <el-option v-for="c in cityOptions" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-select v-model="globalSource" multiple collapse-tags placeholder="数据来源" clearable>
            <el-option v-for="s in sourceOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-select v-model="selectedField" @change="changeSingleField" placeholder="天气字段（单选）" clearable filterable>
            <el-option v-for="f in fieldOptionsShort" :key="f.value" :label="f.label" :value="f.value" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="date-quick-buttons">
            <el-button size="small" @click="setQuickDate('yesterday')">昨天</el-button>
            <el-button size="small" @click="setQuickDate('7days')">最近7天</el-button>
            <el-button size="small" @click="setQuickDate('30days')">最近30天</el-button>
          </div>
          <el-date-picker v-model="globalDateRange" type="daterange" range-separator="至" start-placeholder="开始"
            end-placeholder="结束" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-col>
      </el-row>
      <el-row style="margin-top: 20px">
        <el-col :span="24" class="filter-actions">
          <el-button type="primary" @click="handleGlobalQuery" :loading="globalQueryLoading" class="query-btn">
            <el-icon>
              <Refresh />
            </el-icon> 刷新
          </el-button>
          <el-button @click="resetGlobalFilters" class="reset-btn">重置</el-button>
          <el-tag v-if="globalCity.length && globalSource.length" type="info" effect="plain" class="filter-tag">
            <el-icon>
              <Filter />
            </el-icon>
            已选 {{ globalCity.length }} 个城市 · {{ globalSource.length }} 个数据源
          </el-tag>
        </el-col>
      </el-row>
    </el-card>

    <!-- 误差分布分析卡片（箱线图 + 热力图 + 折线图） -->
    <el-card class="chart-card merged-chart-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <span class="header-icon">📊</span>
            <span>误差分布分析</span>
          </div>
          <div class="header-actions">
            <el-tooltip content="箱线图和折线图受【天气字段】影响；热力图展示所有字段的平均误差" placement="top">
              <el-icon class="help-icon">
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </div>
        </div>
      </template>
      <!-- 第一行：箱线图 + 热力图 -->
      <div class="charts-row">
        <div class="chart-half" v-loading="boxLoading">
          <div class="chart-sub-header">
            <span>📦 误差分布箱线图（按数据来源）</span>
            <span v-if="selectedField" class="field-badge">{{ getFieldLabel(selectedField) }}</span>
            <span v-else class="field-badge warning">未选择字段</span>
          </div>
          <div class="chart-container">
            <EChartsWrapper ref="chartBox" v-if="boxOptions.series && selectedField" :options="boxOptions"
              height="360px" :auto-resize="true" />
            <el-empty v-else description="请选择天气字段" :image-size="80" />
          </div>
        </div>
        <div class="chart-half" v-loading="heatLoading">
          <div class="chart-sub-header">
            <span>🔥 平均误差热力图（数据来源 vs 天气字段）</span>
            <span class="field-badge info">全部字段</span>
          </div>
          <div class="chart-container">
            <EChartsWrapper ref="chartHeat" v-if="heatOptions.series" :options="heatOptions" height="360px"
              :auto-resize="true" @click="onHeatmapClick" />
            <el-empty v-else description="请选择城市和来源后查询" :image-size="80" />
          </div>
        </div>
      </div>
      <!-- 第二行：折线图 -->
      <div class="charts-row">
        <div class="chart-full" v-loading="lineLoading">
          <div class="chart-sub-header">
            <span>📈 平均误差趋势图（按数据来源）</span>
            <span v-if="selectedField" class="field-badge">{{ getFieldLabel(selectedField) }}</span>
            <span v-else class="field-badge warning">未选择字段</span>
          </div>
          <div class="chart-container">
            <EChartsWrapper ref="chartLine" v-if="lineOptions.series" :options="lineOptions" height="360px"
              :auto-resize="true" />
            <el-empty v-else description="请选择城市和来源后查询" :image-size="80" />
          </div>
        </div>
      </div>
    </el-card>

    <!-- 城市误差热力图卡片 -->
    <el-card class="chart-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <span class="header-icon">🗺️</span>
            <span>城市误差热力图（数据来源 vs 城市）</span>
          </div>
          <div class="header-actions">
            <span v-if="selectedField" class="field-badge">{{ getFieldLabel(selectedField) }}</span>
            <el-tooltip content="颜色越深表示误差越大" placement="top">
              <el-icon class="help-icon">
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </div>
        </div>
      </template>
      <div class="chart-container" v-loading="heatCityLoading">
        <EChartsWrapper ref="chartHeatCity" v-if="heatCityOptions.series" :options="heatCityOptions" height="500px"
          :auto-resize="true" />
        <el-empty v-else description="请选择城市和来源后查询" :image-size="80" />
      </div>
    </el-card>

    <!-- 误差明细表格卡片 -->
    <el-card class="table-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <span class="header-icon">📋</span>
            <span>误差明细数据</span>
          </div>
          <el-button size="small" type="primary" @click="exportTableCSV" class="export-btn">
            <el-icon>
              <Download />
            </el-icon> 导出 CSV
          </el-button>
        </div>
      </template>
      <el-table :data="tableData" border stripe height="400" v-loading="tableLoading" @sort-change="handleTableSort"
        style="width: 100%" :row-class-name="tableRowClassName">
        <el-table-column prop="city" label="城市" width="100" fixed="left" />
        <el-table-column prop="source" label="数据来源" width="120" />
        <el-table-column prop="target_date" label="日期" sortable="custom" width="120" />
        <el-table-column prop="temp" label="气温原始误差" sortable="custom" width="150">
          <template #default="{ row }"><el-tag size="small" :type="getErrorTag(row.temp)">{{ row.temp.toFixed(2)
              }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="temp_ewma_error" label="气温EWMA误差" sortable="custom" width="150">
          <template #default="{ row }"><el-tag size="small" :type="getErrorTag(row.temp_ewma_error)">{{
            row.temp_ewma_error.toFixed(2) }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="temp_max" label="最高温原始误差" sortable="custom" width="150">
          <template #default="{ row }"><el-tag size="small" :type="getErrorTag(row.temp_max)">{{ row.temp_max.toFixed(2)
              }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="temp_max_ewma_error" label="最高温EWMA误差" sortable="custom" width="150">
          <template #default="{ row }"><el-tag size="small" :type="getErrorTag(row.temp_max_ewma_error)">{{
            row.temp_max_ewma_error.toFixed(2) }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="temp_min" label="最低温原始误差" sortable="custom" width="150">
          <template #default="{ row }"><el-tag size="small" :type="getErrorTag(row.temp_min)">{{ row.temp_min.toFixed(2)
              }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="temp_min_ewma_error" label="最低温EWMA误差" sortable="custom" width="150">
          <template #default="{ row }"><el-tag size="small" :type="getErrorTag(row.temp_min_ewma_error)">{{
            row.temp_min_ewma_error.toFixed(2) }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="humidity" label="湿度原始误差" sortable="custom" width="150">
          <template #default="{ row }"><el-tag size="small" :type="getErrorTag(row.humidity)">{{ row.humidity.toFixed(2)
              }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="humidity_ewma_error" label="湿度EWMA误差" sortable="custom" width="150">
          <template #default="{ row }"><el-tag size="small" :type="getErrorTag(row.humidity_ewma_error)">{{
            row.humidity_ewma_error.toFixed(2) }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="precip" label="降雨量原始误差" sortable="custom" width="150">
          <template #default="{ row }"><el-tag size="small" :type="getErrorTag(row.precip)">{{ row.precip.toFixed(2)
              }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="precip_ewma_error" label="降雨量EWMA误差" sortable="custom" width="150">
          <template #default="{ row }"><el-tag size="small" :type="getErrorTag(row.precip_ewma_error)">{{
            row.precip_ewma_error.toFixed(2) }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="pressure" label="气压原始误差" sortable="custom" width="150">
          <template #default="{ row }"><el-tag size="small" :type="getErrorTag(row.pressure)">{{ row.pressure.toFixed(2)
              }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="pressure_ewma_error" label="气压EWMA误差" sortable="custom" width="150">
          <template #default="{ row }"><el-tag size="small" :type="getErrorTag(row.pressure_ewma_error)">{{
            row.pressure_ewma_error.toFixed(2) }}</el-tag></template>
        </el-table-column>
      </el-table>
      <el-config-provider :locale="customPaginationLocale">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" background style="margin-top: 20px; justify-content: flex-end;" />
      </el-config-provider>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { QuestionFilled, Refresh, Filter, Download } from '@element-plus/icons-vue'
import { errorScoreApi } from '@/apis/score'
import { cityOptions, fieldOptionsShort, sourceOptions } from '@/constants/weatherOptions'
import dayjs from 'dayjs'
import { useUserPreferences } from '@/composables/useUserPreferences'
const { defaultCities, defaultSources, defaultFields, defaultDateStart, defaultDateEnd, loaded } = useUserPreferences()

// -------------------- 全局筛选状态 --------------------
const globalCity = ref([])
const globalSource = ref([])
const globalDateRange = ref(null)
const globalFields = ref([])
const globalQueryLoading = ref(false)

// 城市全选逻辑
const cityCheckAll = ref(false)
const cityIndeterminate = ref(false)
watch(globalCity, (val) => {
  if (val.length === 0) {
    cityCheckAll.value = false
    cityIndeterminate.value = false
  } else if (val.length === cityOptions.length) {
    cityCheckAll.value = true
    cityIndeterminate.value = false
  } else {
    cityIndeterminate.value = true
  }
})
const handleCityCheckAll = (val) => {
  cityIndeterminate.value = false
  globalCity.value = val ? cityOptions.map(c => c.value) : []
}

// 字段标签映射
const fieldLabelMap = {
  humidity: '湿度',
  pressure: '气压',
  precip: '降雨量',
  temp_max: '最高温',
  temp_min: '最低温',
  temp: '温度',
}
const getFieldLabel = (field) => fieldLabelMap[field] || field

// -------------------- 箱线图 --------------------
const boxData = ref([])
const boxLoading = ref(false)
const selectedField = ref('')

const fetchBoxData = async () => {
  if (!globalCity.value.length || !globalSource.value.length || !selectedField.value) {
    boxData.value = []
    return
  }
  boxLoading.value = true
  try {
    const res = await errorScoreApi.getWeatherDaysErrorsStatistics(
      globalSource.value,
      globalDateRange.value,
      globalCity.value,
      selectedField.value,
    )
    if (res.data?.code === 200) {
      boxData.value = res.data.data || []
    } else {
      boxData.value = []
      ElMessage.error(res.data?.message || '获取箱线图数据失败')
    }
  } catch (err) {
    console.error(err)
    boxData.value = []
  } finally {
    boxLoading.value = false
  }
}

const xAxisBoxSource = computed(() => boxData.value.map(item => item.source))
const boxDataSeries = computed(() => boxData.value.map(item => item.data))
const boxOptions = computed(() => {
  if (!boxData.value.length) return {}
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const d = params[0].value
        return `${params[0].name}<br/>最小值: ${d[1].toFixed(2)}<br/>下四分位: ${d[2].toFixed(2)}<br/>中位数: ${d[3].toFixed(2)}<br/>上四分位: ${d[4].toFixed(2)}<br/>最大值: ${d[5].toFixed(2)}`
      },
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderColor: '#333',
      textStyle: { color: '#fff' }
    },
    xAxis: { type: 'category', data: xAxisBoxSource.value, name: '数据来源', axisLabel: { rotate: 15, fontWeight: 500 }, axisLine: { lineStyle: { color: '#ccc' } } },
    yAxis: { type: 'value', name: `误差值 (${unitMap[selectedField.value] || ''})`, splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } } },
    series: [{
      type: 'boxplot',
      data: boxDataSeries.value,
      itemStyle: { color: '#3b82f6', borderColor: '#1e3a8a', borderWidth: 2 },
      boxWidth: [30, 50]
    }]
  }
})

// -------------------- 热力图（字段 vs 来源） --------------------
const heatData = ref([])
const heatLoading = ref(false)
const currentHeatmapSources = ref([])
const currentHeatmapFields = ref([])

const fetchHeatData = async () => {
  if (!globalCity.value.length || !globalSource.value.length) {
    heatData.value = []
    return
  }
  heatLoading.value = true
  try {
    const res = await errorScoreApi.getWeatherDaysErrorsAvg({
      source: globalSource.value,
      city: globalCity.value,
      dateRange: globalDateRange.value
    })
    if (res.data?.code === 200) {
      heatData.value = res.data.data || []
    } else {
      heatData.value = []
      ElMessage.error(res.data?.message || '获取热力图数据失败')
    }
  } catch (err) {
    console.error(err)
    heatData.value = []
  } finally {
    heatLoading.value = false
  }
}

const heatOptions = computed(() => {
  if (!heatData.value.length) return {}
  const sourceSet = new Set()
  const fieldSet = new Set()
  const valueMap = new Map()
  heatData.value.forEach(item => {
    const source = item.source
    sourceSet.add(source)
    const fieldsData = item.data
    Object.entries(fieldsData).forEach(([field, avgValue]) => {
      fieldSet.add(field)
      valueMap.set(`${source}|${field}`, avgValue)
    })
  })
  const sources = Array.from(sourceSet).sort()
  const fields = Array.from(fieldSet).sort()
  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  currentHeatmapSources.value = sources
  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  currentHeatmapFields.value = fields
  const data = []
  fields.forEach((field, xIdx) => {
    sources.forEach((source, yIdx) => {
      const value = valueMap.get(`${source}|${field}`) ?? 0
      data.push([xIdx, yIdx, value])
    })
  })
  const maxValue = Math.max(...data.map(d => d[2]), 0.1)
  return {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const source = sources[params.data[1]]
        const field = fields[params.data[0]]
        const value = params.data[2].toFixed(2)
        return `${source}<br/>${fieldLabelMap[field] || field}<br/>平均误差: ${value}`
      },
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderColor: '#333',
      textStyle: { color: '#fff' }
    },
    xAxis: { type: 'category', data: fields.map(f => fieldLabelMap[f] || f), name: '天气字段', axisLabel: { rotate: 30 } },
    yAxis: { type: 'category', data: sources, name: '数据来源' },
    visualMap: {
      min: 0,
      max: maxValue,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: { color: ['#ebf5ff', '#3b82f6', '#1e3a8a'] }
    },
    series: [{
      type: 'heatmap',
      data: data,
      label: { show: true, formatter: (params) => params.data[2].toFixed(1) },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } },
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 1 }
    }]
  }
})

const onHeatmapClick = (params) => {
  if (params && params.data && params.data.length >= 3) {
    const field = currentHeatmapFields.value[params.data[0]]
    if (field) {
      selectedField.value = field
      ElMessage.success(`已切换到字段：${getFieldLabel(field)}，图表将自动更新`)
    }
  }
}

// -------------------- 折线图 --------------------
const lineData = ref([])
const lineLoading = ref(false)
const unitMap = { temp: '°C', temp_max: '°C', temp_min: '°C', humidity: '%', precip: 'mm', pressure: 'hPa' }

const fetchLineData = async () => {
  if (!globalCity.value.length || !globalSource.value.length) {
    lineData.value = []
    return
  }
  lineLoading.value = true
  try {
    const res = await errorScoreApi.getWeatherDaysErrorsAvgBySource({
      source: globalSource.value,
      city: globalCity.value,
      dateRange: globalDateRange.value,
      errorType: selectedField.value
    })
    if (res.data?.code === 200) {
      lineData.value = res.data.data || []
    } else {
      lineData.value = []
      ElMessage.error(res.data?.message || '获取折线图数据失败')
    }
  } catch (err) {
    console.error(err)
    lineData.value = []
  } finally {
    lineLoading.value = false
  }
}

const lineOptions = computed(() => {
  const colorList = ['#5470c6', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452']
  if (!lineData.value.length) return {}
  const allDatesSet = new Set()
  lineData.value.forEach(series => series.data.forEach(point => allDatesSet.add(point.date)))
  const xAxisData = Array.from(allDatesSet).sort()
  let idx = -1
  const series = lineData.value.map(series => {
    const valueMap = new Map(series.data.map(p => [p.date, p.value]))
    const data = xAxisData.map(date => valueMap.get(date) ?? null)
    idx++
    return {
      name: series.source,
      type: 'line',
      data,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 2.5,color: colorList[idx % colorList.length] },
      areaStyle: { opacity: 0.1 }
    }
  })
  return {
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value) => value?.toFixed(2) + (unitMap[selectedField.value] || '')
    },
    legend: { data: lineData.value.map(s => s.source), top: 0, right: 10 },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: xAxisData, axisLabel: { rotate: 30, formatter: (v) => dayjs(v).format('MM-DD') } },
    yAxis: { type: 'value', name: `平均误差 (${unitMap[selectedField.value] || ''})`, splitLine: { lineStyle: { type: 'dashed' } } },
    series
  }
})

// -------------------- 城市热力图 --------------------
const heatCityData = ref([])
const heatCityLoading = ref(false)

const fetchHeatCityData = async () => {
  if (!globalCity.value.length || !globalSource.value.length) {
    heatCityData.value = []
    return
  }
  heatCityLoading.value = true
  try {
    const res = await errorScoreApi.getWeatherDaysErrorsAvgByCity({
      source: globalSource.value,
      city: globalCity.value,
      dateRange: globalDateRange.value,
      errorType: selectedField.value,
    })
    if (res.data?.code === 200) {
      heatCityData.value = res.data.data || []
    } else {
      heatCityData.value = []
      ElMessage.error(res.data?.message || '获取城市热力图数据失败')
    }
  } catch (err) {
    console.error(err)
    heatCityData.value = []
  } finally {
    heatCityLoading.value = false
  }
}

const heatCityOptions = computed(() => {
  if (!heatCityData.value.length) return {}
  const cities = globalCity.value
  const sources = globalSource.value
  const seriesData = []
  for (let i = 0; i < cities.length; i++) {
    for (let j = 0; j < sources.length; j++) {
      const item = heatCityData.value.find(d => d.city === cities[i] && d.source === sources[j])
      seriesData.push([j, i, item ? item.avg_value : null])
    }
  }
  const maxVal = Math.max(...seriesData.map(d => d[2]).filter(v => v !== null), 1)
  return {
    tooltip: {
      position: 'top',
      formatter: (params) => {
        const city = cities[params.data[1]]
        const source = sources[params.data[0]]
        const value = params.data[2]
        return `${city}<br/>${source}<br/>平均误差: ${value?.toFixed(2)}`
      }
    },
    xAxis: { type: 'category', data: sources, name: '数据来源', axisLabel: { fontWeight: 500 } },
    yAxis: { type: 'category', data: cities, name: '城市', axisLabel: { fontWeight: 500 } },
    visualMap: {
      min: 0,
      max: maxVal,
      calculable: true,
      orient: 'vertical',
      left: 'left',
      inRange: { color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'] }
    },
    series: [{
      type: 'heatmap',
      data: seriesData,
      label: { show: true, formatter: (params) => params.data[2]?.toFixed(1) || '' },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } },
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 1 }
    }]
  }
})

// -------------------- 表格 --------------------
const tableData = ref([])
const tableLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const sortField = ref('')
const sortOrder = ref('')
const customPaginationLocale = { el: { pagination: { pagesize: '条/页', total: '共 {total} 条', goto: '前往', pageClassifier: '页' } } }

const fetchTableData = async () => {
  if (!globalCity.value.length || !globalSource.value.length) {
    tableData.value = []
    total.value = 0
    return
  }
  tableLoading.value = true
  try {
    const res = await errorScoreApi.getWeatherDaysErrorsPaging({
      source: globalSource.value,
      city: globalCity.value,
      dateRange: globalDateRange.value,
      page: currentPage.value,
      pageSize: pageSize.value,
      sortField: sortField.value,
      sortOrder: sortOrder.value
    })
    if (res.data?.code === 200) {
      tableData.value = res.data.data.list
      total.value = res.data.data.pagination.total
      currentPage.value = res.data.data.pagination.page
      pageSize.value = res.data.data.pagination.pageSize
    } else {
      tableData.value = []
      ElMessage.error(res.data?.message || '获取表格数据失败')
    }
  } catch (err) {
    console.error(err)
    tableData.value = []
  } finally {
    tableLoading.value = false
  }
}

const handleTableSort = ({ prop, order }) => {
  if (order === 'ascending') { sortField.value = prop; sortOrder.value = 'asc' }
  else if (order === 'descending') { sortField.value = prop; sortOrder.value = 'desc' }
  else { sortField.value = ''; sortOrder.value = '' }
  currentPage.value = 1
  fetchTableData()
}
const handleSizeChange = (newSize) => { pageSize.value = newSize; currentPage.value = 1; fetchTableData() }
const handleCurrentChange = (newPage) => { currentPage.value = newPage; fetchTableData() }
const exportTableCSV = () => {
  const headers = ['城市', '数据来源', '日期', '气温原始误差', '气温EWMA误差', '最高温原始误差', '最高温EWMA误差', '最低温原始误差', '最低温EWMA误差', '湿度原始误差', '湿度EWMA误差', '降雨量原始误差', '降雨量EWMA误差', '气压原始误差', '气压EWMA误差']
  const rows = tableData.value.map(item => [
    item.city, item.source, item.target_date,
    item.temp?.toFixed(2), item.temp_ewma_error?.toFixed(2),
    item.temp_max?.toFixed(2), item.temp_max_ewma_error?.toFixed(2),
    item.temp_min?.toFixed(2), item.temp_min_ewma_error?.toFixed(2),
    item.humidity?.toFixed(2), item.humidity_ewma_error?.toFixed(2),
    item.precip?.toFixed(2), item.precip_ewma_error?.toFixed(2),
    item.pressure?.toFixed(2), item.pressure_ewma_error?.toFixed(2)
  ])
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'error_table.csv'
  link.click()
  URL.revokeObjectURL(link.href)
}

// 辅助函数
const getErrorTag = (val) => {
  if (val < 2) return 'success'
  if (val < 5) return 'warning'
  return 'danger'
}
const tableRowClassName = ({ rowIndex }) => (rowIndex % 2 === 0 ? 'even-row' : '')

// 全局查询
const handleGlobalQuery = async () => {
  if (!globalCity.value.length) { ElMessage.warning('请至少选择一个城市'); return }
  if (!globalSource.value.length) { ElMessage.warning('请至少选择一个数据来源'); return }
  globalQueryLoading.value = true
  try {
    currentPage.value = 1
    sortField.value = ''
    sortOrder.value = ''
    await Promise.all([
      fetchBoxData(),
      fetchHeatData(),
      fetchTableData(),
      fetchLineData(),
      fetchHeatCityData(),
    ])
  } finally {
    globalQueryLoading.value = false
  }
}

const resetGlobalFilters = () => {
  globalCity.value = []
  globalSource.value = []
  globalDateRange.value = null
  globalFields.value = []
  boxData.value = []
  heatData.value = []
  tableData.value = []
  total.value = 0
  currentPage.value = 1
  sortField.value = ''
  sortOrder.value = ''
}

// 自动查询防抖
let autoQueryTimer = null
watch([globalCity, globalSource, globalDateRange, globalFields, selectedField], () => {
  if (autoQueryTimer) clearTimeout(autoQueryTimer)
  autoQueryTimer = setTimeout(() => {
    if (globalCity.value.length && globalSource.value.length) handleGlobalQuery()
  }, 500)
})

const setQuickDate = (type) => {
  const today = dayjs()
  let start, end
  switch (type) {
    case 'yesterday': start = today.subtract(1, 'day').format('YYYY-MM-DD'); end = start; break
    case '7days': start = today.subtract(6, 'day').format('YYYY-MM-DD'); end = today.format('YYYY-MM-DD'); break
    case '30days': start = today.subtract(29, 'day').format('YYYY-MM-DD'); end = today.format('YYYY-MM-DD'); break
    default: return
  }
  globalDateRange.value = [start, end]
  ElMessage.success(`时间范围已切换至 ${start} 至 ${end}`)
}

const changeSingleField = (value) => {
  if (!value) return
  ElMessage.success(`已切换到字段：${getFieldLabel(value)}，图表将自动更新`)
}

// 监听 loaded 变为 true 时，再将设置值赋给本地变量
watch(loaded, (isLoaded) => {
  if (isLoaded) {
    if (defaultCities.value && defaultCities.value.length) {
      globalCity.value = [...defaultCities.value]
    }
    if (defaultSources.value && defaultSources.value.length) {
      globalSource.value = [...defaultSources.value]
    }
    if (defaultFields.value && defaultFields.value.length) {
      selectedField.value = defaultFields.value[0]
    }
    if (defaultDateStart.value && defaultDateEnd.value) {
      globalDateRange.value = [defaultDateStart.value, defaultDateEnd.value]
    }
    handleGlobalQuery()
  }
}, { immediate: true })  // immediate 确保如果已经加载完成则立即执行
</script>

<style scoped>
/* ========== 全局背景 ========== */
.error-analysis {
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2f6 100%);
  min-height: 100vh;
}

/* ========== 卡片通用样式 ========== */
.global-filter-card,
.chart-card,
.table-card {
  border-radius: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  margin-bottom: 24px;
}

.global-filter-card:hover,
.chart-card:hover,
.table-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.08);
}

/* ========== 卡片头部 ========== */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 18px;
  color: #1e293b;
  border-bottom: 2px solid rgba(59, 130, 246, 0.2);
  padding-bottom: 12px;
  margin-bottom: 20px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 22px;
}

.help-icon {
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.2s;
}

.help-icon:hover {
  color: #3b82f6;
}

/* ========== 筛选栏内部 ========== */
.date-quick-buttons {
  margin-bottom: 8px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.query-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
  transition: all 0.2s;
}

.query-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.reset-btn {
  transition: all 0.2s;
}

.reset-btn:hover {
  transform: translateY(-1px);
}

.filter-tag {
  background: #eef2ff;
  border: none;
  color: #1e40af;
  margin-left: 12px;
}

/* ========== 图表布局 ========== */
.charts-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 24px;
}

.chart-half {
  flex: 1;
  min-width: 300px;
  background: #ffffff;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.chart-full {
  width: 100%;
  background: #ffffff;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.chart-sub-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
  font-size: 15px;
  font-weight: 500;
  color: #334155;
  padding: 0 4px;
}

.field-badge {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 10px;
  border-radius: 20px;
  background: #eff6ff;
  color: #1e40af;
}

.field-badge.warning {
  background: #fffbeb;
  color: #d97706;
}

.field-badge.info {
  background: #e6f7e6;
  color: #2e7d32;
}

.chart-container {
  min-height: 360px;
  width: 100%;
}

/* ========== 表格样式 ========== */
:deep(.el-table) {
  border-radius: 20px;
  overflow: hidden;
}

:deep(.el-table th) {
  background: #f8fafc;
  font-weight: 600;
  color: #1e293b;
}

:deep(.el-table .even-row) {
  background-color: #fafbff;
}

:deep(.el-tag--success) {
  background-color: #e0f2fe;
  border-color: #bae6fd;
  color: #0369a1;
}

:deep(.el-tag--warning) {
  background-color: #ffedd5;
  border-color: #fed7aa;
  color: #b45309;
}

:deep(.el-tag--danger) {
  background-color: #fee2e2;
  border-color: #fecaca;
  color: #b91c1c;
}

/* ========== 分页 ========== */
:deep(.el-pagination) {
  padding: 16px 0 8px;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next),
:deep(.el-pagination .el-pager li) {
  border-radius: 8px;
  margin: 0 4px;
}

:deep(.el-pagination .el-pager li.active) {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .error-analysis {
    padding: 12px;
  }

  .card-header {
    font-size: 16px;
  }

  .chart-half,
  .chart-full {
    padding: 12px;
  }
}
</style>
