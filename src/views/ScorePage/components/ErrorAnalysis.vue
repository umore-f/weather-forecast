<template>
  <div class="error-analysis">
    <!-- 全局筛选卡片 -->
    <el-card class="global-filter-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>🔍 全局筛选条件</span>
          <el-tooltip content="所有图表将基于以下条件展示数据" placement="top">
            <el-icon>
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col :span="6">
          <el-select v-model="globalCity" multiple collapse-tags placeholder="城市" clearable filterable>
            <template #header>
              <el-checkbox v-model="cityCheckAll" :indeterminate="cityIndeterminate" @change="handleCityCheckAll">
                全选
              </el-checkbox>
            </template>
            <el-option v-for="c in cityOptions" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="globalSource" multiple collapse-tags placeholder="数据来源" clearable>
            <el-option v-for="s in sourceOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </el-col>
        <!-- <el-col :span="6">
          <el-select v-model="globalFields" multiple collapse-tags placeholder="天气字段（可多选）" clearable filterable>
            <template #header>
              <el-checkbox v-model="fieldCheckAll" :indeterminate="fieldIndeterminate" @change="handleFieldCheckAll">
                全选
              </el-checkbox>
            </template>
            <el-option v-for="f in fieldOptionsShort1" :key="f.value" :label="f.label" :value="f.value" />
          </el-select>
        </el-col> -->
        <el-col :span="6">
          <div class="date-quick-buttons">
            <el-button size="small" @click="setQuickDate('today')">今天</el-button>
            <el-button size="small" @click="setQuickDate('7days')">最近7天</el-button>
            <el-button size="small" @click="setQuickDate('30days')">最近30天</el-button>
          </div>
          <el-date-picker v-model="globalDateRange" type="daterange" range-separator="至" start-placeholder="开始"
            end-placeholder="结束" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-col>

      </el-row>
      <el-row style="margin-top: 16px">
        <el-col :span="24">
          <el-button type="primary" @click="handleGlobalQuery" :loading="globalQueryLoading">刷新</el-button>
          <el-button @click="resetGlobalFilters">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 合并卡片：箱线图 + 热力图 -->
    <el-card class="chart-card merged-chart-card" shadow="hover" style="margin-top: 24px">
      <template #header>
        <div class="card-header">
          <span>📊 误差分布对比（箱线图 / 热力图）</span>
          <div class="header-actions">
            <el-select v-model="selectedField" @change="changeSingleField" placeholder="箱线图天气字段（单选）" clearable
              filterable style="width: 200px;">
              <el-option v-for="f in fieldOptionsShort1" :key="f.value" :label="f.label" :value="f.value" />
            </el-select>
            <el-tooltip content="热力图受全局【天气字段】筛选影响" placement="top">
              <el-icon>
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </div>
        </div>
      </template>
      <div class="charts-row">
        <!-- 箱线图区域 -->
        <div class="chart-half" v-loading="boxLoading">
          <div class="chart-sub-header">
            <span>📦 误差分布箱线图（按数据来源）</span>
            <span class="field-hint" v-if="selectedField">字段：{{ getFieldLabel(selectedField) }}</span>
            <span class="field-hint warning" v-else>未选择字段</span>
          </div>
          <div class="chart-container">
            <EChartsWrapper ref='chartBox' v-if="boxOptions.series && selectedField" :options="boxOptions"
              height="360px" :auto-resize="true" />
            <el-empty v-else description="请选择天气字段" :image-size="80" />
          </div>
        </div>
        <!-- 热力图区域 -->
        <div class="chart-half" v-loading="heatLoading">
          <div class="chart-sub-header">
            <span>🔥 平均误差热力图（数据来源 vs 天气字段）</span>
            <span v-if="globalFields.length" class="field-hint">已筛选字段：{{ globalFields.length }}个</span>
            <span v-else class="field-hint warning">未筛选字段（展示全部）</span>
          </div>
          <div class="chart-container">
            <EChartsWrapper ref="chartHeat" v-if="heatOptions.series" :options="heatOptions" height="360px"
              :auto-resize="true" @click="onHeatmapClick" />
            <el-empty v-else description="请选择城市和来源后查询" :image-size="80" />
          </div>
        </div>
      </div>
    </el-card>

    <!-- 误差明细表格卡片 -->
    <el-card class="table-card" shadow="hover" style="margin-top: 24px">
      <template #header>
        <div class="card-header">
          <span>📋 误差明细数据</span>
          <el-button size="small" type="primary" @click="exportTableCSV">导出 CSV</el-button>
        </div>
      </template>
      <el-table :data="tableData" border stripe height="400" v-loading="tableLoading" @sort-change="handleTableSort"
        style="margin-top: 12px;width: auto;">
        <el-table-column prop="city" label="城市" width="100" />
        <el-table-column prop="source" label="数据来源" width="120" />
        <el-table-column prop="target_date" label="日期" sortable="custom" width="120" />
        <el-table-column prop="temp" label="气温原始误差" sortable="custom" width="180">
          <template #default="{ row }">
            <el-tag size="small">{{ row.temp.toFixed(2) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="temp_ewma_error" label="气温ewma误差" sortable="custom" width="180">
          <template #default="{ row }">
            <el-tag size="small">{{ row.temp_ewma_error.toFixed(2) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="temp_max" label="最高温度原始误差" sortable="custom" width="180">
          <template #default="{ row }">
            <el-tag size="small">{{ row.temp_max.toFixed(2) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="temp_max_ewma_error" label="最高温ewma误差" sortable="custom" width="180">
          <template #default="{ row }">
            <el-tag size="small">{{ row.temp_max_ewma_error.toFixed(2) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="temp_min" label="最低温原始误差" sortable="custom" width="180">
          <template #default="{ row }">
            <el-tag size="small">{{ row.temp_min.toFixed(2) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="temp_min_ewma_error" label="最低温ewma误差" sortable="custom" width="180">
          <template #default="{ row }">
            <el-tag size="small">{{ row.temp_min_ewma_error.toFixed(2) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="humidity" label="潮湿度原始误差" sortable="custom" width="180">
          <template #default="{ row }">
            <el-tag size="small">{{ row.humidity.toFixed(2) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="humidity_ewma_error" label="潮湿度ewma误差" sortable="custom" width="180">
          <template #default="{ row }">
            <el-tag size="small">{{ row.humidity_ewma_error.toFixed(2) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="precip" label="降雨量原始误差" sortable="custom" width="180">
          <template #default="{ row }">
            <el-tag size="small">{{ row.precip.toFixed(2) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="precip_ewma_error" label="降雨量ewma误差" sortable="custom" width="180">
          <template #default="{ row }">
            <el-tag size="small">{{ row.precip_ewma_error.toFixed(2) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pressure" label="大气压原始误差" sortable="custom" width="180">
          <template #default="{ row }">
            <el-tag size="small">{{ row.pressure.toFixed(2) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pressure_ewma_error" label="大气压ewma误差" sortable="custom" width="180">
          <template #default="{ row }">
            <el-tag size="small">{{ row.pressure_ewma_error.toFixed(2) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-config-provider :locale="customPaginationLocale">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" background
          @current-change="handleCurrentChange" style="margin-top: 16px; justify-content: flex-end;">
        </el-pagination>
      </el-config-provider>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { QuestionFilled } from '@element-plus/icons-vue'
import { errorScoreApi } from '@/apis/score'
import { cityOptions, fieldOptionsShort1, sourceOptions } from '@/constants/weatherOptions'
import dayjs from 'dayjs'
// -------------------- 全局筛选状态 --------------------
const globalCity = ref([])
const globalSource = ref([])
const globalDateRange = ref(null)
const globalFields = ref([])
const globalQueryLoading = ref(false)

// 全选逻辑 - 城市
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

// 全选逻辑 - 字段
const fieldCheckAll = ref(true)
const fieldIndeterminate = ref(false)
watch(globalFields, (val) => {
  if (val.length === 0) {
    fieldCheckAll.value = false
    fieldIndeterminate.value = false
  } else if (val.length === fieldOptionsShort1.length) {
    fieldCheckAll.value = true
    fieldIndeterminate.value = false
  } else {
    fieldIndeterminate.value = true
  }
})
// const handleFieldCheckAll = (val) => {
//   fieldIndeterminate.value = false
//   globalFields.value = val ? fieldOptionsShort1.map(f => f.value) : []
// }

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

// -------------------- 箱线图状态 --------------------
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
    ElMessage.error('箱线图请求出错')
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
      }
    },
    xAxis: { type: 'category', data: xAxisBoxSource.value, name: '数据来源', axisLabel: { rotate: 15 } },
    yAxis: { type: 'value', name: '误差值' },
    series: [{ type: 'boxplot', data: boxDataSeries.value, itemStyle: { color: '#3b82f6', borderColor: '#1e40af' }, boxWidth: [30, 50] }]
  }
})

// -------------------- 热力图状态 --------------------
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
      let rawData = res.data.data || []
      heatData.value = rawData
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
      const key = `${source}|${field}`
      valueMap.set(key, avgValue)
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
      const key = `${source}|${field}`
      const value = valueMap.get(key) ?? 0
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
        const fieldLabel = fieldLabelMap[field] || field
        return `${source} - ${fieldLabel}<br/>平均误差: ${value}`
      }
    },
    xAxis: {
      type: 'category',
      data: fields.map(field => fieldLabelMap[field] || field),
      name: '天气字段',
      axisLabel: { rotate: 30 }
    },
    yAxis: {
      type: 'category',
      data: sources,
      name: '数据来源'
    },
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
      label: {
        show: true,
        formatter: (params) => params.data[2].toFixed(1)
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0,0,0,0.5)'
        }
      }
    }]
  }
})

const onHeatmapClick = (params) => {
  // ECharts 点击事件参数：componentType, data (数组 [xIndex, yIndex, value])
  if (params && params.data && params.data.length >= 3) {
    const xIndex = params.data[0]
    // const yIndex = params.data[1]
    // const source = currentHeatmapSources.value[yIndex]
    const fields = currentHeatmapFields.value[xIndex]
    selectedField.value = fields
    ElMessage({ message: `已切换到字段：${getFieldLabel(fields)}，箱线图将自动更新`, type: 'success' })
    // 可选：手动触发一次箱线图查询，确保立即刷新
    fetchBoxData()
  }
}
// -------------------- 表格独立状态 --------------------
const tableData = ref([])
const tableLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const sortField = ref('')
const sortOrder = ref('')

const customPaginationLocale = {
  el: {
    pagination: {
      pagesize: '条/页',
      total: '共 {total} 条',
      goto: '前往',
      pageClassifier: '页'
    }
  }
}

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
  if (order === 'ascending') {
    sortField.value = prop
    sortOrder.value = 'asc'
  } else if (order === 'descending') {
    sortField.value = prop
    sortOrder.value = 'desc'
  } else {
    sortField.value = ''
    sortOrder.value = ''
  }
  currentPage.value = 1
  fetchTableData()
}

const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
  fetchTableData()
}

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
  fetchTableData()
}

const exportTableCSV = () => {
  const headers = ['城市', '数据来源', '日期', '天气字段', '误差值', 'EWMA误差']
  const rows = tableData.value.map(item => [
    item.city, item.source, item.target_date,
    item.error_type, item.error_value, item.ewma_error || ''
  ])
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'error_table.csv'
  link.click()
  URL.revokeObjectURL(link.href)
}

// 全局查询
const handleGlobalQuery = async () => {
  if (!globalCity.value.length) {
    ElMessage.warning('请至少选择一个城市')
    return
  }
  if (!globalSource.value.length) {
    ElMessage.warning('请至少选择一个数据来源')
    return
  }
  globalQueryLoading.value = true
  try {
    currentPage.value = 1
    sortField.value = ''
    sortOrder.value = ''
    await Promise.all([
      fetchBoxData(),
      fetchHeatData(),
      fetchTableData()
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

let autoQueryTimer = null
watch([globalCity, globalSource, globalDateRange, globalFields, selectedField], () => {
  if (autoQueryTimer) clearTimeout(autoQueryTimer)
  autoQueryTimer = setTimeout(() => {
    if (globalCity.value.length && globalSource.value.length) {
      handleGlobalQuery()
    }
  }, 500)
})

// const getErrorTag = (val) => val < 2 ? 'success' : val < 5 ? 'warning' : 'danger'


// 默认值（可根据业务调整）
const DEFAULT_CITIES = ['北京', '上海']  // 取前两个热门城市
const DEFAULT_SOURCES = sourceOptions.map(s => s.value)  // 全选数据源
const DEFAULT_DATE_RANGE = [
  dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
  dayjs().format('YYYY-MM-DD')
]  // 最近7天
// const DEFAULT_FIELDS = []  // 热力图默认展示全部字段，表格默认不筛选字段

onMounted(() => {
  if (globalCity.value.length === 0) {
    globalCity.value = DEFAULT_CITIES
  }
  if (globalSource.value.length === 0) {
    globalSource.value = DEFAULT_SOURCES
  }
  if (!globalDateRange.value) {
    globalDateRange.value = DEFAULT_DATE_RANGE
  }
  // 字段默认为空（热力图展示全部，表格不筛选）
  // globalFields.value = DEFAULT_FIELDS
  globalFields.value = fieldOptionsShort1.map(f => f.value)
  // 箱线图默认选第一个字段
  if (fieldOptionsShort1.length && !selectedField.value) {
    selectedField.value = fieldOptionsShort1[0].value
  }
  // 自动触发一次查询
  handleGlobalQuery()
})

const setQuickDate = (type) => {
  const today = dayjs()
  let start, end
  switch (type) {
    case 'today':
      start = today.format('YYYY-MM-DD')
      end = today.format('YYYY-MM-DD')
      break
    case '7days':
      start = today.subtract(6, 'day').format('YYYY-MM-DD')
      end = today.format('YYYY-MM-DD')
      break
    case '30days':
      start = today.subtract(29, 'day').format('YYYY-MM-DD')
      end = today.format('YYYY-MM-DD')
      break
    default: return
  }
  globalDateRange.value = [start, end]
  ElMessage.success(`时间切换成功`)
}

const changeSingleField = (value) => {

  ElMessage({ message: `已切换到字段：${fieldLabelMap[value]}，箱线图将自动更新`, type: 'success' })
} 
</script>

<style scoped>
.error-analysis {
  padding: 4px;
}

.global-filter-card,
.chart-card,
.table-card {
  display: flex;
  border-radius: 16px;
  margin-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  color: #1e293b;
  flex-wrap: wrap;
  gap: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.merged-chart-card .card-header {
  margin-bottom: 8px;
}

.charts-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.chart-half {
  flex: 1;
  min-width: 300px;
  border-radius: 12px;
  background: #fefefe;
  transition: all 0.2s;
}

.chart-sub-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  padding: 0 8px;
}

.field-hint {
  font-size: 12px;
  font-weight: normal;
  color: #3b82f6;
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 12px;
}

.field-hint.warning {
  color: #f59e0b;
  background: #fffbeb;
}

.chart-container {
  min-height: 380px;
  width: 100%;
}

.date-quick-buttons {
  margin-bottom: 8px;
}

:deep(.el-table th) {
  background-color: #f8fafc;
  font-weight: 600;
}

@media (max-width: 768px) {
  .charts-row {
    flex-direction: column;
    gap: 24px;
  }

  .chart-half {
    width: 100%;
  }
}
</style>