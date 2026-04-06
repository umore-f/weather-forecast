<!-- src/components/ErrorAnalysis.vue -->
<template>
  <div class="error-analysis">
    <!-- 图表区域 -->
     <!-- <pre>{{ heatmapData }}</pre> -->
    <el-row :gutter="20">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>📊 误差分布箱线图（按数据来源）</span>
              <el-tooltip content="展示各数据源误差值的最小值、Q1、中位数、Q3、最大值" placement="top">
                <el-icon>
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <EChartsWrapper v-if="boxplotData.series.length" :options="boxplotOptions" :loading="loading" height="450px"
            :auto-resize="true" />
          <el-empty v-else description="暂无数据，请调整筛选条件" />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
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
          <EChartsWrapper v-if="heatmapData" :options="heatmapOptions" :loading="loading" height="450px"
            :auto-resize="true" />
          <el-empty v-else description="暂无数据，请调整筛选条件" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 误差明细表格 -->
    <el-card class="table-card" shadow="hover" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>📋 误差明细数据</span>
          <el-button size="small" type="primary" @click="exportCSV">导出 CSV</el-button>
        </div>
      </template>
      <el-table :data="filteredTableData" border stripe height="400" v-loading="loading"
        @sort-change="handleSortChange">
        <el-table-column prop="city" label="城市" sortable width="100" />
        <el-table-column prop="source" label="数据来源" sortable width="120" />
        <el-table-column prop="target_date" label="日期" sortable width="120" />
        <el-table-column prop="error_type" label="天气字段" sortable width="120" />
        <el-table-column prop="error_value" label="误差值" sortable width="100">
          <template #default="{ row }">
            <el-tag :type="getErrorTagType(row.error_value)" size="small">
              {{ row.error_value.toFixed(2) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ewma_error" label="EWMA误差" sortable width="120">
          <template #default="{ row }">
            {{ row.ewma_error?.toFixed(2) || '-' }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'

const props = defineProps({
  rawData: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// 排序状态
const sortState = ref({ prop: 'target_date', order: 'descending' })

// 处理表格排序
const handleSortChange = ({ prop, order }) => {
  sortState.value = { prop, order }
}

// 根据误差值返回标签颜色
const getErrorTagType = (value) => {
  if (value < 2) return 'success'
  if (value < 5) return 'warning'
  return 'danger'
}

// 计算箱线图所需数据：按 source 分组，收集所有 error_value
const boxplotData = computed(() => {
  if (!props.rawData.length) return { sources: [], series: [] }

  const sourceMap = new Map()
  props.rawData.forEach(item => {
    const source = item.source
    const error = item.error_value
    if (!sourceMap.has(source)) sourceMap.set(source, [])
    sourceMap.get(source).push(error)
  })

  const sources = Array.from(sourceMap.keys())
  // 计算每个数据源的统计量（最小值、Q1、中位数、Q3、最大值）
  const series = sources.map(source => {
    const values = sourceMap.get(source).sort((a, b) => a - b)
    const min = values[0]
    const max = values[values.length - 1]
    const q1 = values[Math.floor(values.length * 0.25)]
    const median = values[Math.floor(values.length * 0.5)]
    const q3 = values[Math.floor(values.length * 0.75)]
    return [min, q1, median, q3, max]
  })

  return { sources, series }
})

// 箱线图 ECharts 配置
const boxplotOptions = computed(() => {
  if (!boxplotData.value?.series?.length) return {}
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const item = params[0]
        const data = item.value
        return `${item.name}<br/>
                最小值: ${data[0].toFixed(2)}<br/>
                下四分位数: ${data[1].toFixed(2)}<br/>
                中位数: ${data[2].toFixed(2)}<br/>
                上四分位数: ${data[3].toFixed(2)}<br/>
                最大值: ${data[4].toFixed(2)} `
      }
    },
    xAxis: {
      type: 'category',
      data: boxplotData.value.sources,
      name: '数据来源',
      axisLabel: { rotate: 15 }
    },
    yAxis: {
      type: 'value',
      name: '误差值',
      axisLabel: { formatter: '{value}' }
    },
    series: [{
      name: '误差分布',
      type: 'boxplot',
      data: boxplotData.value.series,
      itemStyle: {
        color: '#3b82f6',
        borderColor: '#1e40af'
      },
      boxWidth: [30, 50]
    }]
  }
})

// 热力图数据：按 source 和 error_type 分组，计算平均误差
const heatmapData = computed(() => {
  if (!props.rawData.length) return []

  const sourceSet = new Set()
  const fieldSet = new Set()
  const valueMap = new Map() // key: source|field

  props.rawData.forEach(item => {
    const source = item.source
    const field = item.error_type
    const error = item.error_value
    sourceSet.add(source)
    fieldSet.add(field)
    const key = `${source}| ${field} `
    if (!valueMap.has(key)) {
      valueMap.set(key, { sum: 0, count: 0 })
    }
    const stat = valueMap.get(key)
    stat.sum += error
    stat.count++
  })

  const sources = Array.from(sourceSet).sort()
  const fields = Array.from(fieldSet).sort()
  // 构建矩阵数据：ECharts 热力图需要 [xIndex, yIndex, value]
  const data = []
  fields.forEach((field, xIdx) => {
    sources.forEach((source, yIdx) => {
      const key = `${source}| ${field} `
      const stat = valueMap.get(key)
      const avg = stat ? stat.sum / stat.count : 0
      data.push([xIdx, yIdx, avg])
    })
  })

  return { sources, fields, data }
})

// 热力图配置
const heatmapOptions = computed(() => {
  if (!heatmapData.value?.data?.length) return {}
  const { fields, sources, data } = heatmapData.value
  return {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const field = fields[params.data[0]]
        const source = sources[params.data[1]]
        const value = params.data[2]
        return `${source} - ${field} <br/>平均误差: ${value.toFixed(2)}`
      }
    },
    xAxis: {
      type: 'category',
      data: fields,
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
      max: Math.max(...data.map(d => d[2]), 0.1),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: {
        color: ['#ebf5ff', '#3b82f6', '#1e3a8a']
      }
    },
    series: [{
      name: '平均误差',
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

// 表格数据（支持排序）
const filteredTableData = computed(() => {
  let data = [...props.rawData]
  if (sortState.value.prop && sortState.value.order) {
    data.sort((a, b) => {
      const aVal = a[sortState.value.prop]
      const bVal = b[sortState.value.prop]
      if (sortState.value.order === 'ascending') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  }
  return data
})

// 导出 CSV
const exportCSV = () => {
  const headers = ['城市', '数据来源', '日期', '天气字段', '误差值', 'EWMA误差']
  const rows = filteredTableData.value.map(item => [
    item.city,
    item.source,
    item.target_date,
    item.error_type,
    item.error_value,
    item.ewma_error || ''
  ])
  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.href = url
  link.setAttribute('download', 'error_data.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.error-analysis {
  padding: 4px;
}

.chart-card {
  margin-bottom: 0;
  border-radius: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  color: #1e293b;
}

.table-card {
  border-radius: 16px;
}

:deep(.el-table th) {
  background-color: #f8fafc;
  font-weight: 600;
}
</style>
