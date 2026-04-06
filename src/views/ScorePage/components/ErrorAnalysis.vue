<template>
  <div class="error-analysis">
    <!-- 1. 箱线图卡片（独立筛选） -->
    <el-card class="chart-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>📊 误差分布箱线图（按数据来源）</span>
          <el-tooltip content="展示各数据源在选定字段上的误差分布（最小值、Q1、中位数、Q3、最大值）" placement="top">
            <el-icon>
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>
      </template>
      <!-- 箱线图独立筛选栏 -->
      <el-row :gutter="16" class="chart-filter">
        <el-col :span="6">
          <el-select v-model="boxCity" multiple collapse-tags placeholder="城市" clearable filterable>
            <template #header>
              <el-checkbox v-model="boxCheckAll" :indeterminate="boxIndeterminate" @change="boxHandleCheckAll">
                全选
              </el-checkbox>
            </template>
            <el-option v-for="c in cityOptions" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="boxSource" multiple collapse-tags placeholder="数据来源（最多2个）" :multiple-limit="3" clearable>
            <el-option v-for="s in sourceOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-date-picker v-model="boxDateRange" type="daterange" range-separator="至" start-placeholder="开始"
            end-placeholder="结束" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-col>
        <el-col :span="6">
          <el-select v-model="boxField" placeholder="字段（单选）" clearable>
            <el-option v-for="f in fieldOptionsShort1" :key="f.value" :label="f.label" :value="f.value" />
          </el-select>
        </el-col>
      </el-row>
      <el-row style="margin-top: 12px">
        <el-col :span="24">
          <el-button type="primary" size="small" @click="fetchBoxData" :loading="boxLoading">查询</el-button>
          <el-button size="small" @click="resetBoxFilters">重置</el-button>
        </el-col>
      </el-row>
      <div class="chart-container" v-loading="boxLoading">
        <EChartsWrapper v-if="boxOptions.series" :options="boxOptions" height="400px" :auto-resize="true" />
        <el-empty v-else description="请选择筛选条件并点击查询" :image-size="80" />
      </div>
    </el-card>

    <!-- 2. 热力图卡片（独立筛选） -->
    <el-card class="chart-card" shadow="hover" style="margin-top: 24px">
      <template #header>
        <div class="card-header">
          <span>🔥 平均误差热力图（数据来源 vs 天气字段）</span>
          <el-tooltip content="颜色越深表示该数据源在该字段上的平均误差越大" placement="top">
            <el-icon>
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>
      </template>
      <!-- 热力图独立筛选栏（无字段选择，因为展示所有字段） -->
      <el-row :gutter="16" class="chart-filter">
        <el-col :span="8">
          <el-select v-model="heatCity" multiple collapse-tags placeholder="城市" clearable>
            <template #header>
              <el-checkbox v-model="heatCheckAll" :indeterminate="heatIndeterminate" @change="heatHandleCheckAll">
                全选
              </el-checkbox>
            </template>
            <el-option v-for="c in cityOptions" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-select v-model="heatSource" multiple collapse-tags placeholder="数据来源（最多3个）" :multiple-limit="3" clearable>
            <el-option v-for="s in sourceOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-date-picker v-model="heatDateRange" type="daterange" range-separator="至" start-placeholder="开始"
            end-placeholder="结束" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-col>
      </el-row>
      <el-row style="margin-top: 12px">
        <el-col :span="24">
          <el-button type="primary" size="small" @click="fetchHeatData" :loading="heatLoading">查询</el-button>
          <el-button size="small" @click="resetHeatFilters">重置</el-button>
        </el-col>
      </el-row>
      <div class="chart-container" v-loading="heatLoading">
        <EChartsWrapper v-if="heatOptions.series" :options="heatOptions" height="400px" :auto-resize="true" />
        <el-empty v-else description="请选择筛选条件并点击查询" :image-size="80" />
      </div>
    </el-card>

    <!-- 3. 误差明细表格卡片（独立筛选） -->
    <el-card class="table-card" shadow="hover" style="margin-top: 24px">
      <template #header>
        <div class="card-header">
          <span>📋 误差明细数据</span>
          <el-button size="small" type="primary" @click="exportTableCSV">导出 CSV</el-button>
        </div>
      </template>
      <!-- 表格独立筛选栏 -->
      <el-row :gutter="16" class="chart-filter">
        <el-col :span="6">
          <el-select v-model="tableCity" multiple collapse-tags placeholder="城市" clearable>
            <template #header>
              <el-checkbox v-model="tableCheckAll" :indeterminate="tableIndeterminate" @change="tableHandleCheckAll">
                全选
              </el-checkbox>
            </template>
            <el-option v-for="c in cityOptions" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="tableSource" multiple collapse-tags placeholder="数据来源" clearable>
            <el-option v-for="s in sourceOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="tableField" multiple collapse-tags placeholder="字段（可多选）" clearable>
            <el-option v-for="f in fieldOptionsShort1" :key="f.value" :label="f.label" :value="f.value" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-date-picker v-model="tableDateRange" type="daterange" range-separator="至" start-placeholder="开始"
            end-placeholder="结束" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-col>
      </el-row>
      <el-row style="margin-top: 12px">
        <el-col :span="24">
          <el-button type="primary" size="small" @click="fetchTableData" :loading="tableLoading">查询</el-button>
          <el-button size="small" @click="resetTableFilters">重置</el-button>
        </el-col>
      </el-row>
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

// -------------------- 箱线图独立状态 --------------------
const boxCity = ref([])
const boxSource = ref([])
const boxDateRange = ref(null)
const boxField = ref('')
const boxData = ref([])
const boxLoading = ref(false)
const boxCheckAll = ref(false)
const boxIndeterminate = ref(false)


watch(boxCity, (val) => {
  if (val.length === 0) {
    boxCheckAll.value = false
    boxIndeterminate.value = false
  } else if (val.length === cityOptions.length) {
    boxCheckAll.value = true
    boxIndeterminate.value = false
  } else {
    boxIndeterminate.value = true
  }
})

const boxHandleCheckAll = (val) => {
  boxIndeterminate.value = false
  if (val) {
    boxCity.value = cityOptions.map((_) => _.value)
  } else {
    boxCity.value = []
  }
}
const fetchBoxData = async () => {
  if (!boxCity.value.length) { ElMessage.warning('请至少选择一个城市'); return }
  if (!boxSource.value.length) { ElMessage.warning('请至少选择一个数据来源'); return }
  if (!boxField.value) { ElMessage.warning('请选择一个字段'); return }
  boxLoading.value = true
  try {
    const res = await errorScoreApi.getWeatherDaysErrorsStatistics(boxSource.value, boxField.value, boxDateRange.value, boxCity.value)

    if (res.data?.code === 200) {
      boxData.value = res.data.data || []
    } else {
      boxData.value = []
      ElMessage.error(res.data?.message || '获取失败')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('请求出错')
    boxData.value = []
  } finally {
    boxLoading.value = false
  }
}

const resetBoxFilters = () => {
  boxCity.value = []
  boxSource.value = []
  boxDateRange.value = null
  boxField.value = ''
  boxData.value = []
}
watch([boxCity, boxSource, boxDateRange, boxField], () => {
  fetchBoxData()
})
// 箱线图配置
const xAxisBoxSource = computed(() => boxData.value.map(item => item.source))
const boxDataSeries = computed(() => boxData.value.map(item => item.data))

const boxOptions = computed(() => {
  if (!boxData.value.length) return {}
  return {
    tooltip: {
      trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (params) => {
        const d = params[0].value
        return `${params[0].name}<br/>最小值: ${d[1].toFixed(2)}<br/>下四分位: ${d[2].toFixed(2)}<br/>中位数: ${d[3].toFixed(2)}<br/>上四分位: ${d[4].toFixed(2)}<br/>最大值: ${d[5].toFixed(2)}`
      }
    },
    xAxis: { type: 'category', data: xAxisBoxSource.value, name: '数据来源', axisLabel: { rotate: 15 } },
    yAxis: { type: 'value', name: '误差值' },
    series: [{ type: 'boxplot', data: boxDataSeries.value, itemStyle: { color: '#3b82f6', borderColor: '#1e40af' }, boxWidth: [30, 50] }]
  }
})

// -------------------- 热力图独立状态 --------------------
const heatCity = ref([])
const heatSource = ref([])
const heatDateRange = ref(null)
const heatData = ref([])
const heatLoading = ref(false)

const heatCheckAll = ref(false)
const heatIndeterminate = ref(false)


watch(heatCity, (val) => {
  if (val.length === 0) {
    heatCheckAll.value = false
    heatIndeterminate.value = false
  } else if (val.length === cityOptions.length) {
    heatCheckAll.value = true
    heatIndeterminate.value = false
  } else {
    heatIndeterminate.value = true
  }
})

const heatHandleCheckAll = (val) => {
  heatIndeterminate.value = false
  if (val) {
    heatCity.value = cityOptions.map((_) => _.value)
  } else {
    heatCity.value = []
  }
}
const fetchHeatData = async () => {
  if (!heatCity.value.length) { ElMessage.warning('请至少选择一个城市'); return }
  if (!heatSource.value.length) { ElMessage.warning('请至少选择一个数据来源'); return }
  heatLoading.value = true
  try {
    const res = await errorScoreApi.getWeatherDaysErrorsAvg({
      source: heatSource.value,
      city: heatCity.value,
      dateRange: heatDateRange.value
    });
    if (res.data?.code === 200) {
      heatData.value = res.data.data || []
    } else {
      heatData.value = []
      ElMessage.error(res.data?.message || '获取失败')
    }
  } catch (err) {
    console.error(err)
    heatData.value = []
  } finally {
    heatLoading.value = false
  }
}

const resetHeatFilters = () => {
  heatCity.value = []
  heatSource.value = []
  heatDateRange.value = null
  heatData.value = []
}

watch([heatCity, heatSource, heatDateRange], () => {
  fetchHeatData()
})

// 字段英文名到中文标签的映射（根据实际需要定义）
const fieldLabelMap = {
  humidity: '湿度',
  pressure: '气压',
  precip: '降雨量',
  tempMax: '最高温',
  tempMin: '最高温',
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

  // 构建热力图数据 [xIndex, yIndex, value]
  const data = []
  fields.forEach((field, xIdx) => {
    sources.forEach((source, yIdx) => {
      const key = `${source}|${field}`
      const value = valueMap.get(key) ?? 0
      data.push([xIdx, yIdx, value])
    })
  })

  // 计算颜色最大值（避免全为0时颜色异常）
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

// -------------------- 表格独立状态 --------------------
const tableCity = ref([])
const tableSource = ref([])
const tableField = ref([])
const tableDateRange = ref(null)
const tableData = ref([])
const tableLoading = ref(false)
// const tableSort = ref({ prop: 'target_date', order: 'descending' })
const currentPage = ref(1)         // 当前页码
const pageSize = ref(20)            // 每页条数
const total = ref(0)                // 总记录数
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
const tableCheckAll = ref(false)
const tableIndeterminate = ref(false)
watch(tableCity, (val) => {
  if (val.length === 0) {
    tableCheckAll.value = false
    tableIndeterminate.value = false
  } else if (val.length === cityOptions.length) {
    tableCheckAll.value = true
    tableIndeterminate.value = false
  } else {
    tableIndeterminate.value = true
  }
})

const tableHandleCheckAll = (val) => {
  tableIndeterminate.value = false
  if (val) {
    tableCity.value = cityOptions.map((_) => _.value)
  } else {
    tableCity.value = []
  }
}
const fetchTableData = async () => {
  if (!tableCity.value.length) { ElMessage.warning('请至少选择一个城市'); return }
  if (!tableSource.value.length) { ElMessage.warning('请至少选择一个数据来源'); return }
  tableLoading.value = true
  try {
    const res = await errorScoreApi.getWeatherDaysErrorsPaging({
      source: tableSource.value,
      city: tableCity.value,
      error_type: tableField.value,
      dateRange: tableDateRange.value,
      page: currentPage.value,
      pageSize: pageSize.value,
      sortField: sortField.value,
      sortOrder: sortOrder.value
    });
    if (res.data?.code === 200) {
      tableData.value = res.data.data.list
      total.value = res.data.data.pagination.total
      currentPage.value = res.data.data.pagination.page
      pageSize.value = res.data.data.pagination.pageSize
    } else {
      tableData.value = []
      ElMessage.error(res.data?.message || '获取失败')
    }
  } catch (err) {
    console.error(err)
    tableData.value = []
  } finally {
    tableLoading.value = false
  }
}
const handleTableSort = ({ prop, order }) => {
  // prop 是列属性名，order 为 'ascending' 或 'descending' 或 null
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
  currentPage.value = 1  // 排序后重置到第一页
  fetchTableData()
}
const resetTableFilters = () => {
  tableCity.value = []
  tableSource.value = []
  tableField.value = []
  tableDateRange.value = null
  tableData.value = []

}
watch([tableCity, tableSource, tableDateRange, tableField], () => {
  sortField.value = ''
  sortOrder.value = ''
  currentPage.value = 1
  fetchTableData()

})
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
  fetchTableData()
}

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage

  fetchTableData()
}
const getErrorTag = (val) => val < 2 ? 'success' : val < 5 ? 'warning' : 'danger'

const exportTableCSV = () => {
  const headers = ['城市', '数据来源', '日期', '天气字段', '误差值', 'EWMA误差']
  const rows = tableData.value.map(item => [item.city, item.source, item.target_date, item.error_type, item.error_value, item.ewma_error || ''])
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'error_table.csv'
  link.click()
  URL.revokeObjectURL(link.href)
}
</script>

<style scoped>
.error-analysis {
  padding: 4px;
}

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
  margin-bottom: 12px;
}

.chart-filter {
  margin-bottom: 8px;
}

.chart-container {
  min-height: 420px;
}

:deep(.el-table th) {
  background-color: #f8fafc;
  font-weight: 600;
}
</style>
