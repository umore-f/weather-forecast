<!-- src/components/ScoreAnalysis.vue -->
<template>
  <div class="score-analysis">
    <!-- 顶部摘要卡片 -->
    <el-row :gutter="20" class="summary-row">
      <el-col :xs="24" :sm="8" v-for="source in sourceSummary" :key="source.name">
        <el-card shadow="hover" class="summary-card" :body-style="{ padding: '20px' }">
          <div class="summary-title">{{ source.name }}</div>
          <div class="summary-score">
            <span class="score-value">{{ source.avgTotalScore.toFixed(1) }}</span>
            <span class="score-unit">分</span>
          </div>
          <div class="summary-rank">
            <span :class="['rank-badge', source.rank === 1 ? 'rank-1' : source.rank === 2 ? 'rank-2' : 'rank-3']">
              第 {{ source.rank }} 名
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>🏆 综合得分对比（总分）</span>
              <el-tooltip content="各数据源在所有城市、所有字段上的平均总分" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <EChartsWrapper
            v-if="totalScoreData.length"
            :options="totalScoreOptions"
            :loading="loading"
            height="400px"
            :auto-resize="true"
          />
          <el-empty v-else description="暂无得分数据，请调整筛选条件" />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>📡 分字段得分雷达图</span>
              <el-tooltip content="展示各数据源在不同天气字段上的得分表现，越外围得分越高" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div class="radar-selector">
            <el-radio-group v-model="selectedRadarSource" size="small">
              <el-radio-button v-for="source in radarSourceOptions" :key="source" :label="source">
                {{ source }}
              </el-radio-button>
            </el-radio-group>
          </div>
          <EChartsWrapper
            v-if="radarData.series.length"
            :options="radarOptions"
            :loading="loading"
            height="380px"
            :auto-resize="true"
          />
          <el-empty v-else description="暂无得分数据" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>📈 城市得分平行坐标图</span>
              <el-tooltip content="每条线代表一个城市，横轴为数据来源，纵轴为总分，线条越靠上得分越高" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <EChartsWrapper
            v-if="parallelData.cities.length"
            :options="parallelOptions"
            :loading="loading"
            height="450px"
            :auto-resize="true"
          />
          <el-empty v-else description="暂无得分数据" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 得分明细表格 -->
    <el-card class="table-card" shadow="hover" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>📋 得分明细数据</span>
          <el-button size="small" type="primary" @click="exportCSV">导出 CSV</el-button>
        </div>
      </template>
      <el-table
        :data="filteredTableData"
        border
        stripe
        height="400"
        v-loading="loading"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="city" label="城市" sortable width="100" />
        <el-table-column prop="source" label="数据来源" sortable width="120" />
        <el-table-column prop="target_date" label="日期" sortable width="120" />
        <el-table-column prop="total_score" label="总分" sortable width="100">
          <template #default="{ row }">
            <el-progress :percentage="row.total_score" :format="() => row.total_score.toFixed(1)" />
          </template>
        </el-table-column>
        <el-table-column prop="temp_max_score" label="最高温得分" sortable width="110" />
        <el-table-column prop="temp_min_score" label="最低温得分" sortable width="110" />
        <el-table-column prop="temp_score" label="平均温得分" sortable width="110" />
        <el-table-column prop="humidity_score" label="湿度得分" sortable width="100" />
        <el-table-column prop="precip_score" label="降水得分" sortable width="100" />
        <el-table-column prop="pressure_score" label="气压得分" sortable width="100" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'

const props = defineProps({
  rawScoreData: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// 字段映射（用于雷达图维度）
const fieldMapping = [
  { key: 'temp_max_score', label: '最高温' },
  { key: 'temp_min_score', label: '最低温' },
  { key: 'temp_score', label: '平均温' },
  { key: 'humidity_score', label: '湿度' },
  { key: 'precip_score', label: '降水' },
  { key: 'pressure_score', label: '气压' }
]

// 排序状态
const sortState = ref({ prop: 'target_date', order: 'descending' })

// 雷达图当前选中的数据源
const selectedRadarSource = ref(null)

// 获取所有数据源列表
const sourceList = computed(() => {
  const sources = new Set()
  props.rawScoreData.forEach(item => sources.add(item.source))
  return Array.from(sources).sort()
})

// 雷达图数据源选项（默认选中第一个）
const radarSourceOptions = computed(() => sourceList.value)
if (radarSourceOptions.value.length && !selectedRadarSource.value) {
  selectedRadarSource.value = radarSourceOptions.value[0]
}

// 计算各数据源的平均总分（摘要卡片）
const sourceSummary = computed(() => {
  const map = new Map()
  props.rawScoreData.forEach(item => {
    const source = item.source
    if (!map.has(source)) map.set(source, { sum: 0, count: 0 })
    const stat = map.get(source)
    stat.sum += item.total_score
    stat.count++
  })
  let summary = Array.from(map.entries()).map(([name, stat]) => ({
    name,
    avgTotalScore: stat.sum / stat.count,
    rank: 0
  }))
  summary.sort((a, b) => b.avgTotalScore - a.avgTotalScore)
  summary.forEach((item, idx) => { item.rank = idx + 1 })
  return summary
})

// 综合得分柱状图数据
const totalScoreData = computed(() => {
  return sourceSummary.value.map(s => ({
    name: s.name,
    score: s.avgTotalScore
  }))
})

// 柱状图配置
const totalScoreOptions = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: (params) => `${params[0].name}<br/>平均总分: ${params[0].value.toFixed(1)}`
  },
  xAxis: {
    type: 'category',
    data: totalScoreData.value.map(d => d.name),
    name: '数据来源'
  },
  yAxis: {
    type: 'value',
    name: '得分',
    min: 0,
    max: 100
  },
  series: [{
    name: '平均总分',
    type: 'bar',
    data: totalScoreData.value.map(d => d.score),
    itemStyle: {
      borderRadius: [8, 8, 0, 0],
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [{ offset: 0, color: '#3b82f6' }, { offset: 1, color: '#1e3a8a' }]
      }
    },
    label: {
      show: true,
      position: 'top',
      formatter: (params) => params.value.toFixed(1)
    }
  }]
}))

// 雷达图数据（根据选中的数据源）
const radarData = computed(() => {
  if (!selectedRadarSource.value) return { series: [] }
  const source = selectedRadarSource.value
  // 聚合该数据源下所有记录的字段得分平均值
  const fieldSum = {}
  let count = 0
  props.rawScoreData.forEach(item => {
    if (item.source !== source) return
    count++
    fieldMapping.forEach(field => {
      if (!fieldSum[field.key]) fieldSum[field.key] = 0
      fieldSum[field.key] += item[field.key] || 0
    })
  })
  if (count === 0) return { series: [] }
  const seriesData = fieldMapping.map(field => ({
    name: field.label,
    value: fieldSum[field.key] / count
  }))
  return { series: seriesData }
})

// 雷达图配置
const radarOptions = computed(() => {
  if (!radarData.value.series.length) return {}
  return {
    tooltip: {},
    radar: {
      indicator: fieldMapping.map(f => ({ name: f.label, max: 100 })),
      shape: 'circle',
      center: ['50%', '50%'],
      radius: '65%',
      name: { textStyle: { fontSize: 12, fontWeight: 'bold' } }
    },
    series: [{
      type: 'radar',
      data: [{
        value: radarData.value.series.map(s => s.value),
        name: selectedRadarSource.value,
        areaStyle: { color: 'rgba(59,130,246,0.2)' },
        lineStyle: { color: '#3b82f6', width: 2 },
        itemStyle: { color: '#1e3a8a' }
      }]
    }]
  }
})

// 平行坐标图数据：每个城市在不同数据源下的总分
const parallelData = computed(() => {
  const cityMap = new Map() // city -> { source -> total_score }
  props.rawScoreData.forEach(item => {
    const city = item.city
    const source = item.source
    const score = item.total_score
    if (!cityMap.has(city)) cityMap.set(city, new Map())
    const sourceMap = cityMap.get(city)
    if (!sourceMap.has(source)) sourceMap.set(source, [])
    sourceMap.get(source).push(score)
  })
  // 计算每个城市每个数据源的平均总分
  const cities = []
  const dimensions = sourceList.value
  const data = []
  for (const [city, sourceMap] of cityMap.entries()) {
    const row = { city }
    dimensions.forEach(source => {
      const scores = sourceMap.get(source) || []
      const avg = scores.length ? scores.reduce((a,b)=>a+b,0)/scores.length : null
      row[source] = avg
    })
    // 只有所有数据源都有得分才加入（或根据需求调整）
    if (dimensions.every(d => row[d] !== null)) {
      cities.push(city)
      data.push(row)
    }
  }
  return { cities, dimensions, data }
})

// 平行坐标图配置
const parallelOptions = computed(() => {
  if (!parallelData.value.data.length) return {}
  const { dimensions, data } = parallelData.value
  return {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const city = params.data.city
        let html = `<strong>${city}</strong><br/>`
        dimensions.forEach(dim => {
          html += `${dim}: ${params.data[dim].toFixed(1)}<br/>`
        })
        return html
      }
    },
    parallelAxis: dimensions.map(dim => ({
      dim: dim,
      name: dim,
      min: 0,
      max: 100,
      nameLocation: 'middle',
      nameGap: 50
    })),
    parallel: {
      left: '5%',
      right: '13%',
      top: '10%',
      bottom: '10%',
      parallelAxisDefault: { axisLabel: { fontSize: 10 } }
    },
    series: [{
      type: 'parallel',
      lineStyle: {
        width: 1.5,
        opacity: 0.6,
        color: '#3b82f6'
      },
      data: data.map(item => {
        const values = dimensions.map(dim => item[dim])
        return { value: values, city: item.city }
      })
    }]
  }
})

// 表格排序
const handleSortChange = ({ prop, order }) => {
  sortState.value = { prop, order }
}

// 表格数据（支持排序）
const filteredTableData = computed(() => {
  let data = [...props.rawScoreData]
  if (sortState.value.prop && sortState.value.order) {
    data.sort((a, b) => {
      let aVal = a[sortState.value.prop]
      let bVal = b[sortState.value.prop]
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
  const headers = ['城市', '数据来源', '日期', '总分', '最高温得分', '最低温得分', '平均温得分', '湿度得分', '降水得分', '气压得分']
  const rows = filteredTableData.value.map(item => [
    item.city,
    item.source,
    item.target_date,
    item.total_score,
    item.temp_max_score,
    item.temp_min_score,
    item.temp_score,
    item.humidity_score,
    item.precip_score,
    item.pressure_score
  ])
  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.href = url
  link.setAttribute('download', 'score_data.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.score-analysis {
  padding: 4px;
}
.summary-row {
  margin-bottom: 24px;
}
.summary-card {
  border-radius: 20px;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}
.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
}
.summary-title {
  font-size: 16px;
  color: #64748b;
  margin-bottom: 12px;
}
.summary-score .score-value {
  font-size: 42px;
  font-weight: 700;
  color: #1e293b;
}
.summary-score .score-unit {
  font-size: 16px;
  color: #94a3b8;
  margin-left: 4px;
}
.summary-rank {
  margin-top: 12px;
}
.rank-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.rank-1 {
  background: #fef3c7;
  color: #d97706;
}
.rank-2 {
  background: #e5e7eb;
  color: #4b5563;
}
.rank-3 {
  background: #fed7aa;
  color: #b45309;
}
.chart-card {
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
.radar-selector {
  margin-bottom: 16px;
  text-align: center;
}
.table-card {
  border-radius: 16px;
}
:deep(.el-table th) {
  background-color: #f8fafc;
  font-weight: 600;
}
:deep(.el-progress-bar__outer) {
  background-color: #e2e8f0;
}
</style>
