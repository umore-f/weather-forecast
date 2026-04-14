<template>
  <div class="map-analysis">
    <!-- 筛选卡片（保持不变） -->
    <el-card class="filter-card" shadow="never">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="filter-item">
            <label>数据来源（多选，至少2个）</label>
            <el-select v-model="selectedSources" multiple collapse-tags placeholder="请选择数据来源" clearable>
              <el-option v-for="s in sourceOptions" :key="s.value" :label="s.label" :value="s.value" />
            </el-select>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="filter-item">
            <label>日期范围（可选）</label>
            <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始"
              end-placeholder="结束" value-format="YYYY-MM-DD" style="width: 100%" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="filter-item">
            <label>&nbsp;</label>
            <el-button type="primary" @click="fetchDataAndRender" :loading="loading">查询</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="filter-item">
            <label>显示模式</label>
            <el-radio-group v-model="chartMode" @change="onModeChange" size="small">
              <el-radio-button label="map">省份地图</el-radio-button>
              <el-radio-button label="bar">条形图</el-radio-button>
            </el-radio-group>
            <el-checkbox v-model="autoSwitch" style="margin-left: 12px;" @change="onAutoSwitchChange">
              自动切换 (2s)
            </el-checkbox>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 图表卡片：改用 EChartsWrapper -->
    <el-card class="map-card" shadow="hover" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>🔥 {{ chartMode === 'map' ? '各省份平均最高分地图' : '省份平均最高分排名（条形图）' }}</span>
          <el-tooltip :content="chartMode === 'map' ? '颜色越深代表该省份内所有城市的最高总分平均值越高' : '条形图长度代表省份平均最高分'" placement="top">
            <el-icon>
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>
      </template>

      <!-- EChartsWrapper 封装组件 -->
      <EChartsWrapper ref="echartsWrapperRef" :options="currentChartOption" :loading="loading" height="600px"
        @click="handleChartClick" @rendered="handleChartRendered" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { QuestionFilled } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { errorScoreApi } from '@/apis/score'
import { sourceOptions, cityCoordinates, cityToProvince } from '@/constants/weatherOptions'
import EChartsWrapper from '@/components/EChartsWrapper.vue' // 路径按实际调整

// 筛选条件
const selectedSources = ref([])
const dateRange = ref(null)
const loading = ref(false)

// 模式切换
const chartMode = ref('map')
const autoSwitch = ref(false)
let timer = null

// 存储省份级别数据
const lastProvinceData = ref([])      // [{ name, value, cities }]
const lastProvinceDetails = ref({})   // 用于 tooltip 详情

// 地图注册状态
const mapRegistered = ref(false)

const cities = Object.keys(cityCoordinates)

// 加载并注册中国地图 GeoJSON（仅执行一次）
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

// 构建地图配置
const buildMapOption = (provinceData, provinceDetails) => {
  if (!provinceData.length) return {}
  const scores = provinceData.map(p => p.value)
  const minScore = Math.min(...scores)
  const maxScore = Math.max(...scores)

  return {
    visualMap: {
      type: 'continuous',
      min: minScore,
      max: maxScore,
      calculable: true,
      inRange: { color: ['#91c7ae', '#f39c12', '#e74c3c'] },
      outOfRange: { color: ['#ccc'] },
      text: ['高分', '低分'],
      textStyle: { color: '#333' }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const provinceName = params.name
        const details = provinceDetails[provinceName]
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
      }
    },
    series: [{
      name: '省份平均最高分',
      type: 'map',
      map: 'china',
      // roam: true,
      roam: false,
      zoom: 1.2,
      label: {
        show: false,
        emphasis: { show: true }
      },
      emphasis: {
        label: { show: true },
        itemStyle: { areaColor: '#ffd966' }
      },
      animationDurationUpdate: 1000,  
      universalTransition: true,
      data: provinceData.map(p => ({ name: p.name, value: p.value })),
      
    }]
  }
}

// 构建条形图配置
const buildBarOption = (provinceData, provinceDetails) => {
  if (!provinceData.length) return {}
  const sorted = [...provinceData].sort((a, b) => a.value - b.value)
  const names = sorted.map(p => p.name)
  const values = sorted.map(p => p.value)

  const colorPalette = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec489a', '#06b6d4', '#f97316']
  const colors = names.map((_, idx) => colorPalette[idx % colorPalette.length])

  return {
    xAxis: { type: 'value', name: '平均最高分' },
    yAxis: {
      type: 'category',
      data: names,
      axisLabel: { rotate: 30, fontSize: 10 }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const idx = params[0].dataIndex
        const province = sorted[idx]
        const details = provinceDetails[province.name]
        let html = `<strong>${province.name}</strong><br/>平均最高分: ${province.value.toFixed(2)}<br/>`
        html += `所含城市:<br/>`
        for (const city of details.cities) {
          html += `&nbsp;&nbsp;${city.name} (最高分: ${city.maxScore.toFixed(2)}, 最佳来源: ${city.bestSource})<br/>`
        }
        return html
      }
    },
    animationDurationUpdate: 1000,
    series: [{
      name: '平均最高分',
      type: 'bar',
      data: values,
      itemStyle: { color: (params) => colors[params.dataIndex], borderRadius: [0, 4, 4, 0] },
      label: { show: true, position: 'right', formatter: '{c}' },
      universalTransition: true
    }],
    grid: { containLabel: true, left: 80, right: 20 }
  }
}

// 当前图表配置（计算属性自动响应数据与模式变化）
const currentChartOption = computed(() => {
  if (!lastProvinceData.value.length) return {}
  return chartMode.value === 'map'
    ? buildMapOption(lastProvinceData.value, lastProvinceDetails.value)
    : buildBarOption(lastProvinceData.value, lastProvinceDetails.value)
})

// 获取数据并更新 lastProvinceData/lastProvinceDetails
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
    if (dateRange.value) params.dateRange = dateRange.value

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

    // 省份聚合
    const provinceMap = new Map()
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
      return false
    }

    // 生成最终数据
    const provinceData = []
    const provinceDetails = {}
    for (const [province, provData] of provinceMap.entries()) {
      const avgMaxScore = provData.totalMaxSum / provData.count
      provinceData.push({
        name: province,
        value: avgMaxScore,
        cities: provData.cities
      })
      provinceDetails[province] = {
        avgMaxScore,
        cities: provData.cities
      }
    }

    lastProvinceData.value = provinceData
    lastProvinceDetails.value = provinceDetails

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
  await registerChinaMap() // 确保地图已注册
  await fetchAndProcessData()
}
watch([selectedSources, dateRange], () => {
  fetchDataAndRender()
})
// 重置
const resetFilters = () => {
  selectedSources.value = []
  dateRange.value = null
  lastProvinceData.value = []
  lastProvinceDetails.value = []
}

// 模式手动切换
const onModeChange = () => {
  // 可在此添加额外逻辑，例如上报切换事件
}

// 自动切换逻辑
const startAutoSwitch = () => {
  if (timer) clearInterval(timer)
  if (!autoSwitch.value) return
  timer = setInterval(() => {
    chartMode.value = chartMode.value === 'map' ? 'bar' : 'map'
  }, 2000)
}
const stopAutoSwitch = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}
const onAutoSwitchChange = (val) => {
  if (val) startAutoSwitch()
  else stopAutoSwitch()
}
// 当自动切换开启且 chartMode
watch(chartMode, () => {
  if (autoSwitch.value) startAutoSwitch()
})

// 图表事件处理（示例）
const handleChartClick = (params) => {
  console.log('图表点击:', params)
}
const handleChartRendered = () => {
  // console.log('图表渲染完成')
}

// 生命周期
onMounted(() => {
  registerChinaMap() // 提前加载地图数据
})

onBeforeUnmount(() => {
  stopAutoSwitch()
})
</script>

<style scoped>
.map-analysis {
  padding: 4px;
}

.filter-card {
  border-radius: 16px;
  margin-bottom: 0;
}

.filter-item label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  margin-bottom: 8px;
}

.map-card {
  border-radius: 16px;
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
</style>