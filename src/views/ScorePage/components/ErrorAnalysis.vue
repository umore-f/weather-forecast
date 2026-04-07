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
        <el-col :span="6">
          <el-date-picker v-model="globalDateRange" type="daterange" range-separator="至" start-placeholder="开始"
            end-placeholder="结束" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-col>
        <el-col :span="6">
          <el-select v-model="globalFields" multiple collapse-tags placeholder="天气字段（可多选）" clearable filterable>
            <template #header>
              <el-checkbox v-model="fieldCheckAll" :indeterminate="fieldIndeterminate" @change="handleFieldCheckAll">
                全选
              </el-checkbox>
            </template>
            <el-option v-for="f in fieldOptionsShort1" :key="f.value" :label="f.label" :value="f.value" />
          </el-select>
        </el-col>
      </el-row>
      <el-row style="margin-top: 16px">
        <el-col :span="24">
          <el-button type="primary" @click="handleGlobalQuery" :loading="globalQueryLoading">查询</el-button>
          <el-button @click="resetGlobalFilters">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 1. 箱线图卡片 -->
    <el-card class="chart-card" shadow="hover" style="margin-top: 24px">
      <template #header>
        <div class="card-header">
          <span>📊 误差分布箱线图（按数据来源）</span>
          <el-tooltip content="展示各数据源在【所选第一个字段】上的误差分布" placement="top">
            <el-icon>
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
          <el-select v-model="selectedField" placeholder="天气字段（单选）" clearable filterable style="width: 200px;">
            <el-option v-for="f in fieldOptionsShort1" :key="f.value" :label="f.label" :value="f.value" />
          </el-select>
        </div>
      </template>
      <div class="chart-container" v-loading="boxLoading">
        <EChartsWrapper v-if="boxOptions.series && selectedField" :options="boxOptions" height="400px"
          :auto-resize="true" />
        <el-empty v-else description="请选择筛选条件（至少选择一个字段）并点击查询" :image-size="80" />
      </div>
    </el-card>

    <!-- 2. 热力图卡片 -->
    <el-card class="chart-card" shadow="hover" style="margin-top: 24px">
      <template #header>
        <div class="card-header">
          <span>🔥 平均误差热力图（数据来源 vs 天气字段）</span>
          <el-tooltip content="颜色越深表示该数据源在该字段上的平均误差越大" placement="top">
            <el-icon>
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
          <span v-if="globalFields.length" class="field-hint">已筛选字段：{{ globalFields.length }}个</span>
          <span v-else class="field-hint warning">未筛选字段（展示全部）</span>
        </div>
      </template>
      <div class="chart-container" v-loading="heatLoading">
        <EChartsWrapper v-if="heatOptions.series" :options="heatOptions" height="400px" :auto-resize="true" />
        <el-empty v-else description="请选择筛选条件并点击查询" :image-size="80" />
      </div>
    </el-card>

    <!-- 3. 误差明细表格卡片 -->
    <el-card class="table-card" shadow="hover" style="margin-top: 24px">
      <template #header>
        <div class="card-header">
          <span>📋 误差明细数据</span>
          <el-button size="small" type="primary" @click="exportTableCSV">导出 CSV</el-button>
        </div>
      </template>
      <el-table :data="tableData" border stripe height="400" v-loading="tableLoading" @sort-change="handleTableSort"
        style="margin-top: 12px">
        <el-table-column prop="city" label="城市" width="100" />
        <el-table-column prop="source" label="数据来源" width="120" />
        <el-table-column prop="target_date" label="日期" sortable="custom" width="120" />
        <el-table-column prop="error_type" label="天气字段" width="120" />
        <el-table-column prop="error_value" label="误差值" sortable="custom" width="100">
          <template #default="{ row }">
            <el-tag :type="getErrorTag(row.error_value)" size="small">{{ row.error_value.toFixed(2) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ewma_error" label="EWMA误差" sortable="custom" width="120">
          <template #default="{ row }">{{ row.ewma_error?.toFixed(2) || '-' }}</template>
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
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { QuestionFilled } from '@element-plus/icons-vue'
import { errorScoreApi } from '@/apis/score'
import { cityOptions, fieldOptionsShort1, sourceOptions } from '@/constants/weatherOptions'

// -------------------- 全局筛选状态 --------------------
const globalCity = ref([])
const globalSource = ref([])
const globalDateRange = ref(null)
const globalFields = ref([])          // 多选字段
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
const fieldCheckAll = ref(false)
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
const handleFieldCheckAll = (val) => {
  fieldIndeterminate.value = false
  globalFields.value = val ? fieldOptionsShort1.map(f => f.value) : []
}

// -------------------- 箱线图状态 --------------------
const boxData = ref([])
const boxLoading = ref(false)
const selectedField = ref('')

const fetchBoxData = async () => {
  // 校验：必须选择城市、来源，且至少有一个字段
  if (!globalCity.value.length) { boxData.value = []; return }
  if (!globalSource.value.length) { boxData.value = []; return }
  if (!selectedField.value) { boxData.value = []; return }
  boxLoading.value = true
  try {
    const res = await errorScoreApi.getWeatherDaysErrorsStatistics(
      globalSource.value,
      selectedField.value,
      globalDateRange.value,
      globalCity.value
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

// 箱线图配置
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
      // 如果全局选择了字段，则只保留选中字段的数据
      if (globalFields.value.length) {
        rawData = rawData.map(item => ({
          source: item.source,
          data: Object.fromEntries(
            Object.entries(item.data).filter(([field]) => globalFields.value.includes(field))
          )
        })).filter(item => Object.keys(item.data).length > 0)
      }
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

const fieldLabelMap = {
  humidity: '湿度',
  pressure: '气压',
  precip: '降雨量',
  tempMax: '最高温',
  tempMin: '最低温',
  temp: '温度',
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

// -------------------- 表格独立状态（分页、排序） --------------------
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
      error_type: globalFields.value,        // 支持多选字段
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

// 导出CSV
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

// 全局查询（重置表格分页和排序）
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
    // 重置表格分页和排序
    currentPage.value = 1
    sortField.value = ''
    sortOrder.value = ''
    // 并行请求三个图表数据
    await Promise.all([
      fetchBoxData(),
      fetchHeatData(),
      fetchTableData()
    ])
  } finally {
    globalQueryLoading.value = false
  }
}

// 重置所有筛选条件
const resetGlobalFilters = () => {
  globalCity.value = []
  globalSource.value = []
  globalDateRange.value = null
  globalFields.value = []
  // 清空所有图表数据
  boxData.value = []
  heatData.value = []
  tableData.value = []
  total.value = 0
  currentPage.value = 1
  sortField.value = ''
  sortOrder.value = ''
  ElMessage.info('已重置所有筛选条件')
}

// 监听筛选条件变化自动查询（可选，也可完全依赖手动查询按钮）
// 这里实现防抖自动查询，提升体验
let autoQueryTimer = null
watch([globalCity, globalSource, globalDateRange, globalFields, selectedField], () => {
  if (autoQueryTimer) clearTimeout(autoQueryTimer)
  autoQueryTimer = setTimeout(() => {
    // 只有城市和来源都有值时自动查询，避免无效请求
    if (globalCity.value.length && globalSource.value.length) {
      handleGlobalQuery()
    }
  }, 500)
})

const getErrorTag = (val) => val < 2 ? 'success' : val < 5 ? 'warning' : 'danger'
</script>

<style scoped>
.error-analysis {
  padding: 4px;
}

.global-filter-card,
.chart-card,
.table-card {
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
}

.field-hint {
  font-size: 13px;
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
  min-height: 420px;
  margin-top: 12px;
}

:deep(.el-table th) {
  background-color: #f8fafc;
  font-weight: 600;
}
</style>