
<template>
  <div class="map-analysis">
    <el-card class="filter-card" shadow="never">
      <el-row :gutter="20">
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
            <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" style="width: 100%" />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="filter-item">
            <label>&nbsp;</label>
            <el-button type="primary" @click="fetchMapData" :loading="loading">查询</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="map-card" shadow="hover" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>🗺️ 最优API分布地图</span>
          <el-tooltip content="每个城市点的颜色代表该城市综合得分最高的数据来源（基于所选数据来源和日期范围）" placement="top">
            <el-icon><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
      </template>
      <div v-loading="loading" class="map-container">
        <div ref="mapChartRef" style="width: 100%; height: 600px;"></div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { QuestionFilled } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { errorScoreApi } from '@/apis/score'
import { sourceOptions } from '@/constants/weatherOptions'
import { cityCoordinates } from '@/constants/weatherOptions'
import geoJson from '@/assets/map/' // 根据实际路径调整

// 筛选条件
const selectedSources = ref([])
const dateRange = ref(null)
const loading = ref(false)

// 地图实例
let chart = null
const mapChartRef = ref(null)

// 城市列表（从cityCoordinates获取）
const cities = Object.keys(cityCoordinates)

// 颜色映射（按数据来源顺序分配颜色）
// eslint-disable-next-line no-unused-vars
const getSourceColor = (source, index, _total) => {
  // 使用HSL生成不同颜色，或者预定义
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec489a']
  return colors[index % colors.length]
}

// 获取地图数据
const fetchMapData = async () => {
  if (selectedSources.value.length < 2) {
    ElMessage.warning('请至少选择两个数据来源以进行最优对比')
    return
  }
  loading.value = true
  try {
    const range = dateRange.value ? { start: dateRange.value[0], end: dateRange.value[1] } : undefined
    // 获取所有城市的得分数据（API需要支持按城市列表，这里传全部城市）
    const response = await errorScoreApi.getWeatherDaysScore(cities, range, selectedSources.value)
    if (response.data?.code === 200) {
      const rawData = response.data.data || []
      // 计算每个城市各数据源的平均总分
      const citySourceScore = new Map() // city -> Map(source -> avgScore)
      rawData.forEach(item => {
        const city = item.city
        const source = item.source
        const score = item.total_score
        if (!citySourceScore.has(city)) citySourceScore.set(city, new Map())
        const srcMap = citySourceScore.get(city)
        if (!srcMap.has(source)) srcMap.set(source, { sum: 0, count: 0 })
        const stat = srcMap.get(source)
        stat.sum += score
        stat.count++
      })
      // 计算每个城市的最优API
      const cityBest = []
      for (const [city, srcMap] of citySourceScore.entries()) {
        let bestSource = null
        let bestScore = -Infinity
        for (const [source, stat] of srcMap.entries()) {
          const avg = stat.sum / stat.count
          if (avg > bestScore) {
            bestScore = avg
            bestSource = source
          }
        }
        if (bestSource && cityCoordinates[city]) {
          cityBest.push({
            name: city,
            value: cityCoordinates[city],
            source: bestSource,
            score: bestScore
          })
        }
      }
      renderMap(cityBest)
    } else {
      ElMessage.error(response.data?.message || '获取数据失败')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('请求出错')
  } finally {
    loading.value = false
  }
}

// 渲染地图
const renderMap = (cityData) => {
  if (!chart) return
  // 注册地理坐标（使用geojson）
  echarts.registerMap('china', geoJson)
  // 准备散点数据
  const scatterData = cityData.map(item => ({
    name: item.name,
    value: [item.value[1], item.value[0]], // echarts 经纬度顺序 [经度, 纬度]？注意：geojson中通常是[经度,纬度]，但散点坐标也需要[经度,纬度]
    source: item.source,
    score: item.score
  }))
  // 获取唯一的数据来源并分配颜色
  const sources = [...new Set(cityData.map(d => d.source))]
  const sourceColorMap = new Map()
  sources.forEach((src, idx) => {
    sourceColorMap.set(src, getSourceColor(src, idx, sources.length))
  })
  const option = {
    title: {
      text: '各城市最优数据来源分布',
      left: 'center',
      top: 0
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        if (params.data) {
          return `${params.data.name}<br/>最优来源: ${params.data.source}<br/>综合得分: ${params.data.score.toFixed(1)}`
        }
        return params.name
      }
    },
    geo: {
      map: 'china',
      roam: true,
      zoom: 1.2,
      label: {
        show: true,
        fontSize: 10,
        color: '#333'
      },
      emphasis: {
        label: { show: true }
      },
      itemStyle: {
        borderColor: '#aaa',
        borderWidth: 0.5,
        areaColor: '#f0f2f5'
      }
    },
    series: [
      {
        name: '城市最优API',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: scatterData,
        symbolSize: 12,
        symbol: 'circle',
        itemStyle: {
          color: (params) => sourceColorMap.get(params.data.source),
          borderColor: '#fff',
          borderWidth: 1,
          shadowBlur: 5,
          shadowColor: 'rgba(0,0,0,0.3)'
        },
        label: {
          show: true,
          formatter: (params) => params.name,
          position: 'top',
          offset: [0, -10],
          fontSize: 11,
          color: '#333',
          fontWeight: 'bold'
        },
        emphasis: {
          scale: 1.2,
          label: { show: true }
        }
      }
    ]
  }
  chart.setOption(option, true)
}

// 重置筛选
const resetFilters = () => {
  selectedSources.value = []
  dateRange.value = null
  if (chart) {
    chart.clear()
  }
}

// 初始化地图
const initMap = () => {
  if (mapChartRef.value) {
    chart = echarts.init(mapChartRef.value)
    // 可以先注册地图，但不设置数据
    echarts.registerMap('china', geoJson)
    chart.setOption({
      geo: {
        map: 'china',
        roam: true,
        zoom: 1.2,
        itemStyle: { areaColor: '#f0f2f5', borderColor: '#aaa' }
      }
    })
  }
}

onMounted(() => {
  initMap()
  window.addEventListener('resize', () => chart?.resize())
})

onBeforeUnmount(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
  window.removeEventListener('resize', () => chart?.resize())
})
</script>

<style scoped>
.map-analysis { padding: 4px; }
.filter-card { border-radius: 16px; margin-bottom: 0; }
.filter-item label { display: block; font-size: 13px; font-weight: 500; color: #475569; margin-bottom: 8px; }
.map-card { border-radius: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; font-size: 16px; color: #1e293b; margin-bottom: 12px; }
.map-container { min-height: 600px; }
</style>