<!-- eslint-disable vue/no-side-effects-in-computed-properties -->
<template>
  <div class="score-analysis">
    <!-- ========== 全局筛选栏（玻璃态） ========== -->
    <el-card class="global-filter-card" shadow="never">
      <el-row :gutter="12">
        <el-col :xs="24" :sm="12" :md="9">
          <el-select v-model="globalFilterCity" multiple collapse-tags placeholder="城市" clearable style="width: 100%">
            <template #header>
              <el-checkbox v-model="cityCheckAll" :indeterminate="cityIndeterminate" @change="handleGlobalCityCheckAll">
                全选
              </el-checkbox>
            </template>
            <el-option v-for="c in cityOptions" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="9">
          <el-select v-model="globalFilterSource" multiple collapse-tags placeholder="数据来源" clearable
            style="width: 100%">
            <el-option v-for="s in sourceOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="date-quick-buttons">
            <el-button size="small" @click="setQuickDate('yesterday')">昨天</el-button>
            <el-button size="small" @click="setQuickDate('7days')">最近7天</el-button>
            <el-button size="small" @click="setQuickDate('30days')">最近30天</el-button>
          </div>
          <el-date-picker v-model="globalFilterDateRange" type="daterange" range-separator="至" start-placeholder="开始"
            end-placeholder="结束" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-col>
      </el-row>
      <el-row style="margin-top: 20px">
        <el-col :span="24" class="filter-actions">
          <el-button type="primary" @click="refreshAllCharts" :loading="globalLoading" class="query-btn">
            <el-icon>
              <Refresh />
            </el-icon> 刷新
          </el-button>
          <el-button @click="resetGlobalFilters" class="reset-btn">重置</el-button>
          <el-tag v-if="globalFilterCity.length && globalFilterSource.length" type="info" effect="plain"
            class="filter-tag">
            <el-icon>
              <Filter />
            </el-icon>
            已选 {{ globalFilterCity.length }} 个城市 · {{ globalFilterSource.length }} 个数据源
          </el-tag>
        </el-col>
      </el-row>
    </el-card>

    <!-- ========== KPI 洞察卡片 ========== -->
    <el-row :gutter="20" class="kpi-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="kpi in kpiList" :key="kpi.title">
        <div class="kpi-card" :class="kpi.class">
          <div class="kpi-icon">{{ kpi.icon }}</div>
          <div class="kpi-content">
            <div class="kpi-title">{{ kpi.title }}</div>
            <div class="kpi-value">{{ kpi.value }}</div>
            <div class="kpi-trend" v-if="kpi.trend">
              <span :class="kpi.trendClass">{{ kpi.trend }}</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- ========== 图表区域：柱状图 + 雷达图（并排） ========== -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span><span class="header-icon">🏆</span> 数据源综合得分排名</span>
              <el-tooltip content="柱顶显示得分及排名，得分最高为第1名" placement="top">
                <el-icon class="help-icon">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <div class="chart-container" v-loading="barLoading">
            <EChartsWrapper v-if="barOptions.series" :options="barOptions" height="400px" :auto-resize="true"
              @click="handleBarClick" />
            <el-empty v-else description="请选择筛选条件并点击查询" :image-size="80" />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span><span class="header-icon">📡</span> 各数据源维度得分对比（雷达图）</span>
              <el-tooltip content="展示不同数据源在六个维度的平均得分" placement="top">
                <el-icon class="help-icon">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <div class="chart-container" v-loading="radarLoading">
            <EChartsWrapper ref="radarChartRef" v-if="radarOptions.series && radarOptions.series.length"
              :options="radarOptions" height="400px" :auto-resize="true" @legendselectchanged="onRadarLegendChange" />
            <el-empty v-else description="暂无数据" :image-size="80" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ========== 折线图（趋势） ========== -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span><span class="header-icon">📈</span> 各数据源综合得分趋势</span>
              <el-tooltip content="展示不同数据源随时间的总分变化趋势" placement="top">
                <el-icon class="help-icon">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <div class="chart-container" v-loading="lineLoading">
            <EChartsWrapper ref="lineChartRef" v-if="lineOptions.series && lineOptions.series.length"
              :options="lineOptions" height="400px" :auto-resize="true" @legendselectchanged="onLineLegendChange" />
            <el-empty v-else description="暂无数据" :image-size="80" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ========== 热力图 + 下钻分析 ========== -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span><span class="header-icon">🔥</span> 城市可信度热力图</span>
              <div class="heatmap-controls">
                <el-select v-model="heatmapField" size="small" style="width: 130px" @change="onHeatmapFieldChange">
                  <el-option label="总分" value="total_score" />
                  <el-option label="最高温" value="temp_max_score" />
                  <el-option label="最低温" value="temp_min_score" />
                  <el-option label="平均温" value="temp_score" />
                  <el-option label="湿度" value="humidity_score" />
                  <el-option label="降水" value="precip_score" />
                  <el-option label="气压" value="pressure_score" />
                </el-select>
                <el-tooltip content="点击热力图格子，显示该城市各数据源的6维得分雷达图及趋势" placement="top">
                  <el-icon class="help-icon">
                    <QuestionFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </div>
          </template>
          <div class="heatmap-wrapper" v-loading="heatmapLoading">
            <EChartsWrapper ref="heatmapChartRef" v-if="heatmapOptions.series" :options="heatmapOptions" height="600px"
              :auto-resize="true" @click="onHeatmapClick" />
            <el-empty v-else description="请选择至少一个城市和一个数据源" :image-size="80" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 下钻区域（雷达图 + 折线图） -->
    <el-row :gutter="20" class="chart-row" v-if="drillCity">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span><span class="header-icon">🎯</span> 城市：{{ drillCity }} · 各数据源维度雷达图</span>
              <el-button size="small" type="primary" link @click="clearDrillCity">清除下钻</el-button>
            </div>
          </template>
          <div class="chart-container" v-loading="singleCityRadarLoading">
            <EChartsWrapper v-if="singleCityRadarOptions.series && singleCityRadarOptions.series.length"
              :options="singleCityRadarOptions" height="400px" :auto-resize="true" />
            <el-empty v-else description="点击热力图格子，查看城市雷达图" :image-size="80" />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span><span class="header-icon">📉</span> 城市：{{ drillCity }} · 各数据源得分趋势</span>
            </div>
          </template>
          <div class="chart-container" v-loading="singleCityLineLoading">
            <EChartsWrapper v-if="singleCityLineOptions.series && singleCityLineOptions.series.length"
              :options="singleCityLineOptions" height="400px" :auto-resize="true" />
            <el-empty v-else description="暂无趋势数据" :image-size="80" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ========== 平行坐标图 ========== -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span><span class="header-icon">📊</span> 平行坐标图（按城市分组）</span>
              <el-tooltip content="每个城市的多条线代表不同数据源+日期的得分，线越多对比越丰富" placement="top">
                <el-icon class="help-icon">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <div class="chart-container" v-loading="parallelLoading">
            <EChartsWrapper v-if="parallelOptions.series && parallelOptions.series.length" :options="parallelOptions"
              height="550px" :auto-resize="true" />
            <el-empty v-else description="请选择筛选条件并点击查询" :image-size="80" />
          </div>
          <el-tag v-if="totalLines" class="line-count-tag">总线条数: {{ totalLines }}</el-tag>
        </el-card>
      </el-col>
    </el-row>

    <!-- ========== 得分明细表格 ========== -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card class="table-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span><span class="header-icon">📋</span> 得分明细数据</span>
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
            <el-table-column prop="total_score" label="总分" sortable="custom" width="100">
              <template #default="{ row }">
                <el-progress :percentage="row.total_score" :format="() => row.total_score.toFixed(1)"
                  :color="progressColor" />
              </template>
            </el-table-column>
            <el-table-column prop="temp_max_score" label="最高温" sortable="custom" width="100" />
            <el-table-column prop="temp_min_score" label="最低温" sortable="custom" width="100" />
            <el-table-column prop="temp_score" label="平均温" sortable="custom" width="100" />
            <el-table-column prop="humidity_score" label="湿度" sortable="custom" width="100" />
            <el-table-column prop="precip_score" label="降水" sortable="custom" width="100" />
            <el-table-column prop="pressure_score" label="气压" sortable="custom" width="100" />
          </el-table>

          <el-config-provider :locale="customPaginationLocale">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange" @current-change="handleCurrentChange"
              style="margin-top: 16px; justify-content: flex-end;" />
          </el-config-provider>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { QuestionFilled, Filter, Download, Refresh } from '@element-plus/icons-vue'
import { errorScoreApi } from '@/apis/score'
import { cityOptions, sourceOptions } from '@/constants/weatherOptions'
import dayjs from 'dayjs'
import { useUserPreferences } from '@/composables/useUserPreferences'
const { defaultCities, defaultSources, defaultDateStart, defaultDateEnd, loaded } = useUserPreferences()

// 分页国际化
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

// ===================== 全局筛选 =====================
const globalFilterCity = ref([])
const globalFilterSource = ref([])
const globalFilterDateRange = ref(null)
const globalLoading = ref(false)

// 城市全选逻辑
const cityCheckAll = ref(false)
const cityIndeterminate = ref(false)
watch(globalFilterCity, (val) => {
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
const handleGlobalCityCheckAll = (val) => {
  cityIndeterminate.value = false
  globalFilterCity.value = val ? cityOptions.map(c => c.value) : []
}

const setQuickDate = (type) => {
  const today = dayjs()
  let start, end
  switch (type) {
    case 'yesterday':
      start = today.subtract(1, 'day').format('YYYY-MM-DD')
      end = start
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
  globalFilterDateRange.value = [start, end]
  ElMessage.success('时间范围已切换')
}

// ===================== KPI 计算 =====================
const kpiList = ref([
  { title: '整体平均分', value: '--', icon: '📊', class: 'kpi-primary', trend: null },
  { title: '最高分数据源', value: '--', icon: '🏅', class: 'kpi-success', trend: null },
  { title: '最优城市', value: '--', icon: '🌆', class: 'kpi-warning', trend: null },
  { title: '数据覆盖天数', value: '--', icon: '📅', class: 'kpi-info', trend: null }
])
const updateKPIs = () => {
  if (!barData.value.length) return
  const avgTotal = barData.value.reduce((sum, item) => sum + item.avg_total_score, 0) / barData.value.length
  kpiList.value[0].value = avgTotal.toFixed(1) + ' 分'
  // 最高分数据源
  const sourceScores = new Map()
  barData.value.forEach(item => {
    const src = item.source
    if (!sourceScores.has(src)) sourceScores.set(src, [])
    sourceScores.get(src).push(item.avg_total_score)
  })
  let maxAvg = 0
  let bestSource = ''
  for (let [src, scores] of sourceScores.entries()) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    if (avg > maxAvg) {
      maxAvg = avg
      bestSource = src
    }
  }
  kpiList.value[1].value = `${bestSource} (${maxAvg.toFixed(1)}分)`
  // 最优城市（从热力图数据中取最高平均分城市）
  if (heatmapData.value.length) {
    const cityScores = new Map()
    heatmapData.value.forEach(item => {
      if (!cityScores.has(item.city)) cityScores.set(item.city, [])
      cityScores.get(item.city).push(item.avg_value)
    })
    let bestCity = '', bestCityScore = 0
    for (let [city, scores] of cityScores.entries()) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      if (avg > bestCityScore) {
        bestCityScore = avg
        bestCity = city
      }
    }
    kpiList.value[2].value = `${bestCity} (${bestCityScore.toFixed(1)}分)`
  }
  // 覆盖天数
  if (lineData.value.length) {
    const dates = new Set(lineData.value.map(item => item.target_date))
    kpiList.value[3].value = dates.size + ' 天'
  }
}

// ===================== 柱状图 =====================
const barData = ref([])
const barLoading = ref(false)
const fetchBarData = async () => {
  if (!globalFilterCity.value.length || !globalFilterSource.value.length) return
  barLoading.value = true
  try {
    const res = await errorScoreApi.getWeatherDaysScoreAvg({
      city: globalFilterCity.value,
      dateRange: globalFilterDateRange.value,
      source: globalFilterSource.value
    })
    if (res.data?.code === 200) {
      barData.value = res.data.data || []
      updateKPIs()
    } else {
      barData.value = []
    }
  } catch (err) {
    console.error(err)
    barData.value = []
  } finally {
    barLoading.value = false
  }
}
const barOptions = computed(() => {
  if (!barData.value.length) return {}
  const map = new Map()
  barData.value.forEach(item => {
    const src = item.source
    if (!map.has(src)) map.set(src, { sum: 0, count: 0 })
    const stat = map.get(src)
    stat.sum += item.avg_total_score
    stat.count++
  })
  const sourceStats = Array.from(map.entries()).map(([source, stat]) => ({
    source,
    avgScore: stat.sum / stat.count
  }))
  sourceStats.sort((a, b) => b.avgScore - a.avgScore)
  const sortedSources = sourceStats.map(s => s.source)
  const sortedScores = sourceStats.map(s => s.avgScore)
  const rankMedal = ['🥇', '🥈', '🥉']
  const rankText = ['第1名', '第2名', '第3名']
  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const idx = params[0].dataIndex
        const rank = idx + 1
        const medal = rank <= 3 ? rankMedal[rank - 1] : '📊'
        return `${medal} ${params[0].name}<br/>平均总分: ${params[0].value.toFixed(1)}<br/>排名: 第${rank}名`
      },
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderColor: '#333',
      textStyle: { color: '#fff' }
    },
    grid: { top: 60, left: 60, right: 40, bottom: 30, containLabel: true },
    xAxis: { type: 'category', data: sortedSources, name: '数据来源', axisLabel: { fontSize: 12, fontWeight: 500 }, axisLine: { lineStyle: { color: '#ddd' } } },
    yAxis: { type: 'value', name: '得分', min: 0, max: 100, splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } } },
    series: [{
      type: 'bar',
      data: sortedScores,
      itemStyle: {
        borderRadius: [8, 8, 0, 0],
        color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#5470c6' }, { offset: 1, color: '#3b82f6' }] },
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowBlur: 10
      },
      label: {
        show: true,
        position: 'top',
        formatter: (params) => {
          const rank = params.dataIndex + 1
          const medal = rank <= 3 ? rankMedal[rank - 1] : ''
          const score = params.value.toFixed(1)
          return `${medal} ${score}分\n${rankText[rank - 1] || `第${rank}名`}`
        },
        fontWeight: 'bold',
        color: '#1f2937',
        fontSize: 12,
        lineHeight: 18
      },
      animation: true,
      animationDuration: 1000
    }]
  }
})
const handleBarClick = (params) => {
  if (params.componentType === 'series') {
    globalFilterSource.value = [params.name]
  }
}

// ===================== 雷达图（多数据源） =====================
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
  if (!globalFilterCity.value.length || !globalFilterSource.value.length) return
  radarLoading.value = true
  try {
    const res = await errorScoreApi.getWeatherDaysScoreAvgBySourceAll({
      city: globalFilterCity.value,
      source: globalFilterSource.value,
      dateRange: globalFilterDateRange.value
    })
    if (res.data?.code === 200) radarData.value = res.data.data || []
    else radarData.value = []
  } catch (err) {
    console.error(err)
    radarData.value = []
  } finally {
    radarLoading.value = false
  }
}
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '84,112,198'
}
const radarOptions = computed(() => {
  if (!radarData.value.length) return {}
  const indicators = fieldMapping.map(f => ({ name: f.label, max: 100 }))
  const colorList = ['#5470c6', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452']
  const series = radarData.value.map((item, idx) => ({
    name: item.source,
    type: 'radar',
    data: [{ value: fieldMapping.map(f => item[`avg_${f.key}`] || 0), name: item.source }],
    areaStyle: { color: `rgba(${hexToRgb(colorList[idx % colorList.length])}, 0.2)` },
    lineStyle: { color: colorList[idx % colorList.length], width: 2 },
    itemStyle: { color: colorList[idx % colorList.length] },
    symbol: 'circle',
    symbolSize: 6
  }))
  return {
    radar: { indicator: indicators, shape: 'circle', radius: '65%', name: { textStyle: { fontSize: 12, color: '#4b5563' } }, splitArea: { areaStyle: { color: ['rgba(84,112,198,0.05)', 'rgba(84,112,198,0.02)'] } } },
    legend: { data: radarData.value.map(i => i.source), top: 0, right: 10, textStyle: { color: '#333', fontWeight: 500 } },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const seriesName = params.seriesName
        const values = params.value          // 数组，顺序与 indicators 一致
        if (!values || !fieldMapping) return seriesName

        let result = `${seriesName}<br/>`
        fieldMapping.forEach((field, idx) => {
          const rawVal = values[idx] ?? 0
          const formattedVal = rawVal.toFixed(2)   // 保留两位小数
          result += `${field.label}: ${formattedVal}<br/>`
        })
        return result
      }
    },
    series
  }
})

// ===================== 折线图 =====================
const lineData = ref([])
const lineLoading = ref(false)
const fetchLineData = async () => {
  if (!globalFilterCity.value.length || !globalFilterSource.value.length) return
  lineLoading.value = true
  try {
    const res = await errorScoreApi.getWeatherDaysScoreAvgBySD({
      city: globalFilterCity.value,
      source: globalFilterSource.value,
      dateRange: globalFilterDateRange.value
    })
    if (res.data?.code === 200) lineData.value = res.data.data || []
    else lineData.value = []
  } catch (err) {
    console.error(err)
    lineData.value = []
  } finally {
    lineLoading.value = false
  }
}
const lineOptions = computed(() => {
  if (!lineData.value.length) return {}
  const sourceMap = new Map()
  lineData.value.forEach(item => {
    if (!sourceMap.has(item.source)) sourceMap.set(item.source, [])
    sourceMap.get(item.source).push({ date: item.target_date, score: item.avg_total_score })
  })
  const allDates = [...new Set(lineData.value.map(i => i.target_date))].sort((a, b) => dayjs(a).diff(dayjs(b)))
  const series = []
  const colorList = ['#5470c6', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452']
  let idx = 0
  for (let [source, records] of sourceMap.entries()) {
    records.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))
    const data = allDates.map(date => records.find(r => r.date === date)?.score ?? null)
    series.push({
      name: source,
      type: 'line',
      data,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 3, color: colorList[idx % colorList.length], shadowBlur: 5 },
      areaStyle: { opacity: 0.1, color: colorList[idx % colorList.length] }
    })
    idx++
  }
  return {
    tooltip: {
      trigger: 'axis', formatter: function (params) {
        // params 是一个数组，每个元素对应一个系列（source）
        if (!params || params.length === 0) return ''
        // 第一行显示日期（x轴的值）
        let result = params[0].axisValue + '<br/>'
        params.forEach(p => {
          const value = p.value
          // 将数值格式化为保留两位小数，若为 null 则显示 '-'
          const formattedValue = (value !== null && value !== undefined) ? value.toFixed(2) : '-'
          // p.marker 是系列的颜色标记，p.seriesName 是系列名称
          result += `${p.marker} ${p.seriesName}: ${formattedValue}<br/>`
        })
        return result
      }
    },
    legend: { data: Array.from(sourceMap.keys()), top: 0, right: 10 },
    xAxis: { type: 'category', data: allDates, name: '日期', axisLabel: { rotate: 30, formatter: v => dayjs(v).format('MM-DD') } },
    yAxis: { type: 'value', name: '平均总分', min: 0, max: 100, splitLine: { lineStyle: { type: 'dashed' } } },
    series
  }
})

// 雷达图与折线图联动
const radarChartRef = ref(null)
const lineChartRef = ref(null)
let radarInstance = null
let lineInstance = null
watch(radarChartRef, (val) => { if (val) radarInstance = val.getInstance?.() || val })
watch(lineChartRef, (val) => { if (val) lineInstance = val.getInstance?.() || val })
const onRadarLegendChange = ({ name, selected }) => {
  if (!lineInstance) return
  const action = selected[name] ? 'legendSelect' : 'legendUnSelect'
  lineInstance.dispatchAction({ type: action, name })
}
const onLineLegendChange = ({ name, selected }) => {
  if (!radarInstance) return
  const action = selected[name] ? 'legendSelect' : 'legendUnSelect'
  radarInstance.dispatchAction({ type: action, name })
}

// ===================== 热力图 =====================
const heatmapField = ref('total_score')
const heatmapData = ref([])
const heatmapLoading = ref(false)
const currentHeatmapCities = ref([])
const currentHeatmapSources = ref([])
const heatmapChartRef = ref(null)

const fetchHeatmapData = async () => {
  if (!globalFilterCity.value.length || !globalFilterSource.value.length) {
    heatmapData.value = []
    return
  }
  heatmapLoading.value = true
  try {
    const res = await errorScoreApi.getWeatherDaysScoreByCitySource({
      city: globalFilterCity.value,
      source: globalFilterSource.value,
      field: heatmapField.value,
      dateRange: globalFilterDateRange.value
    })
    if (res.data?.code === 200) heatmapData.value = res.data.data || []
    else heatmapData.value = []
  } catch (err) {
    console.error(err)
    heatmapData.value = []
  } finally {
    heatmapLoading.value = false
  }
}
const heatmapOptions = computed(() => {
  if (!heatmapData.value.length) return {}
  const cities = globalFilterCity.value
  const sources = globalFilterSource.value
  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  currentHeatmapCities.value = cities
  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  currentHeatmapSources.value = sources
  const seriesData = []
  heatmapData.value.forEach(item => {
    const xIdx = sources.indexOf(item.source)
    const yIdx = cities.indexOf(item.city)
    if (xIdx !== -1 && yIdx !== -1) seriesData.push([xIdx, yIdx, item.avg_value])
  })
  return {
    tooltip: { trigger: 'item', formatter: (params) => `${cities[params.data[1]]}<br/>${sources[params.data[0]]}<br/>得分: ${params.data[2].toFixed(1)}` },
    xAxis: { type: 'category', data: sources, name: '数据来源' },
    yAxis: { type: 'category', data: cities, name: '城市' },
    visualMap: { min: 0, max: 100, calculable: true, orient: 'vertical', left: 'left', inRange: { color: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'] } },
    series: [{ type: 'heatmap', data: seriesData, label: { show: true, formatter: p => p.data[2]?.toFixed(0) || '' }, emphasis: { itemStyle: { shadowBlur: 10 } }, itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 1 } }]
  }
})
const onHeatmapFieldChange = () => fetchHeatmapData()

// ===================== 下钻城市雷达图 & 折线图 =====================
const drillCity = ref('')
const singleCityRadarData = ref([])
const singleCityRadarLoading = ref(false)
const singleCityLineData = ref([])
const singleCityLineLoading = ref(false)

const fetchSingleCityRadar = async () => {
  if (!drillCity.value) return
  singleCityRadarLoading.value = true
  try {
    const res = await errorScoreApi.getWeatherDaysScoreSourceAvgByCity({
      city: drillCity.value,
      dateRange: globalFilterDateRange.value
    })
    if (res.data?.code === 200) singleCityRadarData.value = res.data.data || []
    else singleCityRadarData.value = []
  } catch (err) {
    console.error(err)
    singleCityRadarData.value = []
  } finally {
    singleCityRadarLoading.value = false
  }
}
const singleCityRadarOptions = computed(() => {
  if (!singleCityRadarData.value.length) return {}
  const indicators = fieldMapping.map(f => ({ name: f.label, max: 100 }))
  const colorList = ['#5470c6', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452']
  const series = singleCityRadarData.value.map((item, idx) => ({
    name: item.source,
    type: 'radar',
    data: [{ value: fieldMapping.map(f => item[`avg_${f.key}`] || 0), name: item.source }],
    areaStyle: { color: `rgba(${hexToRgb(colorList[idx % colorList.length])}, 0.2)` },
    lineStyle: { color: colorList[idx % colorList.length], width: 2 },
    itemStyle: { color: colorList[idx % colorList.length] }
  }))
  return {
    radar: { indicator: indicators },
    legend: { data: singleCityRadarData.value.map(i => i.source) },
    tooltip: {                      // 添加 tooltip 配置
      trigger: 'item',
      formatter: (params) => {
        const seriesName = params.seriesName
        const values = params.value  // 数组，顺序与 indicators 一致
        if (!values || !fieldMapping) return seriesName
        let result = `${seriesName}<br/>`
        fieldMapping.forEach((field, idx) => {
          const rawVal = values[idx] ?? 0
          const formattedVal = rawVal.toFixed(2)   // 保留两位小数
          result += `${field.label}: ${formattedVal}<br/>`
        })
        return result
      }
    },
    series
  }
})

const fetchSingleCityLine = async () => {
  if (!drillCity.value) return
  singleCityLineLoading.value = true
  try {
    const res = await errorScoreApi.getWeatherDaysScoreCityDetail({
      city: drillCity.value,
      dateRange: globalFilterDateRange.value
    })
    if (res.data?.code === 200) singleCityLineData.value = res.data.data || []
    else singleCityLineData.value = []
  } catch (err) {
    console.error(err)
    singleCityLineData.value = []
  } finally {
    singleCityLineLoading.value = false
  }
}
const singleCityLineOptions = computed(() => {
  if (!singleCityLineData.value.length) return {}
  const sourceMap = new Map()
  singleCityLineData.value.forEach(item => {
    if (!sourceMap.has(item.source)) sourceMap.set(item.source, [])
    sourceMap.get(item.source).push({ date: item.target_date, score: item[heatmapField.value] })
  })
  const allDates = [...new Set(singleCityLineData.value.map(i => i.target_date))].sort((a, b) => dayjs(a).diff(dayjs(b)))
  const series = []
  const colorList = ['#5470c6', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452']
  let idx = 0
  for (let [source, records] of sourceMap.entries()) {
    records.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))
    const data = allDates.map(date => records.find(r => r.date === date)?.score ?? null)
    series.push({ name: source, type: 'line', data, smooth: true, lineStyle: { width: 2, color: colorList[idx % colorList.length] } })
    idx++
  }
  return { tooltip: { trigger: 'axis' }, legend: { data: Array.from(sourceMap.keys()) }, xAxis: { type: 'category', data: allDates, name: '日期' }, yAxis: { type: 'value', name: `${heatmapField.value === 'total_score' ? '总分' : '得分'}`, min: 0, max: 100 }, series }
})

const onHeatmapClick = (params) => {
  if (params && params.data && params.data.length >= 3) {
    const city = currentHeatmapCities.value[params.data[1]]
    if (city) {
      drillCity.value = city
      fetchSingleCityRadar()
      fetchSingleCityLine()
      ElMessage.success(`已下钻至城市：${city}`)
    }
  }
}
const clearDrillCity = () => {
  drillCity.value = ''
  singleCityRadarData.value = []
  singleCityLineData.value = []
}

// ===================== 平行坐标图 =====================
const parallelData = ref([])
const parallelLoading = ref(false)
const dimensions = [
  { key: 'temp_score', label: '平均温', max: 100, min: 0 },
  { key: 'temp_max_score', label: '最高温', max: 100, min: 0 },
  { key: 'temp_min_score', label: '最低温', max: 100, min: 0 },
  { key: 'humidity_score', label: '湿度', max: 100, min: 0 },
  { key: 'precip_score', label: '降水', max: 100, min: 0 },
  { key: 'pressure_score', label: '气压', max: 100, min: 0 },
  { key: 'total_score', label: '总分', max: 100, min: 0 }
]
const fetchParallelData = async () => {
  if (!globalFilterCity.value.length || !globalFilterSource.value.length) return
  parallelLoading.value = true
  try {
    const res = await errorScoreApi.getWeatherDaysScoreDetail({
      city: globalFilterCity.value,
      source: globalFilterSource.value,
      dateRange: globalFilterDateRange.value
    })
    if (res.data?.code === 200) parallelData.value = res.data.data || []
    else parallelData.value = []
  } catch (err) {
    console.error(err)
    parallelData.value = []
  } finally {
    parallelLoading.value = false
  }
}
const totalLines = computed(() => parallelData.value.length)
const parallelOptions = computed(() => {
  if (!parallelData.value.length) return {}
  const cityGroups = new Map()
  parallelData.value.forEach(record => {
    if (!cityGroups.has(record.city)) cityGroups.set(record.city, [])
    cityGroups.get(record.city).push(dimensions.map(d => record[d.key] ?? null))
  })
  const parallelAxis = dimensions.map((dim, idx) => ({ dim: idx, name: dim.label, max: dim.max, min: dim.min, type: 'value' }))
  const colorList = ['#5470c6', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
  const series = Array.from(cityGroups.keys()).map((city, idx) => ({
    name: city, type: 'parallel', data: cityGroups.get(city).map(v => ({ value: v })),
    lineStyle: { width: 0.8, opacity: 0.7, color: colorList[idx % colorList.length] }
  }))
  return { parallelAxis, legend: { data: Array.from(cityGroups.keys()) }, series }
})

// ===================== 表格 =====================
const tableData = ref([])
const tableLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const sortField = ref('target_date')
const sortOrder = ref('descending')
const fetchTableData = async () => {
  if (!globalFilterCity.value.length || !globalFilterSource.value.length) return
  tableLoading.value = true
  try {
    const res = await errorScoreApi.getWeatherDaysScoreList({
      city: globalFilterCity.value,
      source: globalFilterSource.value,
      dateRange: globalFilterDateRange.value,
      sortField: sortField.value,
      sortOrder: sortOrder.value === 'ascending' ? 'asc' : 'desc',
      page: currentPage.value,
      pageSize: pageSize.value,
    })
    if (res.data?.code === 200) {
      tableData.value = res.data.data.list || []
      total.value = res.data.data.pagination.total
    } else {
      tableData.value = []
    }
  } catch (err) {
    console.error(err)
    tableData.value = []
  } finally {
    tableLoading.value = false
  }
}
const handleTableSort = ({ prop, order }) => {
  sortField.value = prop || 'target_date'
  sortOrder.value = order || 'descending'
  currentPage.value = 1
  fetchTableData()
}
const handleSizeChange = (size) => { pageSize.value = size; currentPage.value = 1; fetchTableData() }
const handleCurrentChange = (page) => { currentPage.value = page; fetchTableData() }
const exportTableCSV = () => {
  const headers = ['城市', '数据来源', '日期', '总分', '最高温', '最低温', '平均温', '湿度', '降水', '气压']
  const rows = tableData.value.map(r => [r.city, r.source, r.target_date, r.total_score, r.temp_max_score, r.temp_min_score, r.temp_score, r.humidity_score, r.precip_score, r.pressure_score])
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'score_table.csv'
  link.click()
  URL.revokeObjectURL(link.href)
}

// ===================== 全局刷新 & 重置 =====================
const refreshAllCharts = async () => {
  if (!globalFilterCity.value.length) { ElMessage.warning('请至少选择一个城市'); return }
  if (!globalFilterSource.value.length) { ElMessage.warning('请至少选择一个数据来源'); return }
  globalLoading.value = true
  try {
    await Promise.all([
      fetchBarData(),
      fetchRadarData(),
      fetchLineData(),
      fetchHeatmapData(),
      fetchParallelData(),
      fetchTableData(),
      drillCity.value ? fetchSingleCityRadar() : Promise.resolve(),
      drillCity.value ? fetchSingleCityLine() : Promise.resolve()
    ])
  } catch (err) {
    console.error(err)
  } finally {
    globalLoading.value = false
  }
}
const resetGlobalFilters = () => {
  globalFilterCity.value = []
  globalFilterSource.value = []
  globalFilterDateRange.value = null
  drillCity.value = ''
  refreshAllCharts()
}

watch(loaded, (isLoaded) => {
  if (isLoaded) {
    if (defaultCities.value && defaultCities.value.length) {
      globalFilterCity.value = [...defaultCities.value]
    }
    if (defaultSources.value && defaultSources.value.length) {
      globalFilterSource.value = [...defaultSources.value]
    }
    if (defaultDateStart.value && defaultDateEnd.value) {
      globalFilterDateRange.value = [defaultDateStart.value, defaultDateEnd.value]
    }
    refreshAllCharts()
  }
}, { immediate: true })
// 选择刷新
watch([globalFilterCity,globalFilterSource,globalFilterDateRange],()=>{
  refreshAllCharts()
})
// 辅助函数
const progressColor = (percentage) => {
  if (percentage >= 80) return '#67C23A'
  if (percentage >= 60) return '#E6A23C'
  return '#F56C6C'
}
const tableRowClassName = ({ rowIndex }) => (rowIndex % 2 === 0 ? 'even-row' : '')
onMounted(()=>{
  refreshAllCharts()
})
</script>

<style scoped>
/* ========== 全局样式 ========== */
.score-analysis {
  padding: 24px;
  background: linear-gradient(135deg, #f6f9fc 0%, #edf2f7 100%);
  min-height: 100vh;
}

/* 卡片通用样式 */
.global-filter-card,
.chart-card,
.table-card {
  border-radius: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.85);
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
.filter-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 18px;
  color: #1a2c3e;
  border-bottom: 2px solid rgba(84, 112, 198, 0.2);
  padding-bottom: 12px;
  margin-bottom: 20px;
}

.header-icon {
  margin-right: 8px;
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

/* KPI 卡片 */
.kpi-row {
  margin-bottom: 24px;
}

.kpi-card {
  background: white;
  border-radius: 24px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transition: all 0.2s;
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}

.kpi-icon {
  font-size: 24px;
  opacity: 0.8;
}

.kpi-content {
  flex: 1;
}

.kpi-title {
  font-size: 12px;
  color: #64748b;
  letter-spacing: 0.5px;
}

.kpi-value {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  margin-top: 4px;
}

.kpi-primary .kpi-value {
  color: #3b82f6;
}

.kpi-success .kpi-value {
  color: #10b981;
}

.kpi-warning .kpi-value {
  color: #f59e0b;
}

.kpi-info .kpi-value {
  color: #8b5cf6;
}

/* 图表容器 */
.chart-container {
  background: #ffffff;
  border-radius: 20px;
  padding: 8px;
}

.heatmap-wrapper {
  background: #ffffff;
  border-radius: 20px;
  padding: 8px;
}

/* 筛选栏 */
.date-quick-buttons {
  margin-bottom: 8px;
  display: flex;
  gap: 8px;
}

.query-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
}

.reset-btn {
  transition: all 0.2s;
}

.filter-tag {
  margin-left: 12px;
  background: #eef2ff;
  border: none;
  color: #1e40af;
}

/* 表格样式优化 */
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

:deep(.el-progress-bar__outer) {
  background-color: #e2e8f0;
  border-radius: 12px;
}

:deep(.el-progress-bar__inner) {
  border-radius: 12px;
}

/* 响应式 */
@media (max-width: 768px) {
  .score-analysis {
    padding: 12px;
  }

  .kpi-card {
    padding: 16px;
  }

  .kpi-icon {
    font-size: 36px;
  }

  .kpi-value {
    font-size: 24px;
  }

  .card-header {
    font-size: 16px;
  }
}
</style>
