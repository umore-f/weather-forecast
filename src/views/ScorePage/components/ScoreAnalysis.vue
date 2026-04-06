<template>
  <div class="score-analysis">
    <!-- 1. 摘要卡片（各数据源总分排名） -->
    <el-card class="summary-card-wrapper" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>🏆 数据源综合得分排名</span>
          <el-tooltip content="展示各数据源在所有城市、所有字段上的平均总分及排名" placement="top">
            <el-icon><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
      </template>
      <el-row :gutter="16" class="chart-filter">
        <el-col :span="8">
          <el-select v-model="summaryCity" multiple collapse-tags placeholder="城市（最多3个）" :multiple-limit="3" clearable>
            <el-option v-for="c in cityOptions" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-select v-model="summarySource" multiple collapse-tags placeholder="数据来源（最多2个）" :multiple-limit="3" clearable>
            <el-option v-for="s in sourceOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-date-picker v-model="summaryDateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-col>
      </el-row>
      <el-row style="margin-top: 12px">
        <el-col :span="24">
          <el-button type="primary" size="small" @click="fetchSummaryData" :loading="summaryLoading">查询</el-button>
          <el-button size="small" @click="resetSummaryFilters">重置</el-button>
        </el-col>
      </el-row>
      <div v-loading="summaryLoading" class="summary-cards">
        <el-row :gutter="20" v-if="summaryList.length">
          <el-col :xs="24" :sm="8" v-for="item in summaryList" :key="item.name">
            <div class="summary-card">
              <div class="summary-title">{{ item.name }}</div>
              <div class="summary-score">
                <span class="score-value">{{ item.avgTotalScore.toFixed(1) }}</span>
                <span class="score-unit">分</span>
              </div>
              <div class="summary-rank">
                <span :class="['rank-badge', item.rank === 1 ? 'rank-1' : item.rank === 2 ? 'rank-2' : 'rank-3']">
                  第 {{ item.rank }} 名
                </span>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-empty v-else description="请选择筛选条件并查询" :image-size="80" />
      </div>
    </el-card>

    <!-- 2. 综合得分柱状图 -->
    <el-card class="chart-card" shadow="hover" style="margin-top: 24px">
      <template #header>
        <div class="card-header">
          <span>📊 综合得分对比（柱状图）</span>
          <el-tooltip content="各数据源在筛选条件下的平均总分对比" placement="top">
            <el-icon><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
      </template>
      <el-row :gutter="16" class="chart-filter">
        <el-col :span="8">
          <el-select v-model="barCity" multiple collapse-tags placeholder="城市（最多3个）" :multiple-limit="3" clearable>
            <el-option v-for="c in cityOptions" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-select v-model="barSource" multiple collapse-tags placeholder="数据来源（最多2个）" :multiple-limit="2" clearable>
            <el-option v-for="s in sourceOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-date-picker v-model="barDateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-col>
      </el-row>
      <el-row style="margin-top: 12px">
        <el-col :span="24">
          <el-button type="primary" size="small" @click="fetchBarData" :loading="barLoading">查询</el-button>
          <el-button size="small" @click="resetBarFilters">重置</el-button>
        </el-col>
      </el-row>
      <div class="chart-container" v-loading="barLoading">
        <EChartsWrapper v-if="barOptions.series" :options="barOptions" height="400px" :auto-resize="true" />
        <el-empty v-else description="请选择筛选条件并点击查询" :image-size="80" />
      </div>
    </el-card>

    <!-- 3. 分字段得分雷达图（需选择数据源） -->
    <el-card class="chart-card" shadow="hover" style="margin-top: 24px">
      <template #header>
        <div class="card-header">
          <span>📡 分字段得分雷达图</span>
          <el-tooltip content="展示某一数据源在各天气字段上的得分分布，需先选择数据源" placement="top">
            <el-icon><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
      </template>
      <el-row :gutter="16" class="chart-filter">
        <el-col :span="6">
          <el-select v-model="radarCity" multiple collapse-tags placeholder="城市（最多3个）" :multiple-limit="3" clearable>
            <el-option v-for="c in cityOptions" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="radarSource" placeholder="数据来源（单选）" clearable>
            <el-option v-for="s in sourceOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-date-picker v-model="radarDateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-col>
        <el-col :span="6">
          <el-button type="primary" size="small" @click="fetchRadarData" :loading="radarLoading">查询</el-button>
          <el-button size="small" @click="resetRadarFilters">重置</el-button>
        </el-col>
      </el-row>
      <div class="chart-container" v-loading="radarLoading">
        <EChartsWrapper v-if="radarOptions.series" :options="radarOptions" height="400px" :auto-resize="true" />
        <el-empty v-else description="请选择筛选条件并点击查询" :image-size="80" />
      </div>
    </el-card>

    <!-- 4. 城市得分平行坐标图 -->
    <el-card class="chart-card" shadow="hover" style="margin-top: 24px">
      <template #header>
        <div class="card-header">
          <span>📈 城市得分平行坐标图</span>
          <el-tooltip content="每条线代表一个城市，横轴为数据来源，纵轴为总分，展示城市间得分趋势" placement="top">
            <el-icon><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
      </template>
      <el-row :gutter="16" class="chart-filter">
        <el-col :span="8">
          <el-select v-model="parallelCity" multiple collapse-tags placeholder="城市（最多3个）" :multiple-limit="3" clearable>
            <el-option v-for="c in cityOptions" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-select v-model="parallelSource" multiple collapse-tags placeholder="数据来源（最多2个）" :multiple-limit="2" clearable>
            <el-option v-for="s in sourceOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-date-picker v-model="parallelDateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-col>
      </el-row>
      <el-row style="margin-top: 12px">
        <el-col :span="24">
          <el-button type="primary" size="small" @click="fetchParallelData" :loading="parallelLoading">查询</el-button>
          <el-button size="small" @click="resetParallelFilters">重置</el-button>
        </el-col>
      </el-row>
      <div class="chart-container" v-loading="parallelLoading">
        <EChartsWrapper v-if="parallelOptions.series" :options="parallelOptions" height="450px" :auto-resize="true" />
        <el-empty v-else description="请选择筛选条件并点击查询" :image-size="80" />
      </div>
    </el-card>

    <!-- 5. 得分明细表格 -->
    <el-card class="table-card" shadow="hover" style="margin-top: 24px">
      <template #header>
        <div class="card-header">
          <span>📋 得分明细数据</span>
          <el-button size="small" type="primary" @click="exportTableCSV">导出 CSV</el-button>
        </div>
      </template>
      <el-row :gutter="16" class="chart-filter">
        <el-col :span="6">
          <el-select v-model="tableCity" multiple collapse-tags placeholder="城市（最多3个）" :multiple-limit="3" clearable>
            <el-option v-for="c in cityOptions" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="tableSource" multiple collapse-tags placeholder="数据来源（最多2个）" :multiple-limit="2" clearable>
            <el-option v-for="s in sourceOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="tableField" multiple collapse-tags placeholder="字段（可多选）" clearable>
            <el-option v-for="f in fieldOptionsShort" :key="f.value" :label="f.label" :value="f.value" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-date-picker v-model="tableDateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-col>
      </el-row>
      <el-row style="margin-top: 12px">
        <el-col :span="24">
          <el-button type="primary" size="small" @click="fetchTableData" :loading="tableLoading">查询</el-button>
          <el-button size="small" @click="resetTableFilters">重置</el-button>
        </el-col>
      </el-row>
      <el-table :data="tableData" border stripe height="400" v-loading="tableLoading" @sort-change="handleTableSort" style="margin-top: 12px">
        <el-table-column prop="city" label="城市" sortable width="100" />
        <el-table-column prop="source" label="数据来源" sortable width="120" />
        <el-table-column prop="target_date" label="日期" sortable width="120" />
        <el-table-column prop="total_score" label="总分" sortable width="100">
          <template #default="{ row }">
            <el-progress :percentage="row.total_score" :format="() => row.total_score.toFixed(1)" />
          </template>
        </el-table-column>
        <el-table-column prop="temp_max_score" label="最高温" sortable width="100" />
        <el-table-column prop="temp_min_score" label="最低温" sortable width="100" />
        <el-table-column prop="temp_score" label="平均温" sortable width="100" />
        <el-table-column prop="humidity_score" label="湿度" sortable width="100" />
        <el-table-column prop="precip_score" label="降水" sortable width="100" />
        <el-table-column prop="pressure_score" label="气压" sortable width="100" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { QuestionFilled } from '@element-plus/icons-vue'
import { errorScoreApi } from '@/apis/score'
import { cityOptions, fieldOptionsShort, sourceOptions } from '@/constants/weatherOptions'

// ---------- 1. 摘要卡片 ----------
const summaryCity = ref([])
const summarySource = ref([])
const summaryDateRange = ref(null)
const summaryData = ref([])
const summaryLoading = ref(false)
const summaryList = ref([])

const fetchSummaryData = async () => {
  if (!summaryCity.value.length) { ElMessage.warning('请至少选择一个城市'); return }
  if (!summarySource.value.length) { ElMessage.warning('请至少选择一个数据来源'); return }
  summaryLoading.value = true
  try {
    const range = summaryDateRange.value ? { start: summaryDateRange.value[0], end: summaryDateRange.value[1] } : undefined
    const res = await errorScoreApi.getWeatherDaysScore(summaryCity.value, range, summarySource.value)
    if (res.data?.code === 200) {
      summaryData.value = res.data.data || []
      // 计算各数据源平均总分
      const map = new Map()
      summaryData.value.forEach(item => {
        const src = item.source
        if (!map.has(src)) map.set(src, { sum: 0, count: 0 })
        const stat = map.get(src)
        stat.sum += item.total_score
        stat.count++
      })
      let arr = Array.from(map.entries()).map(([name, stat]) => ({ name, avgTotalScore: stat.sum / stat.count, rank: 0 }))
      arr.sort((a,b) => b.avgTotalScore - a.avgTotalScore)
      arr.forEach((item, idx) => item.rank = idx + 1)
      summaryList.value = arr
    } else {
      summaryList.value = []
      ElMessage.error(res.data?.message || '获取失败')
    }
  } catch (err) {
    console.error(err)
    summaryList.value = []
  } finally {
    summaryLoading.value = false
  }
}
const resetSummaryFilters = () => {
  summaryCity.value = []
  summarySource.value = []
  summaryDateRange.value = null
  summaryList.value = []
}
watch([summaryCity,summarySource,summaryDateRange],()=>{
  fetchSummaryData()
})
// ---------- 2. 综合得分柱状图 ----------
const barCity = ref([])
const barSource = ref([])
const barDateRange = ref(null)
const barData = ref([])
const barLoading = ref(false)

const fetchBarData = async () => {
  if (!barCity.value.length) { ElMessage.warning('请至少选择一个城市'); return }
  if (!barSource.value.length) { ElMessage.warning('请至少选择一个数据来源'); return }
  barLoading.value = true
  try {
    const range = barDateRange.value ? { start: barDateRange.value[0], end: barDateRange.value[1] } : undefined
    const res = await errorScoreApi.getWeatherDaysScore(barCity.value, range, barSource.value)
    if (res.data?.code === 200) {
      barData.value = res.data.data || []
    } else {
      barData.value = []
      ElMessage.error(res.data?.message || '获取失败')
    }
  } catch (err) {
    console.error(err)
    barData.value = []
  } finally {
    barLoading.value = false
  }
}
const resetBarFilters = () => {
  barCity.value = []
  barSource.value = []
  barDateRange.value = null
  barData.value = []
}
watch([barCity,barSource,barDateRange],()=>{
  fetchBarData()
})
const barOptions = computed(() => {
  if (!barData.value.length) return {}
  const map = new Map()
  barData.value.forEach(item => {
    const src = item.source
    if (!map.has(src)) map.set(src, { sum: 0, count: 0 })
    const stat = map.get(src)
    stat.sum += item.total_score
    stat.count++
  })
  const sources = Array.from(map.keys()).sort()
  const scores = sources.map(src => map.get(src).sum / map.get(src).count)
  return {
    tooltip: { trigger: 'axis', formatter: p => `${p[0].name}<br/>平均总分: ${p[0].value.toFixed(1)}` },
    xAxis: { type: 'category', data: sources, name: '数据来源' },
    yAxis: { type: 'value', name: '得分', min: 0, max: 100 },
    series: [{
      type: 'bar',
      data: scores,
      itemStyle: { borderRadius: [8,8,0,0], color: { type: 'linear', x:0,y:0,x2:0,y2:1, colorStops: [{offset:0,color:'#3b82f6'},{offset:1,color:'#1e3a8a'}] } },
      label: { show: true, position: 'top', formatter: p => p.value.toFixed(1) }
    }]
  }
})

// ---------- 3. 雷达图 ----------
const radarCity = ref([])
const radarSource = ref('')
const radarDateRange = ref(null)
const radarData = ref([])
const radarLoading = ref(false)

const fieldMapping = [
  { key: 'temp_max_score', label: '最高温' },
  { key: 'temp_min_score', label: '最低温' },
  { key: 'temp_score', label: '平均温' },
  { key: 'humidity_score', label: '湿度' },
  { key: 'precip_score', label: '降水' },
  { key: 'pressure_score', label: '气压' }
]

const fetchRadarData = async () => {
  if (!radarCity.value.length) { ElMessage.warning('请至少选择一个城市'); return }
  if (!radarSource.value) { ElMessage.warning('请选择一个数据来源'); return }
  radarLoading.value = true
  try {
    const range = radarDateRange.value ? { start: radarDateRange.value[0], end: radarDateRange.value[1] } : undefined
    const res = await errorScoreApi.getWeatherDaysScore(radarCity.value, range, [radarSource.value])
    if (res.data?.code === 200) {
      radarData.value = res.data.data || []
    } else {
      radarData.value = []
      ElMessage.error(res.data?.message || '获取失败')
    }
  } catch (err) {
    console.error(err)
    radarData.value = []
  } finally {
    radarLoading.value = false
  }
}
const resetRadarFilters = () => {
  radarCity.value = []
  radarSource.value = ''
  radarDateRange.value = null
  radarData.value = []
}
watch([radarCity,radarSource,radarDateRange],()=>{
  fetchRadarData()
})
const radarOptions = computed(() => {
  if (!radarData.value.length) return {}
  const sums = fieldMapping.map(() => ({ sum: 0, count: 0 }))
  radarData.value.forEach(item => {
    fieldMapping.forEach((f, idx) => {
      sums[idx].sum += item[f.key] || 0
      sums[idx].count++
    })
  })
  const indicator = fieldMapping.map(f => ({ name: f.label, max: 100 }))
  const data = [{ value: sums.map(s => s.sum / s.count), name: radarSource.value }]
  return {
    radar: { indicator, shape: 'circle', radius: '65%' },
    series: [{
      type: 'radar',
      data,
      areaStyle: { color: 'rgba(59,130,246,0.2)' },
      lineStyle: { color: '#3b82f6', width: 2 },
      itemStyle: { color: '#1e3a8a' }
    }]
  }
})

// ---------- 4. 平行坐标图 ----------
const parallelCity = ref([])
const parallelSource = ref([])
const parallelDateRange = ref(null)
const parallelDataRaw = ref([])
const parallelLoading = ref(false)

const fetchParallelData = async () => {
  if (!parallelCity.value.length) { ElMessage.warning('请至少选择一个城市'); return }
  if (!parallelSource.value.length) { ElMessage.warning('请至少选择一个数据来源'); return }
  parallelLoading.value = true
  try {
    const range = parallelDateRange.value ? { start: parallelDateRange.value[0], end: parallelDateRange.value[1] } : undefined
    const res = await errorScoreApi.getWeatherDaysScore(parallelCity.value, range, parallelSource.value)
    if (res.data?.code === 200) {
      parallelDataRaw.value = res.data.data || []
    } else {
      parallelDataRaw.value = []
      ElMessage.error(res.data?.message || '获取失败')
    }
  } catch (err) {
    console.error(err)
    parallelDataRaw.value = []
  } finally {
    parallelLoading.value = false
  }
}
const resetParallelFilters = () => {
  parallelCity.value = []
  parallelSource.value = []
  parallelDateRange.value = null
  parallelDataRaw.value = []
}
watch([parallelCity,parallelSource,parallelDateRange],()=>{
  fetchParallelData()
})
const parallelOptions = computed(() => {
  if (!parallelDataRaw.value.length) return {}
  // 获取数据源列表（按选中顺序）
  const sources = parallelSource.value
  if (sources.length < 2) return {} // 平行坐标至少需要2个维度
  // 按城市聚合平均总分
  const cityMap = new Map()
  parallelDataRaw.value.forEach(item => {
    const city = item.city
    const src = item.source
    const score = item.total_score
    if (!cityMap.has(city)) cityMap.set(city, new Map())
    const srcMap = cityMap.get(city)
    if (!srcMap.has(src)) srcMap.set(src, [])
    srcMap.get(src).push(score)
  })
  const data = []
  for (const [city, srcMap] of cityMap.entries()) {
    const row = { city }
    let valid = true
    for (const src of sources) {
      const scores = srcMap.get(src) || []
      const avg = scores.length ? scores.reduce((a,b)=>a+b,0)/scores.length : null
      row[src] = avg
      if (avg === null) valid = false
    }
    if (valid) data.push(row)
  }
  if (!data.length) return {}
  return {
    tooltip: { trigger: 'item', formatter: p => `<strong>${p.data.city}</strong><br/>${p.value.map((v,i) => `${sources[i]}: ${v.toFixed(1)}`).join('<br/>')}` },
    parallelAxis: sources.map(dim => ({ dim, name: dim, min: 0, max: 100, nameLocation: 'middle', nameGap: 50 })),
    parallel: { left: '5%', right: '13%', top: '10%', bottom: '10%' },
    series: [{
      type: 'parallel',
      lineStyle: { width: 1.5, opacity: 0.6, color: '#3b82f6' },
      data: data.map(item => ({ value: sources.map(src => item[src]), city: item.city }))
    }]
  }
})

// ---------- 5. 表格 ----------
const tableCity = ref([])
const tableSource = ref([])
const tableField = ref([])
const tableDateRange = ref(null)
const tableData = ref([])
const tableLoading = ref(false)
const tableSort = ref({ prop: 'target_date', order: 'descending' })

const fetchTableData = async () => {
  if (!tableCity.value.length) { ElMessage.warning('请至少选择一个城市'); return }
  if (!tableSource.value.length) { ElMessage.warning('请至少选择一个数据来源'); return }
  tableLoading.value = true
  try {
    const range = tableDateRange.value ? { start: tableDateRange.value[0], end: tableDateRange.value[1] } : undefined
    const res = await errorScoreApi.getWeatherDaysScore(tableCity.value, range, tableSource.value)
    if (res.data?.code === 200) {
      let raw = res.data.data || []
      if (tableField.value.length) {
        // 注意：表格中需要展示各字段得分，无法按字段过滤记录，只能前端隐藏？实际不应过滤记录，仅做提示
        // 这里不做过滤，因为每行包含所有字段
      }
      tableData.value = raw
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
const resetTableFilters = () => {
  tableCity.value = []
  tableSource.value = []
  tableField.value = []
  tableDateRange.value = null
  tableData.value = []
}
watch([tableCity,tableSource,tableField,tableDateRange],()=>{
  fetchTableData()
})
const handleTableSort = ({ prop, order }) => {
  tableSort.value = { prop, order }
  if (prop && order) {
    tableData.value = [...tableData.value].sort((a, b) => {
      const aVal = a[prop]
      const bVal = b[prop]
      return order === 'ascending' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1)
    })
  }
}
const exportTableCSV = () => {
  const headers = ['城市', '数据来源', '日期', '总分', '最高温', '最低温', '平均温', '湿度', '降水', '气压']
  const rows = tableData.value.map(item => [
    item.city, item.source, item.target_date, item.total_score,
    item.temp_max_score, item.temp_min_score, item.temp_score,
    item.humidity_score, item.precip_score, item.pressure_score
  ])
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'score_table.csv'
  link.click()
  URL.revokeObjectURL(link.href)
}
</script>

<style scoped>
.score-analysis { padding: 4px; }
.summary-card-wrapper, .chart-card, .table-card { border-radius: 16px; margin-bottom: 0; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; font-size: 16px; color: #1e293b; margin-bottom: 12px; }
.chart-filter { margin-bottom: 8px; }
.chart-container { min-height: 420px; }
.summary-cards { margin-top: 16px; }
.summary-card { background: #f8fafc; border-radius: 20px; padding: 20px; text-align: center; transition: transform 0.2s; }
.summary-card:hover { transform: translateY(-4px); background: #ffffff; box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
.summary-title { font-size: 16px; color: #64748b; margin-bottom: 12px; }
.summary-score .score-value { font-size: 42px; font-weight: 700; color: #1e293b; }
.summary-score .score-unit { font-size: 16px; color: #94a3b8; margin-left: 4px; }
.rank-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.rank-1 { background: #fef3c7; color: #d97706; }
.rank-2 { background: #e5e7eb; color: #4b5563; }
.rank-3 { background: #fed7aa; color: #b45309; }
:deep(.el-table th) { background-color: #f8fafc; font-weight: 600; }
</style>
