import { computed } from 'vue'
import { stdDev } from '../../../utils/dateUtils'

// 静态配置（可考虑从外部传入）
const sourceOptions = [
  { label: '和风天气', value: 'QWeather' },
  { label: 'tomorrow.io', value: 'tomorrow.io' },
  { label: 'visualcrossing', value: 'visualcrossing' }
]

export function useDiagnose(rawData, activeScene, selectedTraceDate) {
  // 模拟场景缩放
  const filteredDataForDiagnose = computed(() => {
    let data = rawData.value
    if (activeScene.value === 'extremeHeat') {
      data = data.map(item => ({ ...item, error_value: item.error_value * 1.5 }))
    } else if (activeScene.value === 'heavyRain') {
      data = data.map(item => ({ ...item, error_value: item.error_value * 1.8 }))
    } else if (activeScene.value === 'calm') {
      data = data.map(item => ({ ...item, error_value: item.error_value * 0.6 }))
    }
    return data
  })

  // 各数据源五维评分
  const sourceRadarScores = computed(() => {
    const result = {}
    for (const src of sourceOptions.map(s => s.value)) {
      const srcData = filteredDataForDiagnose.value.filter(d => d.source === src && d.error_value !== undefined)
      if (srcData.length === 0) {
        result[src] = { accuracy: 0, stability: 0, extreme: 0, bias: 0, timeliness: 0 }
        continue
      }
      const errors = srcData.map(d => Math.abs(d.error_value))
      const rawErrors = srcData.map(d => d.error_value)
      const accuracy = 100 - Math.min(100, (errors.reduce((a, b) => a + b, 0) / errors.length) * 20)
      const stability = 100 - Math.min(100, stdDev(errors) * 20)
      const extremeErrors = errors.sort((a, b) => b - a).slice(0, Math.floor(errors.length * 0.1))
      const extremeScore = extremeErrors.length ? 100 - Math.min(100, (extremeErrors.reduce((a, b) => a + b, 0) / extremeErrors.length) * 20) : 50
      const bias = rawErrors.reduce((a, b) => a + b, 0) / rawErrors.length
      const biasScore = 50 - Math.min(50, Math.abs(bias) * 10) + 50
      const timeliness = 80
      result[src] = {
        accuracy: Math.max(0, Math.min(100, accuracy)),
        stability: Math.max(0, Math.min(100, stability)),
        extreme: Math.max(0, Math.min(100, extremeScore)),
        bias: Math.max(0, Math.min(100, biasScore)),
        timeliness
      }
    }
    return result
  })

  // 雷达图配置
  const radarDiagnoseOptions = computed(() => {
    const indicators = [
      { name: '准确性', max: 100 },
      { name: '稳定性', max: 100 },
      { name: '极端天气表现', max: 100 },
      { name: '偏差倾向', max: 100 },
      { name: '时效性', max: 100 }
    ]
    const seriesData = sourceOptions.map(src => ({
      name: src.label,
      value: [
        sourceRadarScores.value[src.value].accuracy,
        sourceRadarScores.value[src.value].stability,
        sourceRadarScores.value[src.value].extreme,
        sourceRadarScores.value[src.value].bias,
        sourceRadarScores.value[src.value].timeliness
      ]
    }))
    return {
      tooltip: {},
      legend: { data: seriesData.map(s => s.name), top: 10 },
      radar: { indicators, center: ['50%', '50%'], radius: '60%' },
      series: [{ type: 'radar', data: seriesData, areaStyle: { opacity: 0.2 } }]
    }
  })

  // 箱线图配置
  const boxplotOptions = computed(() => {
    const boxData = []
    for (const src of sourceOptions.map(s => s.value)) {
      const errors = filteredDataForDiagnose.value.filter(d => d.source === src && d.error_value !== undefined).map(d => Math.abs(d.error_value))
      if (errors.length === 0) {
        boxData.push([0, 0, 0, 0, 0])
        continue
      }
      errors.sort((a, b) => a - b)
      const min = errors[0]
      const max = errors[errors.length - 1]
      const q1 = errors[Math.floor(errors.length * 0.25)]
      const median = errors[Math.floor(errors.length * 0.5)]
      const q3 = errors[Math.floor(errors.length * 0.75)]
      boxData.push([min, q1, median, q3, max])
    }
    return {
      title: { text: '误差绝对值分布', left: 'left' },
      tooltip: { trigger: 'item' },
      xAxis: { type: 'category', data: sourceOptions.map(s => s.label), name: '数据源' },
      yAxis: { type: 'value', name: '绝对误差' },
      series: [{ name: 'boxplot', type: 'boxplot', data: boxData, itemStyle: { borderWidth: 2 } }]
    }
  })

  // 桑基图配置（依赖 selectedTraceDate）
  const sankeyOptions = computed(() => {
    if (!selectedTraceDate.value) return {}
    // 解析日期
    const targetDateObj = new Date(selectedTraceDate.value).toISOString().slice(0, 10)
    const dayData = rawData.value.filter(item => item.target_date === targetDateObj && item.error_value !== undefined)
    const srcErrors = {}
    for (const src of sourceOptions.map(s => s.value)) {
      const errors = dayData.filter(d => d.source === src).map(d => Math.abs(d.error_value))
      srcErrors[src] = errors.length ? errors.reduce((a, b) => a + b, 0) / errors.length : 1
    }
    let totalInv = 0
    const invErrors = {}
    for (const src in srcErrors) {
      const inv = 1 / (srcErrors[src] + 0.01)
      invErrors[src] = inv
      totalInv += inv
    }
    const weights = {}
    for (const src in invErrors) {
      weights[src] = (invErrors[src] / totalInv * 100).toFixed(1)
    }
    const nodes = [{ name: '真值' }, ...sourceOptions.map(s => ({ name: s.label }))]
    const links = sourceOptions.map(src => ({
      source: src.label,
      target: '真值',
      value: parseFloat(weights[src.value])
    }))
    return {
      title: { text: '真值合成权重', left: 'left' },
      tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
      series: { type: 'sankey', layout: 'none', emphasis: { focus: 'adjacency' }, data: nodes, links, nodeWidth: 30, nodeGap: 20 }
    }
  })

  return {
    filteredDataForDiagnose,
    radarDiagnoseOptions,
    boxplotOptions,
    sankeyOptions
  }
}
