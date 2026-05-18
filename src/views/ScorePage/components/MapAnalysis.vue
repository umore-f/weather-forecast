<template>
  <div class="map-analysis">
    <!-- 统计卡片行 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-label">覆盖省份</div>
          <div class="stat-value">{{ provinceCount }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-label">全国平均最高分</div>
          <div class="stat-value">{{ overallAvgScore?.toFixed(2) || '—' }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-label">数据来源</div>
          <div class="stat-value">{{ selectedSources.length }} 个</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-label">数据时段</div>
          <div class="stat-value">{{ dateRangeLabel || '全部' }}</div>
        </div>
      </el-col>
    </el-row>

    <!-- 筛选卡片 -->
    <el-card class="filter-card" shadow="never">
      <el-row :gutter="20" align="middle">
        <el-col :span="8">
          <div class="filter-item">
            <label>数据来源（多选，至少2个）</label>
            <el-select v-model="selectedSources" multiple collapse-tags placeholder="请选择数据来源" clearable>
              <el-option v-for="s in sourceOptions" :key="s.value" :label="s.label" :value="s.value" />
            </el-select>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="filter-item">
            <label>日期范围（可选）</label>
            <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始"
              end-placeholder="结束" value-format="YYYY-MM-DD" style="width: 100%" />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="filter-item">
            <label>&nbsp;</label>
            <el-button type="primary" @click="fetchDataAndRender" :loading="loading" icon="Search">查询</el-button>
            <el-button @click="resetFilters" icon="Refresh">重置</el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 地图卡片 -->
    <el-card class="map-card" shadow="hover" v-loading="loading" element-loading-text="正在加载地图数据，请稍候..."
      element-loading-background="rgba(255,255,255,0.7)">
      <template #header>
        <div class="card-header">
          <div class="title-section">
            <span class="title-icon">🔥</span>
            <span>各省份平均最高分地图</span>
          </div>
          <el-tooltip content="颜色越深代表该省份内所有城市的最高总分平均值越高，圆点大小代表城市最高分" placement="top">
            <el-icon class="help-icon">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>
      </template>

      <div v-if="!loading && provinceData.length === 0" class="empty-placeholder">
        <el-empty description="暂无数据，请调整筛选条件" :image-size="140" />
      </div>
      <EChartsWrapper v-else ref="echartsWrapperRef" :options="currentChartOption" height="600px"
        @click="handleChartClick" @rendered="handleChartRendered" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { QuestionFilled } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { errorScoreApi } from '@/apis/score'
import { sourceOptions, cityCoordinates, cityToProvince } from '@/constants/weatherOptions'
import EChartsWrapper from '@/components/EChartsWrapper.vue'
import { useUserPreferences } from '@/composables/useUserPreferences'
const { defaultSources, defaultDateStart, defaultDateEnd, loaded } = useUserPreferences()
// 筛选条件
const selectedSources = ref([])
const dateRange = ref(null)
const loading = ref(false)

// 存储省份级别数据
const provinceData = ref([])        // [{ name, value, cities }]
const provinceDetails = ref({})     // 用于 tooltip 详情
// 存储城市散点数据
const cityScatterData = ref([])     // [{ name, value, coord, maxScore }]

// 地图注册状态
const mapRegistered = ref(false)
const echartsWrapperRef = ref(null)

// 统计摘要
const provinceCount = computed(() => provinceData.value.length)
const overallAvgScore = computed(() => {
  if (!provinceData.value.length) return null
  const sum = provinceData.value.reduce((acc, p) => acc + p.value, 0)
  return sum / provinceData.value.length
})
const dateRangeLabel = computed(() => {
  if (!dateRange.value || dateRange.value.length !== 2) return null
  return `${dateRange.value[0]} 至 ${dateRange.value[1]}`
})

// 获取所有城市列表
const cities = Object.keys(cityCoordinates)

// 加载并注册中国地图 GeoJSON
const registerChinaMap = async () => {
  if (mapRegistered.value) return
  try {
    const geoUrl = new URL('@/assets/map/China.geojson', import.meta.url).href
    const response = await fetch(geoUrl)
    if (!response.ok) throw new Error('加载地图数据失败')
    const geoJsonData = await response.json()
    echarts.registerMap('china', geoJsonData)
    mapRegistered.value = true
  } catch (err) {
    console.error(err)
    ElMessage.error('地图数据加载失败')
  }
}

// 构建地图配置（包含散点图层）
const buildMapOption = () => {
  if (!provinceData.value.length) return {}

  const minScore = 0
  const maxScore = 100

  // 基础配置
  const option = {
    backgroundColor: 'transparent',
    visualMap: {
      type: 'continuous',
      min: minScore,
      max: maxScore,
      calculable: true,
      inRange: { color: ['#f0f9e8', '#bae4bc', '#7bccc4', '#43a2ca', '#0868ac'] },
      outOfRange: { color: ['#e2e8f0'] },
      textStyle: { color: '#1e293b', fontSize: 11, fontWeight: '500' },
      itemWidth: 30,
      itemHeight: 120,
      align: 'right',
      bottom: 20,
      left: 20,
      backgroundColor: 'rgba(255,255,255,0.7)',
      borderRadius: 12,
      padding: [8, 12],
      borderWidth: 0,
      text: ['高分', '低分'],
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0,0,0,0.75)',
      borderColor: '#fff',
      borderWidth: 0,
      borderRadius: 12,
      textStyle: { color: '#f1f5f9', fontSize: 12, fontFamily: 'Inter, sans-serif' },
      formatter: (params) => {
        if (params.seriesType === 'map') {
          const provinceName = params.name
          const details = provinceDetails.value[provinceName]
          if (!details) return `${provinceName}<br/>暂无数据`
          let html = `<strong>${provinceName}</strong><br/>平均最高分: ${details.avgMaxScore.toFixed(2)}<br/>`
          html += `包含城市:<br/>`
          for (const city of details.cities) {
            html += `&nbsp;&nbsp;${city.name} (最高分: ${city.maxScore.toFixed(2)}, 最佳来源: ${city.bestSource})<br/>`
            html += `&nbsp;&nbsp;&nbsp;&nbsp;各来源: `
            for (const [src, score] of Object.entries(city.allScores)) {
              html += `${src}: ${score.toFixed(2)} `
            }
            html += `<br/>`
          }
          return html
        } else if (params.seriesType === 'scatter') {
          return `<strong>${params.name}</strong><br/>最高分: ${params.value[2]?.toFixed(2) || '—'}<br/>经度: ${params.value[0]}<br/>纬度: ${params.value[1]}`
        }
        return params.name
      }
    },
    series: [
      {
        name: '省份平均最高分',
        type: 'map',
        map: 'china',
        roam: false,
        zoom: 1.2,
        label: {
          show: false,
          emphasis: { show: true, fontSize: 12, fontWeight: 'bold', color: '#1e293b' }
        },
        emphasis: {
          label: { show: true },
          itemStyle: { areaColor: '#ffb347', shadowBlur: 20, shadowColor: 'rgba(0,0,0,0.2)' }
        },
        itemStyle: {
          borderColor: 'rgba(255,255,255,0.6)',
          borderWidth: 0.8,
          areaColor: '#e2e8f0',
        },
        animationDurationUpdate: 1000,
        universalTransition: true,
        data: provinceData.value.map(p => ({ name: p.name, value: p.value })),
      },
      {
        name: '城市最高分',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: cityScatterData.value.map(c => ({
          name: c.name,
          value: [c.coord[0], c.coord[1], c.maxScore],
        })),
        symbolSize: (val) => Math.sqrt(val[2]) / 2 + 8,
        label: {
          show: true,
          formatter: (params) => params.name,
          position: 'top',
          offset: [0, 8],
          fontSize: 10,
          fontWeight: 'bold',
          color: '#1e293b',
          textShadowBlur: 4,
          textShadowColor: '#fff',
          showAbove: true,
        },
        itemStyle: {
          color: '#ff6d00',
          borderColor: '#ffffff',
          borderWidth: 1.5,
          shadowBlur: 10,
          shadowColor: 'rgba(0,0,0,0.3)',
        },
        emphasis: {
          scale: 1.2,
          label: { show: true, fontWeight: 'bold', fontSize: 12 },
        },
        tooltip: { show: true },
      }
    ]
  }

  // 添加 geo 组件以支持散点图坐标系（复用地图注册）
  option.geo = {
    map: 'china',
    roam: false,
    show: false,  // 不显示独立geo图层，只提供坐标系
    zoom: 1.2,
    label: { show: false },
    itemStyle: { borderColor: 'transparent' }
  }

  return option
}

// 当前图表配置
const currentChartOption = computed(() => buildMapOption())

// 获取数据并处理省份聚合 + 城市散点
const fetchAndProcessData = async () => {
  if (selectedSources.value.length < 2) {
    ElMessage.warning('请至少选择两个数据来源')
    return false
  }
  loading.value = true
  try {
    const params = {
      city: cities,
      source: selectedSources.value,
      field: 'total_score'
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.dateRange = dateRange.value
    }

    const response = await errorScoreApi.getWeatherDaysScoreByCitySource(params)
    if (response.data?.code !== 200) {
      ElMessage.error(response.data?.message || '获取数据失败')
      return false
    }
    const rawData = response.data.data || []

    // 城市->来源->平均分映射
    const citySourceMap = new Map()
    for (const item of rawData) {
      const { city, source, avg_value } = item
      if (!citySourceMap.has(city)) citySourceMap.set(city, new Map())
      citySourceMap.get(city).set(source, avg_value)
    }

    // 省份聚合 & 城市散点数据构建
    const provinceMap = new Map()
    const scatterPoints = []

    for (const city of cities) {
      const sourceMap = citySourceMap.get(city)
      if (!sourceMap || sourceMap.size === 0) continue

      let maxScore = -Infinity
      let bestSource = ''
      const scores = {}
      for (const [src, val] of sourceMap.entries()) {
        scores[src] = val
        if (val > maxScore) {
          maxScore = val
          bestSource = src
        }
      }
      if (maxScore === -Infinity) continue

      // 获取城市坐标
      const coord = cityCoordinates[city]
      if (!coord || !Array.isArray(coord) || coord.length !== 2) {
        console.warn(`城市 ${city} 缺少坐标，无法添加散点`)
      } else {
        scatterPoints.push({
          name: city,
          coord: coord,
          maxScore: maxScore,
          bestSource: bestSource,
          allScores: scores
        })
      }

      const province = cityToProvince[city]
      if (!province) {
        console.warn(`未找到城市 ${city} 对应的省份，将跳过`)
        continue
      }

      if (!provinceMap.has(province)) {
        provinceMap.set(province, { totalMaxSum: 0, count: 0, cities: [] })
      }
      const provData = provinceMap.get(province)
      provData.totalMaxSum += maxScore
      provData.count += 1
      provData.cities.push({
        name: city,
        maxScore,
        bestSource,
        allScores: scores
      })
    }

    if (provinceMap.size === 0) {
      ElMessage.info('所选条件下无有效数据')
      provinceData.value = []
      provinceDetails.value = {}
      cityScatterData.value = []
      return false
    }

    // 生成最终省份数据
    const provDataList = []
    const provDetails = {}
    for (const [province, provData] of provinceMap.entries()) {
      const avgMaxScore = provData.totalMaxSum / provData.count
      provDataList.push({
        name: province,
        value: avgMaxScore,
        cities: provData.cities
      })
      provDetails[province] = {
        avgMaxScore,
        cities: provData.cities
      }
    }

    provinceData.value = provDataList
    provinceDetails.value = provDetails
    cityScatterData.value = scatterPoints

    return true
  } catch (err) {
    console.error(err)
    ElMessage.error('请求出错')
    return false
  } finally {
    loading.value = false
  }
}

// 查询按钮触发
const fetchDataAndRender = async () => {
  await registerChinaMap()
  await fetchAndProcessData()
}

// 监听筛选条件变化自动查询
watch([selectedSources, dateRange], () => {
  fetchDataAndRender()
}, { deep: true })

// 重置筛选
const resetFilters = () => {
  selectedSources.value = []
  dateRange.value = null
}

// 图表点击事件（下钻到城市）
const handleChartClick = async (params) => {
  if (params.componentType === 'series' && params.seriesType === 'map') {
    const provinceName = params.name
    const detail = provinceDetails.value[provinceName]
    if (detail && detail.cities.length) {
      const cityListHtml = detail.cities.map(c =>
        `<div style="margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
          <b>${c.name}</b><br/>
          最高分: ${c.maxScore.toFixed(2)} (来源: ${c.bestSource})<br/>
          各来源: ${Object.entries(c.allScores).map(([src, sc]) => `${src}: ${sc.toFixed(2)}`).join(' | ')}
        </div>`
      ).join('')
      await ElMessageBox.alert(
        `<div style="max-height: 400px; overflow-y: auto;">${cityListHtml}</div>`,
        `${provinceName} 城市详细数据`,
        { dangerouslyUseHTMLString: true, confirmButtonText: '关闭', center: true }
      )
    } else {
      ElMessage.info(`${provinceName} 暂无城市数据`)
    }
  } else if (params.componentType === 'series' && params.seriesType === 'scatter') {
    const cityName = params.name
    const cityDetail = cityScatterData.value.find(c => c.name === cityName)
    if (cityDetail) {
      const srcLines = Object.entries(cityDetail.allScores).map(([src, sc]) =>
        `${src}: ${sc.toFixed(2)}`
      ).join('<br/>')
      await ElMessageBox.alert(
        `<div>
          <p><b>${cityName}</b></p>
          <p>最高分: ${cityDetail.maxScore.toFixed(2)} (最佳来源: ${cityDetail.bestSource})</p>
          <p>各来源平均分:<br/>${srcLines}</p>
        </div>`,
        '城市详情',
        { dangerouslyUseHTMLString: true, confirmButtonText: '关闭' }
      )
    }
  }
}

const handleChartRendered = () => {
}

// 初始化默认值
watch(loaded, (isLoaded) => {
  if (isLoaded) {
    if (defaultSources.value && defaultSources.value.length) {
      selectedSources.value = [...defaultSources.value]
    }
    if (defaultDateStart.value && defaultDateEnd.value) {
      dateRange.value = [defaultDateStart.value, defaultDateEnd.value]
    }
    registerChinaMap().then(() => {
      fetchDataAndRender()
    })
  }
}, { immediate: true })
</script>

<style>
/* 全局样式 - 不使用 scoped 以避免覆盖问题，但为了组件隔离建议保留 scoped，这里改用普通样式并添加组件前缀 */
.map-analysis {
  padding: 20px;
  background: linear-gradient(135deg, #f9fafc 0%, #eef2f6 100%);
  min-height: 100vh;
}

/* 统计卡片行 */
.map-analysis .stats-row {
  margin-bottom: 20px;
}

.map-analysis .stat-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  border-radius: 24px;
  padding: 16px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: all 0.2s ease;
}

.map-analysis .stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 20px -12px rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.95);
}

.map-analysis .stat-card .stat-label {
  font-size: 18px;
  color: #475569;
  letter-spacing: 0.3px;
  margin-bottom: 8px;
}

.map-analysis .stat-card .stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

/* 筛选卡片 */
.map-analysis .filter-card {
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.map-analysis .filter-card .el-card__body {
  padding: 20px 24px;
}

.map-analysis .filter-item label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
  letter-spacing: 0.3px;
}

/* 地图卡片 */
.map-analysis .map-card {
  border-radius: 28px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.1);
}

.map-analysis .map-card .el-card__header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 16px 24px;
}

.map-analysis .map-card .el-card__body {
  padding: 0;
}

.map-analysis .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.map-analysis .card-header .title-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.map-analysis .card-header .title-section .title-icon {
  font-size: 20px;
}

.map-analysis .card-header .title-section span:last-child {
  font-size: 1.2rem;
  font-weight: 700;
  background: linear-gradient(120deg, #0f172a, #334155);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: -0.3px;
}

.map-analysis .card-header .help-icon {
  font-size: 18px;
  color: #94a3b8;
  cursor: help;
  transition: color 0.2s;
}

.map-analysis .card-header .help-icon:hover {
  color: #3b82f6;
}

.map-analysis .empty-placeholder {
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
