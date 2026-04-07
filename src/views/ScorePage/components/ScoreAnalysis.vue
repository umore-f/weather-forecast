<template>
  <div class="score-analysis">
    <!-- 全局筛选栏 - 优化样式 -->
    <el-card class="global-filter-card" shadow="hover">
      <el-row :gutter="16" align="middle">
        <el-col :xs="24" :sm="8">
          <el-select v-model="globalFilterCity" multiple collapse-tags placeholder="城市" clearable style="width: 100%">
            <template #header>
              <el-checkbox v-model="cityCheckAll" :indeterminate="cityIndeterminate" @change="handleGlobalCityCheckAll">
                全选
              </el-checkbox>
            </template>
            <el-option v-for="c in cityOptions" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-select v-model="globalFilterSource" multiple collapse-tags placeholder="数据来源" clearable
            style="width: 100%">
            <el-option v-for="s in sourceOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-date-picker v-model="globalFilterDateRange" type="daterange" range-separator="至" start-placeholder="开始"
            end-placeholder="结束" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-col>
      </el-row>
      <el-row style="margin-top: 16px">
        <el-col :span="24">
          <el-button type="primary" @click="refreshAllCharts" :loading="globalLoading" class="query-btn">查询</el-button>
          <el-button @click="resetGlobalFilters" class="reset-btn">重置</el-button>
          <el-tag v-if="globalFilterCity.length && globalFilterSource.length" type="info" effect="plain"
            style="margin-left: 12px">
            <el-icon>
              <Filter />
            </el-icon>
            已选 {{ globalFilterCity.length }} 个城市 · {{ globalFilterSource.length }} 个数据源
          </el-tag>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="chart-card" shadow="hover" style="margin-top: 24px">
      <template #header>
        <div class="card-header">
          <span><span class="header-icon">🏆</span> 数据源综合得分排名（柱状图）</span>
          <el-tooltip content="柱顶显示得分及排名，得分最高为第1名" placement="top">
            <el-icon class="help-icon">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>
      </template>
      <div class="chart-container" v-loading="barLoading">
        <EChartsWrapper v-if="barOptions.series" :options="barOptions" height="400px" :auto-resize="true" />
        <el-empty v-else description="请选择筛选条件并点击查询" :image-size="80" />
      </div>
    </el-card>

    <el-card class="chart-card" shadow="hover" style="margin-top: 24px">
      <template #header>
        <div class="card-header">
          <span><span class="header-icon">🔥</span> 城市可信度热力图 & 下钻雷达图</span>
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
            <el-tooltip content="点击左侧热力图格子，右侧显示该城市各数据源的6维得分雷达图" placement="top">
              <el-icon class="help-icon">
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </div>
        </div>
      </template>
      <div class="heatmap-radar-layout">
        <!-- 左侧热力图 -->
        <div class="heatmap-container" v-loading="heatmapLoading">
          <EChartsWrapper v-if="heatmapOptions.series" :options="heatmapOptions" height="480px" :auto-resize="true"
            @click="onHeatmapClick" />
          <el-empty v-else description="请选择至少一个城市和一个数据源" :image-size="80" />
        </div>
        <!-- 右侧雷达图 -->
        <div class="radar-container" v-loading="singleCityRadarLoading">
          <div v-if="drillCity" class="drill-city-title">
            城市：{{ drillCity }}
            <el-button size="small" type="primary" link @click="clearDrillCity">清除</el-button>
          </div>
          <EChartsWrapper v-if="singleCityRadarOptions.series && singleCityRadarOptions.series.length"
            :options="singleCityRadarOptions" height="420px" :auto-resize="true" />
          <el-empty v-else description="点击左侧热力图格子，查看城市雷达图" :image-size="80" />
        </div>
      </div>
    </el-card>
    <!-- 各维度得分雷达图 & 综合得分趋势（左右并排） -->
    <el-card class="chart-card" shadow="hover" style="margin-top: 24px">
      <template #header>
        <div class="card-header">
          <span><span class="header-icon">📊</span> 各维度得分雷达图 & 综合得分趋势</span>
          <el-tooltip content="点击任意图表的图例，可同时控制两个图表的数据源显示/隐藏" placement="top">
            <el-icon class="help-icon">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>
      </template>
      <div class="radar-line-layout">
        <div class="radar-wrapper" v-loading="radarLoading">
          <EChartsWrapper ref="radarChartRef" v-if="radarOptions.series && radarOptions.series.length"
            :options="radarOptions" height="400px" :auto-resize="true" @legendselectchanged="onRadarLegendChange" />
          <el-empty v-else description="暂无数据" :image-size="80" />
        </div>
        <div class="line-wrapper" v-loading="lineLoading">
          <EChartsWrapper ref="lineChartRef" v-if="lineOptions.series && lineOptions.series.length"
            :options="lineOptions" height="400px" :auto-resize="true" @legendselectchanged="onLineLegendChange" />
          <el-empty v-else description="暂无数据" :image-size="80" />
        </div>
      </div>
    </el-card>

    <!-- 5. 平行坐标图 - 适配浅色主题，更清晰 -->
    <el-card class="chart-card" shadow="hover" style="margin-top: 24px">
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

    <!-- 6. 得分明细表格 - 优化表格样式 -->
    <el-card class="table-card" shadow="hover" style="margin-top: 24px">
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
        style="margin-top: 12px" :row-class-name="tableRowClassName">
        <el-table-column prop="city" label="城市" width="100" />
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
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" style="margin-top: 16px; justify-content: flex-end;" />
      </el-config-provider>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { QuestionFilled, Filter, Download } from '@element-plus/icons-vue'
import { errorScoreApi } from '@/apis/score'
import { cityOptions, sourceOptions } from '@/constants/weatherOptions'
import dayjs from 'dayjs'

// 自定义分页文案
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

// ===================== 全局筛选条件 =====================
const globalFilterCity = ref([])
const globalFilterSource = ref([])
const globalFilterDateRange = ref(null)
const globalLoading = ref(false)

watch([globalFilterCity, globalFilterSource, globalFilterDateRange], () => {
  refreshAllCharts()
  if (drillCity.value && !globalFilterCity.value.includes(drillCity.value)) {
    clearDrillCity()
  }
  fetchHeatmapData()
  // 如果下钻城市依然有效，则刷新雷达图（日期范围可能变了）
  if (drillCity.value) {
    fetchSingleCityRadar()
  }
}, { deep: true })
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

// 进度条颜色
const progressColor = (percentage) => {
  if (percentage >= 80) return '#67C23A'
  if (percentage >= 60) return '#E6A23C'
  return '#F56C6C'
}

// 表格行样式
const tableRowClassName = ({ rowIndex }) => {
  if (rowIndex % 2 === 0) return 'even-row'
  return ''
}


// 柱状图相关
const barData = ref([])        // 原始数据 [{ source, total_score, ... }]
const barLoading = ref(false)
// 获取柱状图数据（所有明细，用于计算各数据源平均总分）
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
    } else {
      barData.value = []
      ElMessage.error(res.data?.message || '获取柱状图数据失败')
    }
  } catch (err) {
    console.error(err)
    barData.value = []
  } finally {
    barLoading.value = false
  }
}
// 柱状图配置（按得分降序，柱顶显示排名和得分）
const barOptions = computed(() => {
  if (!barData.value.length) return {}

  // 1. 计算每个数据源的平均总分
  const map = new Map()
  barData.value.forEach(item => {
    const src = item.source
    if (!map.has(src)) map.set(src, { sum: 0, count: 0 })
    const stat = map.get(src)
    stat.sum += item.avg_total_score
    stat.count++
  })

  // 2. 转为数组并按平均分降序排序（最高分排第1）
  const sourceStats = Array.from(map.entries()).map(([source, stat]) => ({
    source,
    avgScore: stat.sum / stat.count
  }))
  sourceStats.sort((a, b) => b.avgScore - a.avgScore)

  // 3. 提取排序后的数据源名称和得分
  const sortedSources = sourceStats.map(s => s.source)
  const sortedScores = sourceStats.map(s => s.avgScore)

  // 4. 排名奖牌和文字
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
    xAxis: {
      type: 'category',
      data: sortedSources,
      name: '数据来源',
      axisLabel: { fontSize: 12, fontWeight: 500, rotate: 0 },
      axisLine: { lineStyle: { color: '#ddd' } }
    },
    yAxis: {
      type: 'value',
      name: '得分',
      min: 0,
      max: 100,
      splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } }
    },
    series: [{
      type: 'bar',
      data: sortedScores,
      itemStyle: {
        borderRadius: [8, 8, 0, 0],
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#5470c6' },
            { offset: 1, color: '#3b82f6' }
          ]
        },
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
      animationDuration: 1000,
      animationEasing: 'cubicOut'
    }]
  }
})

// 热力图相关状态
const heatmapField = ref('total_score')
const heatmapData = ref([])        // 原始API返回数据 [{city, source, avg_value}]
const heatmapLoading = ref(false)
const currentHeatmapCities = ref([])
const currentHeatmapSources = ref([])

// 热力图配置（computed）
const heatmapOptions = computed(() => {
  if (!heatmapData.value.length) return {}

  // 获取所有唯一的城市和数据源（按原始顺序）
  const cities = [...new Map(heatmapData.value.map(item => [item.city, item.city])).values()]
  const sources = [...new Map(heatmapData.value.map(item => [item.source, item.source])).values()]

  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  currentHeatmapCities.value = cities
  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  currentHeatmapSources.value = sources
  // 构建 [xIndex, yIndex, value] 数据
  const seriesData = []
  heatmapData.value.forEach(item => {
    const xIdx = sources.indexOf(item.source)
    const yIdx = cities.indexOf(item.city)
    if (xIdx !== -1 && yIdx !== -1) {
      seriesData.push([xIdx, yIdx, item.avg_value])
    }
  })

  // 颜色映射：低分红，中分黄，高分绿
  const visualMin = 0
  const visualMax = 100

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const data = params.data
        if (!data || data.length < 3) return ''
        const city = cities[data[1]]
        const source = sources[data[0]]
        const value = data[2]
        return `${city}<br/>${source}<br/>得分: ${value.toFixed(1)}`
      },
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderColor: '#333',
      textStyle: { color: '#fff' }
    },
    xAxis: {
      type: 'category',
      data: sources,
      name: '数据来源',
      axisLabel: { rotate: 0, fontWeight: 500, fontSize: 12 },
      axisLine: { lineStyle: { color: '#ccc' } }
    },
    yAxis: {
      type: 'category',
      data: cities,
      name: '城市',
      axisLabel: { fontSize: 12, fontWeight: 500 },
      axisLine: { lineStyle: { color: '#ccc' } }
    },
    visualMap: {
      min: visualMin,
      max: visualMax,
      calculable: true,
      orient: 'vertical',
      left: 'left',
      inRange: {
        color: ['#d73027', '#fee090', '#66bd63']   // 红 -> 黄 -> 绿
      },
      textStyle: { color: '#333' }
    },
    series: [{
      type: 'heatmap',
      data: seriesData,
      label: {
        show: true,
        formatter: (params) => {
          return params.data[2] ? params.data[2].toFixed(0) : ''
        },
        fontSize: 10,
        color: '#1f2937'
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0,0,0,0.5)'
        }
      },
      itemStyle: {
        borderRadius: 4,
        borderColor: '#fff',
        borderWidth: 1
      }
    }],
    grid: {
      left: '12%',
      right: '8%',
      top: '10%',
      bottom: '8%',
      containLabel: false,
      backgroundColor: '#fefefe'
    }
  }
})

// 获取热力图数据
const fetchHeatmapData = async () => {
  // 必须有城市和数据源
  if (!globalFilterCity.value.length || !globalFilterSource.value.length) {
    heatmapData.value = []
    return
  }
  heatmapLoading.value = true
  try {
    const params = {
      city: globalFilterCity.value,
      source: globalFilterSource.value,
      field: heatmapField.value,
      dateRange: globalFilterDateRange.value
    }
    const res = await errorScoreApi.getWeatherDaysScoreByCitySource(params)
    if (res.data?.code === 200) {
      heatmapData.value = res.data.data || []
    } else {
      heatmapData.value = []
      ElMessage.error(res.data?.message || '获取热力图数据失败')
    }
  } catch (err) {
    console.error(err)
    heatmapData.value = []
  } finally {
    heatmapLoading.value = false
  }
}

// 字段切换时重新加载
const onHeatmapFieldChange = () => {
  fetchHeatmapData()
}

// 监听全局筛选变化，刷新热力图（在 refreshAllCharts 中也会调用，但为了独立联动，可以单独 watch）
watch([globalFilterCity, globalFilterSource, globalFilterDateRange], () => {
  fetchHeatmapData()
}, { deep: true })

// 单城市雷达图相关
const drillCity = ref('')                     // 当前下钻城市
const singleCityRadarData = ref([])           // 雷达图原始数据
const singleCityRadarLoading = ref(false)

// 获取单城市所有数据源的各字段平均分（用于雷达图）
const fetchSingleCityRadar = async () => {
  if (!drillCity.value) {
    singleCityRadarData.value = []
    return
  }
  singleCityRadarLoading.value = true
  try {
    let start_date = null, end_date = null
    if (globalFilterDateRange.value && globalFilterDateRange.value.length === 2) {
      start_date = globalFilterDateRange.value[0]
      end_date = globalFilterDateRange.value[1]
    }
    // 调用新接口：传入城市和日期范围，后端返回所有数据源的所有字段平均分
    const res = await errorScoreApi.getWeatherDaysScoreSourceAvgByCity({
      city: drillCity.value,
      dateRange: [start_date, end_date]
    })
    if (res.data?.code === 200) {
      // 期望返回格式: { data: [{ source: 'CMA', temp_max_score: 85.2, ... }, ...] }
      singleCityRadarData.value = res.data.data || []
    } else {
      singleCityRadarData.value = []
      ElMessage.error(res.data?.message || '获取城市雷达图数据失败')
    }
  } catch (err) {
    console.error(err)
    singleCityRadarData.value = []
  } finally {
    singleCityRadarLoading.value = false
  }
}
const singleCityRadarOptions = computed(() => {
  if (!singleCityRadarData.value.length) return {}

  const indicators = [
    { name: '最高温', max: 100 },
    { name: '最低温', max: 100 },
    { name: '平均温', max: 100 },
    { name: '湿度', max: 100 },
    { name: '降水', max: 100 },
    { name: '气压', max: 100 }
  ]
  const fieldMap = ['avg_temp_max_score', 'avg_temp_min_score', 'avg_temp_score', 'avg_humidity_score', 'avg_precip_score', 'avg_pressure_score']
  const colorList = ['#5470c6', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452']

  const series = singleCityRadarData.value.map((item, idx) => {
    const values = fieldMap.map(f => item[f] || 0)
    return {
      name: item.source,
      type: 'radar',
      data: [{ value: values, name: item.source }],
      areaStyle: { color: `rgba(${hexToRgb(colorList[idx % colorList.length])}, 0.2)` },
      lineStyle: { color: colorList[idx % colorList.length], width: 2 },
      itemStyle: { color: colorList[idx % colorList.length] },
      symbol: 'circle',
      symbolSize: 6
    }
  })

  return {
    radar: { indicator: indicators, shape: 'circle', radius: '65%' },
    legend: { data: singleCityRadarData.value.map(i => i.source), top: 0, right: 10 },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const sourceName = params.seriesName
        const values = params.value
        let html = `<strong>${sourceName}</strong><br/>`
        indicators.forEach((ind, idx) => {
          html += `${ind.name}: ${values[idx].toFixed(1)}<br/>`
        })
        return html
      },
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderColor: '#333',
      textStyle: { color: '#fff' }
    },
    series
  }
})
const onHeatmapClick = (params) => {
  // ECharts 点击事件参数：componentType, data (数组 [xIndex, yIndex, value])
  if (params && params.data && params.data.length >= 3) {
    // const xIndex = params.data[0]
    const yIndex = params.data[1]
    const city = currentHeatmapCities.value[yIndex]
    if (city) {
      drillCity.value = city
      fetchSingleCityRadar()
      ElMessage.success(`已切换到城市：${city}`)
    }
  }
}

// 清除下钻
const clearDrillCity = () => {
  drillCity.value = ''
  singleCityRadarData.value = []
}
// ===================== 3. 折线图 =====================
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
  if (!lineData.value.length) return {}
  const sourceMap = new Map()
  lineData.value.forEach(item => {
    const { source, target_date, avg_total_score } = item
    if (!sourceMap.has(source)) {
      sourceMap.set(source, { dates: [], scores: [] })
    }
    const group = sourceMap.get(source)
    group.dates.push(target_date)
    group.scores.push(avg_total_score)
  })
  // eslint-disable-next-line no-unused-vars
  for (const [source, group] of sourceMap.entries()) {
    const combined = group.dates?.map((d, idx) => ({ date: d, score: group.scores[idx] }))
    combined?.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
    group.dates = combined?.map(c => c.date)
    group.scores = combined.map(c => c.score)
  }
  const allDates = [...new Set(lineData.value.map(item => item.target_date))].sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf())
  const series = []
  const colorList = ['#5470c6', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
  let colorIdx = 0
  for (const [source] of sourceMap.entries()) {
    const data = allDates.map(date => {
      const record = lineData.value.find(r => r.source === source && r.target_date === date)
      return record ? record.avg_total_score : null
    })
    series.push({
      name: source,
      type: 'line',
      data: data,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 3, color: colorList[colorIdx % colorList.length], shadowColor: 'rgba(0,0,0,0.1)', shadowBlur: 5 },
      itemStyle: { color: colorList[colorIdx % colorList.length], borderColor: '#fff', borderWidth: 2 },
      areaStyle: { opacity: 0.1, color: colorList[colorIdx % colorList.length] },
      connectNulls: false,
      label: { show: false },
      emphasis: { focus: 'series' }
    })
    colorIdx++
  }
  return {
    tooltip: {
      trigger: 'axis', formatter: (params) => {
        let html = params[0].axisValue + '<br/>'
        params.forEach(p => { if (p.value !== null) html += `${p.marker} ${p.seriesName}: ${p.value.toFixed(1)}<br/>` })
        return html
      },
      backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#333', textStyle: { color: '#fff' }
    },
    legend: { data: Array.from(sourceMap.keys()), top: 0, right: 10, orient: 'horizontal', textStyle: { color: '#333', fontWeight: 500 } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true, backgroundColor: '#fafafa', borderWidth: 0 },
    xAxis: { type: 'category', data: allDates, name: '日期', axisLabel: { rotate: 30, formatter: (value) => dayjs(value).format('MM-DD'), fontSize: 11 }, axisLine: { lineStyle: { color: '#ccc' } } },
    yAxis: { type: 'value', name: '平均总分', min: 0, max: 100, splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } } },
    series: series
  }
})

// ===================== 4. 雷达图 =====================
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
    if (res.data?.code === 200) {
      radarData.value = res.data.data || []
    } else {
      radarData.value = []
      ElMessage.error(res.data?.message || '获取雷达图数据失败')
    }
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
  const colorList = ['#5470c6', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
  const series = radarData.value.map((item, idx) => {
    const values = fieldMapping.map(field => item[`avg_${field.key}`] || 0)
    return {
      name: item.source,
      type: 'radar',
      data: [{ value: values, name: item.source }],
      areaStyle: { color: `rgba(${hexToRgb(colorList[idx % colorList.length])}, 0.2)` },
      lineStyle: { color: colorList[idx % colorList.length], width: 2 },
      itemStyle: { color: colorList[idx % colorList.length] },
      symbol: 'circle',
      symbolSize: 6,
      emphasis: { areaStyle: { color: `rgba(${hexToRgb(colorList[idx % colorList.length])}, 0.4)` } }
    }
  })
  return {
    radar: { indicator: indicators, shape: 'circle', radius: '65%', name: { textStyle: { fontSize: 12, color: '#4b5563' } }, splitArea: { areaStyle: { color: ['rgba(84,112,198,0.05)', 'rgba(84,112,198,0.02)'] } } },
    legend: { data: radarData.value.map(item => item.source), top: 0, right: 10, orient: 'horizontal', textStyle: { color: '#333', fontWeight: 500 } },
    tooltip: {
      trigger: 'item', formatter: (params) => {
        const sourceName = params.seriesName
        const values = params.value
        let html = `${sourceName}<br/>`
        indicators.forEach((ind, idx) => { html += `${ind.name}: ${values[idx].toFixed(1)}<br/>` })
        return html
      },
      backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#333', textStyle: { color: '#fff' }
    },
    series: series
  }
})

const radarChartRef = ref(null)
const lineChartRef = ref(null)
const radarInstance = ref(null)
const lineInstance = ref(null)

watch(radarChartRef, (val) => {
  if (val) radarInstance.value = val.getInstance?.() || val
})
watch(lineChartRef, (val) => {
  if (val) lineInstance.value = val.getInstance?.() || val
})

const onRadarLegendChange = (params) => {

  if (!lineInstance.value) return
  const { name, selected } = params
  const actionType = selected[name] ? 'legendSelect' : 'legendUnSelect'
  lineInstance.value.dispatchAction({ type: actionType, name })
}

const onLineLegendChange = (params) => {

  if (!radarInstance.value) return
  const { name, selected } = params
  const actionType = selected[name] ? 'legendSelect' : 'legendUnSelect'
  radarInstance.value.dispatchAction({ type: actionType, name })
}

// ===================== 5. 平行坐标图 =====================
const parallelData = ref([])
const parallelLoading = ref(false)
const dimensions = [
  { key: 'temp_score', label: '平均温', max: 100, min: 0 },
  { key: 'temp_max_score', label: '最高温', max: 100, min: 0 },
  { key: 'temp_min_score', label: '最低温', max: 100, min: 0 },
  { key: 'humidity_score', label: '湿度', max: 100, min: 0 },
  { key: 'precip_score', label: '降水', max: 100, min: 0 },
  { key: 'pressure_score', label: '气压', max: 100, min: 0 }
]
const fetchParallelData = async () => {
  if (!globalFilterCity.value.length && !globalFilterSource.value.length && !globalFilterDateRange.value) return
  parallelLoading.value = true
  try {
    const res = await errorScoreApi.getWeatherDaysScoreDetail({
      city: globalFilterCity.value,
      source: globalFilterSource.value,
      dateRange: globalFilterDateRange.value
    })
    if (res.data?.code === 200) {
      parallelData.value = res.data.data || []
    } else {
      parallelData.value = []
      ElMessage.error(res.data?.message || '获取平行坐标图数据失败')
    }
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
  for (const record of parallelData.value) {
    const city = record.city
    if (!cityGroups.has(city)) cityGroups.set(city, [])
    const sample = dimensions.map(dim => record[dim.key] ?? 0)
    cityGroups.get(city).push(sample)
  }
  const parallelAxis = dimensions.map((dim, idx) => ({
    dim: idx,
    name: dim.label,
    max: dim.max,
    min: dim.min,
    type: 'value',
    nameLocation: 'middle',
    nameGap: 50,
    axisLabel: { color: '#333', fontSize: 11 },
    axisLine: { lineStyle: { color: '#aaa' } }
  }))
  const cityList = Array.from(cityGroups.keys())
  const colorList = ['#5470c6', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
  const series = cityList.map((city, idx) => ({
    name: city,
    type: 'parallel',
    data: cityGroups.get(city).map(sample => ({ value: sample })),
    lineStyle: { width: 1.5, opacity: 0.7, color: colorList[idx % colorList.length], type: 'solid' },
    tooltip: { show: true }
  }))
  return {
    backgroundColor: '#ffffff',
    legend: { data: cityList, bottom: 30, textStyle: { color: '#333', fontSize: 12 }, itemGap: 20 },
    tooltip: {
      trigger: 'item', backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#777', borderWidth: 1, textStyle: { color: '#fff' }, formatter: (params) => {
        const city = params.seriesName
        const values = params.value
        let html = `<strong>${city}</strong><br/>`
        dimensions.forEach((dim, i) => { html += `${dim.label}: ${values[i].toFixed(1)}<br/>` })
        return html
      }
    },
    parallelAxis: parallelAxis,
    visualMap: { show: true, min: 0, max: 100, dimension: 0, inRange: { color: ['#ee6666', '#fac858', '#5470c6'] }, calculable: true, textStyle: { color: '#333' }, itemWidth: 30 },
    parallel: { left: '5%', right: '13%', bottom: 80, top: 20, parallelAxisDefault: { type: 'value', nameLocation: 'middle', nameGap: 50, nameTextStyle: { color: '#333', fontSize: 12 }, axisLine: { lineStyle: { color: '#aaa' } }, axisTick: { lineStyle: { color: '#ccc' } }, splitLine: { show: false }, axisLabel: { color: '#333' } } },
    series: series
  }
})

// ===================== 6. 表格 =====================
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
    const orderParam = sortOrder.value === 'ascending' ? 'asc' : 'desc'
    const res = await errorScoreApi.getWeatherDaysScoreList({
      city: globalFilterCity.value,
      source: globalFilterSource.value,
      dateRange: globalFilterDateRange.value,
      sortField: sortField.value,
      sortOrder: orderParam,
      page: currentPage.value,
      pageSize: pageSize.value,
    })
    if (res.data?.code === 200) {
      tableData.value = res.data.data.list || []
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
  if (prop && order) {
    sortField.value = prop
    sortOrder.value = order
  } else {
    sortField.value = 'target_date'
    sortOrder.value = 'descending'
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

// ===================== 全局刷新 & 重置 =====================
const refreshAllCharts = async () => {
  if (!globalFilterCity.value.length) {
    ElMessage.warning('请至少选择一个城市')
    return
  }
  if (!globalFilterSource.value.length) {
    ElMessage.warning('请至少选择一个数据来源')
    return
  }
  globalLoading.value = true
  try {
    await Promise.all([
      // fetchSummaryData(),
      fetchBarData(),
      fetchLineData(),
      fetchRadarData(),
      fetchParallelData(),
      fetchTableData(),
      fetchHeatmapData(),
      (drillCity.value ? fetchSingleCityRadar() : Promise.resolve())
    ])
  } catch (err) {
    console.error('刷新数据失败', err)
  } finally {
    globalLoading.value = false
  }
}
const resetGlobalFilters = () => {
  globalFilterCity.value = []
  globalFilterSource.value = []
  globalFilterDateRange.value = null
  lineData.value = []
  radarData.value = []
  barData.value = []
  parallelData.value = []
  tableData.value = []
  total.value = 0
  currentPage.value = 1
  refreshAllCharts()
}

onMounted(() => {
  refreshAllCharts()
})
</script>

<style scoped>
.radar-line-layout {
  display: flex;
  gap: 20px;
}

.radar-line-layout .radar-wrapper,
.radar-line-layout .line-wrapper {
  flex: 1;
  min-width: 0;
  /* 防止flex子项溢出 */
  background: #fafbff;
  border-radius: 16px;
  padding: 8px;
}

@media (max-width: 992px) {
  .radar-line-layout {
    flex-direction: column;
  }
}

/* 全局背景与容器样式 */
.score-analysis {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e9eef3 100%);
  min-height: 100vh;
}

/* 卡片通用样式增强 */
.global-filter-card,
.summary-card-wrapper,
.chart-card,
.table-card {
  border-radius: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.global-filter-card:hover,
.summary-card-wrapper:hover,
.chart-card:hover,
.table-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
}

/* 卡片头部样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 18px;
  color: #1f2937;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 20px;
}

.header-icon {
  margin-right: 8px;
  font-size: 20px;
}

.help-icon {
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.2s;
}

.help-icon:hover {
  color: #5470c6;
}

/* 查询按钮样式 */
.query-btn {
  background: linear-gradient(135deg, #5470c6 0%, #3b82f6 100%);
  border: none;
  box-shadow: 0 2px 6px rgba(84, 112, 198, 0.3);
  transition: all 0.3s;
}

.query-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(84, 112, 198, 0.4);
}

.reset-btn {
  transition: all 0.2s;
}

.reset-btn:hover {
  transform: translateY(-1px);
}

/* 摘要卡片样式 */
.summary-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  padding: 24px 16px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(84, 112, 198, 0.1);
  position: relative;
  overflow: hidden;
}

.summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #5470c6, #3b82f6);
  opacity: 0;
  transition: opacity 0.3s;
}

.summary-card:hover::before {
  opacity: 1;
}

.summary-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(84, 112, 198, 0.15);
}

.summary-title {
  font-size: 18px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 16px;
}

.summary-score .score-value {
  font-size: 48px;
  font-weight: 800;
  background: linear-gradient(135deg, #1f2937, #5470c6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.summary-score .score-unit {
  font-size: 16px;
  color: #9ca3af;
  margin-left: 4px;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 30px;
  font-size: 13px;
  font-weight: 600;
  background: #f3f4f6;
  color: #4b5563;
  margin-top: 12px;
}

.rank-1 .rank-badge {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #d97706;
}

.rank-2 .rank-badge {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: #4b5563;
}

.rank-3 .rank-badge {
  background: linear-gradient(135deg, #fed7aa, #fdba74);
  color: #b45309;
}

/* 图表容器 */
.chart-container {
  min-height: 420px;
  background: #ffffff;
  border-radius: 16px;
  padding: 8px;
}

/* 平行坐标图线条统计标签 */
.line-count-tag {
  margin-top: 12px;
  background: #eef2ff;
  border: none;
  color: #5470c6;
  font-weight: 500;
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.el-table th) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  font-weight: 600;
  color: #1f2937;
  border-bottom: 2px solid #e2e8f0;
}

:deep(.el-table .even-row) {
  background-color: #fafbff;
}

:deep(.el-table tr:hover > td) {
  background-color: #eef2ff !important;
}

/* 进度条样式优化 */
:deep(.el-progress-bar__outer) {
  background-color: #f3f4f6;
  border-radius: 12px;
}

:deep(.el-progress-bar__inner) {
  border-radius: 12px;
  transition: width 0.6s ease;
}

/* 分页样式优化 */
:deep(.el-pagination) {
  padding: 16px 0 8px;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next),
:deep(.el-pagination .el-pager li) {
  border-radius: 8px;
  margin: 0 4px;
  transition: all 0.2s;
}

:deep(.el-pagination .el-pager li.active) {
  background: linear-gradient(135deg, #5470c6, #3b82f6);
  color: white;
  border: none;
}

/* 空状态样式优化 */
:deep(.el-empty) {
  padding: 40px 0;
}

:deep(.el-empty__image) {
  opacity: 0.7;
}

:deep(.el-empty__description) {
  color: #9ca3af;
  font-size: 14px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .score-analysis {
    padding: 12px;
  }

  .summary-card .score-value {
    font-size: 36px;
  }

  .card-header {
    font-size: 16px;
  }
}
</style>