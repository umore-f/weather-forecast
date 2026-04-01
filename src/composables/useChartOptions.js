import { computed } from 'vue'
import { getFieldLabel } from '../constants/weatherOptions'
import { convertToLocalDate, compareDate } from '../utils/dateUtils'
import dayjs from 'dayjs'

export function useChartOptions(
  chartType,
  selectedCities,
  selectedFields,
  selectedSource,
  daysList,
  extraConfig  // 存放 barDate, scatterX, scatterY, heatmapCity, heatmapField 等
) {
  // 辅助：生成折线图系列
  const generateLineSeries = () => {
    const series = []
    const cities = [...selectedCities.value]
    const fields = [...selectedFields.value]
    const sources = [...selectedSource.value]

    for (const city of cities) {
      for (const field of fields) {
        for (const source of sources) {
          const name = `${city}-${source}-${getFieldLabel(field)}`
          const filtered = daysList.value.filter(item => item.city === city && item.source === source)
          const data = filtered.map(item => item[field])
          series.push({ name, type: 'line', data, smooth: true, symbol: 'circle', symbolSize: 6 })
        }
      }
    }
    return series
  }

  const xAxisData = computed(() => {
    const dateStrings = daysList.value.map(item => convertToLocalDate(item.forecast_time))
    const uniqueDates = [...new Set(dateStrings)]
    return uniqueDates.sort(compareDate)
  })

  const getLineChartOptions = () => ({
    title: { text: '天气数据对比（折线图）', left: 'left' },
    tooltip: { trigger: 'axis' },
    legend: { data: generateLineSeries().map(s => s.name), top: 30, left: 'center' },
    grid: { left: '5%', right: '5%', top: '15%', bottom: '5%', containLabel: true },
    xAxis: { type: 'category', data: xAxisData.value, boundaryGap: false },
    yAxis: { type: 'value', name: '数值' },
    series: generateLineSeries(),
    dataZoom: [{ type: 'slider', start: 0, end: 100, bottom: 10 }, { type: 'inside' }]
  })

  const getBarChartOptions = () => {
    let targetDate = extraConfig.barDate.value
    console.log("!!!!!!!!!!",targetDate);

    if (!targetDate && daysList.value.length) {
      const latest = daysList.value.reduce((max, item) =>
        dayjs(item.forecast_time).isAfter(dayjs(max)) ? item.forecast_time : max, ''
      )
      targetDate = convertToLocalDate(latest)
    }
    const dataForDate = daysList.value.filter(item => convertToLocalDate(item.forecast_time) === targetDate)
    if (!dataForDate.length) return { title: { text: '无数据' } }

    const cities = [...new Set(dataForDate.map(d => d.city))]
    const fields = selectedFields.value
    const series = fields.map(field => {
      return {
        name: getFieldLabel(field),
        type: 'bar',
        data: cities.map(city => {
          const item = dataForDate.find(d => d.city === city)
          return item ? item[field] : null
        }),
        label: { show: true, position: 'top' }
      }
    })

    return {
      title: { text: `天气数据对比（${targetDate}）`, left: 'left' },
      tooltip: { trigger: 'axis' },
      legend: { data: series.map(s => s.name), top: 30 },
      xAxis: { type: 'category', data: cities, name: '城市' },
      yAxis: { type: 'value', name: '数值' },
      series
    }
  }

  const getRadarChartOptions = () => {
    const cities = selectedCities.value
    const fields = selectedFields.value
    const sources = selectedSource.value
    if (!cities.length || !fields.length || !sources.length) {
      return { title: { text: '请至少选择一个城市、一个字段和一个数据来源' } }
    }

    // 所有数据
    const allData = daysList.value

    // 计算每个字段的最大最小值（跨所有城市、来源）
    const indicator = fields.map(field => {
      const values = allData.map(item => item[field]).filter(v => v !== null && v !== undefined)
      const max = values.length ? Math.max(...values) : 100
      const min = values.length ? Math.min(...values) : 0
      return { name: getFieldLabel(field), max, min }
    })

    // 为每个城市和来源生成一个雷达图系列
    const seriesData = []
    for (const city of cities) {
      for (const source of sources) {
        const cityData = allData.filter(d => d.city === city && d.source === source)
        if (cityData.length === 0) continue
        const values = fields.map(field => {
          const avg = cityData.reduce((sum, d) => sum + (d[field] || 0), 0) / cityData.length
          return avg
        })
        seriesData.push({
          name: `${city} (${source})`,
          value: values,
          areaStyle: { color: 'rgba(59,130,246,0.3)' },
          lineStyle: { width: 2 }
        })
      }
    }

    return {
      title: { text: '城市天气指标雷达图（平均值）', left: 'left' },
      tooltip: {},
      legend: { data: seriesData.map(s => s.name), top: 30 },
      radar: { indicator, center: ['50%', '50%'], radius: '60%' },
      series: [{ type: 'radar', data: seriesData, areaStyle: {} }]
    }
  }

  const getScatterChartOptions = () => {
    const xField = extraConfig.scatterX.value
    const yField = extraConfig.scatterY.value
    const cities = selectedCities.value
    const sources = selectedSource.value
    if (!cities.length || !sources.length) return { title: { text: '请至少选择一个城市和一个数据来源' } }

    const series = []
    for (const city of cities) {
      for (const source of sources) {
        const cityData = daysList.value.filter(d => d.city === city && d.source === source)
        if (cityData.length === 0) continue
        const data = cityData.map(d => [d[xField], d[yField]])
        series.push({
          name: `${city} (${source})`,
          type: 'scatter',
          data,
          symbolSize: 8,
          emphasis: { scale: true }
        })
      }
    }

    return {
      title: { text: `${getFieldLabel(xField)} vs ${getFieldLabel(yField)}`, left: 'left' },
      tooltip: { trigger: 'item', formatter: params => `${params.seriesName}<br/>${getFieldLabel(xField)}: ${params.value[0]}<br/>${getFieldLabel(yField)}: ${params.value[1]}` },
      xAxis: { name: getFieldLabel(xField), nameLocation: 'middle', nameGap: 30 },
      yAxis: { name: getFieldLabel(yField), nameLocation: 'middle', nameGap: 30 },
      series
    }
  }

  const getHeatmapOptions = () => {
    const city = extraConfig.heatmapCity.value
    const field = extraConfig.heatmapField.value
    const source = extraConfig.heatmapSource.value
    console.log("!!!!!!!!!!",city,field,source);

    if (!city || !field || !source) return { title: { text: '请选择城市、字段和数据来源' } }

    const cityData = daysList.value.filter(d => d.city === city && d.source === source)
    if (!cityData.length) return { title: { text: '所选城市无数据' } }

    const data = cityData.map(item => [item.forecast_time, item[field]])
    const dates = cityData.map(d => d.forecast_time).sort(compareDate)
    const startDate = dates[0]
    const endDate = dates[dates.length - 1]

    return {
      title: { text: `${city} (${source}) - ${getFieldLabel(field)} 日历热力图`, left: 'left' },
      tooltip: { trigger: 'item', formatter: params => `${params.value[0]}<br/>值: ${params.value[1]}` },
      visualMap: {
        min: Math.min(...cityData.map(d => d[field]).filter(v => v !== null)),
        max: Math.max(...cityData.map(d => d[field]).filter(v => v !== null)),
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 10
      },
      calendar: {
        range: [startDate, endDate],
        cellSize: ['auto', 30],
        yearLabel: { show: true },
        monthLabel: { show: true },
        dayLabel: { show: true }
      },
      series: { type: 'heatmap', coordinateSystem: 'calendar', data }
    }
  }

  const options = computed(() => {
    if (!selectedCities.value.length || !selectedFields.value.length) return null
    switch (chartType.value) {
      case 'line': return getLineChartOptions()
      case 'bar': return getBarChartOptions()
      case 'radar': return getRadarChartOptions()
      case 'scatter': return getScatterChartOptions()
      case 'heatmap': return getHeatmapOptions()
      default: return getLineChartOptions()
    }
  })

  return { chartOptions: options }
}
