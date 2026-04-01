import { computed } from 'vue'
import * as echarts from 'echarts'
import { getFieldLabel } from '../constants/weatherOptions'
import { convertToLocalDate, compareDate } from '../utils/dateUtils'
import dayjs from 'dayjs'

/**
 * 图表选项组合式函数（美化版）
 * @param {Object} chartType - 当前图表类型的 ref
 * @param {Object} selectedCities - 选中城市的 ref (数组)
 * @param {Object} selectedFields - 选中字段的 ref (数组)
 * @param {Object} selectedSource - 选中数据源的 ref (数组)
 * @param {Object} daysList - 原始数据列表的 ref
 * @param {Object} extraConfig - 额外配置对象，包含 barDate, scatterX, scatterY, heatmapCity, heatmapField, heatmapSource, radarRanges 等 ref
 * @returns {{ chartOptions: import('vue').ComputedRef }}
 */
export function useChartOptions(
  chartType,
  selectedCities,
  selectedFields,
  selectedSource,
  daysList,
  extraConfig
) {
  // ==================== 公共辅助函数 ====================
  const getTargetDate = (targetDate) => {
    if (targetDate) return targetDate
    if (!daysList.value?.length) return ''
    const latest = daysList.value.reduce((max, item) =>
      dayjs(item.forecast_time).isAfter(dayjs(max)) ? item.forecast_time : max, ''
    )
    return convertToLocalDate(latest)
  }

  const generateLineSeries = () => {
    const series = []
    const cities = selectedCities.value
    const fields = selectedFields.value
    const sources = selectedSource.value

    for (const city of cities) {
      for (const field of fields) {
        for (const source of sources) {
          const name = `${city}-${source}-${getFieldLabel(field)}`
          const filtered = daysList.value.filter(
            item => item.city === city && item.source === source
          )
          const data = filtered.map(item => item[field])
          series.push({
            name,
            type: 'line',
            data,
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
          })
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

  // ==================== 折线图 ====================
  const getLineChartOptions = () => {
    let series = generateLineSeries()
    if (!series.length) {
      return { title: { text: '无数据，请选择城市、字段和数据源' } }
    }

    const styledSeries = series.map((s, idx) => {
      const colors = ['#5470c6', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
      const color = colors[idx % colors.length]
      return {
        ...s,
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: color },
            { offset: 1, color: '#fafafa' }
          ])
        },
        lineStyle: { width: 2, shadowBlur: 5, shadowColor: 'rgba(0,0,0,0.1)', color },
        itemStyle: { borderWidth: 2, borderColor: '#fff', color }
      }
    })

    return {
      backgroundColor: '#fafafa',
      title: { text: '天气数据对比（折线图）', left: 'left', textStyle: { fontWeight: 'bold', fontSize: 16 } },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderWidth: 0,
        borderRadius: 8,
        shadowBlur: 10,
        shadowColor: 'rgba(0,0,0,0.1)'
      },
      legend: {
        data: styledSeries.map(s => s.name),
        top: 20,
        left: 'center',
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 8,
        padding: [4, 12],
        shadowBlur: 2,
        shadowColor: 'rgba(0,0,0,0.05)'
      },
      grid: {
        left: '8%',
        right: '8%',
        top: '18%',
        bottom: '8%',
        containLabel: true,
        backgroundColor: '#fff',
        borderWidth: 0
      },
      xAxis: {
        type: 'category',
        data: xAxisData.value,
        boundaryGap: false,
        axisLabel: { rotate: 30, fontWeight: 500, fontSize: 11 },
        axisLine: { lineStyle: { width: 2, color: '#333' } }
      },
      yAxis: {
        type: 'value',
        name: '数值',
        nameTextStyle: { fontWeight: 'bold', fontSize: 12 },
        splitLine: { lineStyle: { type: 'dashed', color: '#ddd' } }
      },
      series: styledSeries,
      dataZoom: [
        { type: 'slider', start: 0, end: 100, bottom: 10, borderColor: '#ccc', handleSize: '80%' },
        { type: 'inside' }
      ]
    }
  }

  // ==================== 柱状图 ====================
  const getBarChartOptions = () => {
    let targetDate = extraConfig.barDate.value
    targetDate = getTargetDate(targetDate)

    if (!targetDate) {
      return { title: { text: '无有效日期数据' } }
    }

    const dataForDate = daysList.value.filter(
      item => convertToLocalDate(item.forecast_time) === targetDate
    )
    if (!dataForDate.length) {
      return { title: { text: `所选日期 ${targetDate} 无数据` } }
    }

    const cities = [...new Set(dataForDate.map(d => d.city))]
    const fields = selectedFields.value
    const sources = selectedSource.value

    if (!fields.length || !sources.length) {
      return { title: { text: '请至少选择一个字段和一个数据来源' } }
    }

    const series = []
    const colorPalette = ['#5470c6', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']

    for (const field of fields) {
      for (const source of sources) {
        const seriesName = `${getFieldLabel(field)} (${source})`
        const data = cities.map(city => {
          const item = dataForDate.find(d => d.city === city && d.source === source)
          return item?.[field] ?? null
        })
        const idx = series.length
        series.push({
          name: seriesName,
          type: 'bar',
          data,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colorPalette[idx % colorPalette.length] },
              { offset: 1, color: '#fff' }
            ]),
            shadowBlur: 4,
            shadowColor: 'rgba(0,0,0,0.1)'
          },
          label: {
            show: true,
            position: 'top',
            fontWeight: 'bold',
            fontSize: 11,
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: '#fff',
            borderRadius: 4,
            padding: [2, 6]
          }
        })
      }
    }

    return {
      backgroundColor: '#fafafa',
      title: { text: `天气数据对比（${targetDate}）`, left: 'left', textStyle: { fontWeight: 'bold', fontSize: 16 } },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderWidth: 0,
        borderRadius: 8,
        shadowBlur: 10
      },
      legend: {
        data: series.map(s => s.name),
        top: 20,
        left: 'center',
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 8,
        padding: [4, 12]
      },
      grid: {
        left: '8%',
        right: '5%',
        top: '15%',
        bottom: '5%',
        containLabel: true,
        backgroundColor: '#fff',
        borderWidth: 0
      },
      xAxis: {
        type: 'category',
        data: cities,
        name: '城市',
        axisLabel: { fontWeight: 500 },
        axisLine: { lineStyle: { width: 2 } }
      },
      yAxis: {
        type: 'value',
        name: '数值',
        nameTextStyle: { fontWeight: 'bold' },
        splitLine: { lineStyle: { type: 'dashed', color: '#ddd' } }
      },
      series
    }
  }

  // ==================== 雷达图（多色版） ====================
  const getRadarChartOptions = () => {
    const cities = selectedCities.value
    const fields = selectedFields.value
    const sources = selectedSource.value

    if (!cities.length || !fields.length || !sources.length) {
      return { title: { text: '请至少选择一个城市、一个字段和一个数据来源' } }
    }

    let targetDate = extraConfig.barDate.value
    targetDate = getTargetDate(targetDate)

    if (!targetDate) {
      return { title: { text: '无有效日期数据' } }
    }

    const dataForDate = daysList.value.filter(
      item => convertToLocalDate(item.forecast_time) === targetDate
    )
    if (!dataForDate.length) {
      return { title: { text: `所选日期 ${targetDate} 无数据` } }
    }

    const manualRanges = extraConfig.radarRanges?.value || {}

    const indicator = fields.map(field => {
      const manual = manualRanges[field]
      if (manual?.min != null && manual?.max != null) {
        return {
          name: getFieldLabel(field),
          min: manual.min,
          max: manual.max,
        }
      }

      const values = dataForDate
        .map(item => item[field])
        .filter(v => v != null)
      if (values.length === 0) {
        return { name: getFieldLabel(field), min: 0, max: 100 }
      }

      let min = Math.min(...values)
      let max = Math.max(...values)

      if (min === max) {
        max += 10
        min -= 10
      }
      const range = max - min
      max += range * 0.5
      min -= range * 0.5

      // 可选：对 min/max 四舍五入，避免显示过长小数（非必须，因为 axisLabel 已控制显示）
      // min = parseFloat(min.toFixed(2))
      // max = parseFloat(max.toFixed(2))

      return { name: getFieldLabel(field), min, max }
    })

    const radarColors = ['#5470c6', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
    const seriesData = []
    for (const city of cities) {
      for (const source of sources) {
        const item = dataForDate.find(d => d.city === city && d.source === source)
        if (!item) continue
        const values = fields.map(field => item[field] ?? 0)
        const colorIdx = seriesData.length % radarColors.length
        seriesData.push({
          name: `${city} (${source})`,
          value: values,
          itemStyle: {
            color: radarColors[colorIdx],
            borderColor: radarColors[colorIdx],
            borderWidth: 2
          },
          lineStyle: {
            color: radarColors[colorIdx],
            width: 2
          },
          areaStyle: {
            color: radarColors[colorIdx],
            opacity: 0.2
          }
        })
      }
    }

    if (seriesData.length === 0) {
      return { title: { text: '无匹配数据' } }
    }

    return {
      backgroundColor: '#fafafa',
      title: { text: `天气指标雷达图（${targetDate}）`, left: 'left', textStyle: { fontWeight: 'bold', fontSize: 16 } },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderWidth: 0,
        borderRadius: 8,
        textStyle: { color: '#fff' }
      },
      legend: {
        data: seriesData.map(s => s.name),
        top: 20,
        left: 'center',
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 8,
        padding: [4, 12]
      },
      radar: {
        indicator,
        center: ['50%', '50%'],
        radius: '65%',
        name: { textStyle: { fontSize: 12, fontWeight: 'bold' } },
        splitArea: {
          areaStyle: {
            color: ['rgba(84,112,198,0.05)', 'rgba(84,112,198,0.02)']
          }
        },
        axisLine: { lineStyle: { color: '#aaa' } },
        axisLabel: {
          show: true,
          fontWeight: 500,
          formatter: (value) => value.toFixed(1)  // 保留一位小数，解决超多小数问题
        }
      },
      series: [
        {
          type: 'radar',
          data: seriesData,
        }
      ]
    }
  }

  // ==================== 散点图 ====================
  const getScatterChartOptions = () => {
    const xField = extraConfig.scatterX.value
    const yField = extraConfig.scatterY.value

    if (!xField || !yField) {
      return { title: { text: '请选择 X 轴和 Y 轴字段' } }
    }

    const cities = selectedCities.value
    const sources = selectedSource.value

    if (!cities.length || !sources.length) {
      return { title: { text: '请至少选择一个城市和一个数据来源' } }
    }

    const series = []
    const colors = ['#5470c6', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']

    for (const city of cities) {
      for (const source of sources) {
        const cityData = daysList.value.filter(
          d => d.city === city && d.source === source
        )
        if (cityData.length === 0) continue

        const data = cityData.map(d => [d[xField], d[yField]])
        series.push({
          name: `${city} (${source})`,
          type: 'scatter',
          data,
          symbolSize: 10,
          emphasis: { scale: true },
          itemStyle: { color: colors[series.length % colors.length], shadowBlur: 5, shadowColor: 'rgba(0,0,0,0.2)' }
        })
      }
    }

    if (series.length === 0) {
      return { title: { text: '无有效数据' } }
    }

    return {
      backgroundColor: '#fafafa',
      title: {
        text: `${getFieldLabel(xField)} vs ${getFieldLabel(yField)}`,
        left: 'left',
        textStyle: { fontWeight: 'bold', fontSize: 16 }
      },
      tooltip: {
        trigger: 'item',
        formatter: params =>
          `${params.seriesName}<br/>${getFieldLabel(xField)}: ${params.value[0]}<br/>${getFieldLabel(yField)}: ${params.value[1]}`,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderWidth: 0,
        borderRadius: 8,
        shadowBlur: 10
      },
      xAxis: {
        name: getFieldLabel(xField),
        nameLocation: 'middle',
        nameGap: 35,
        nameTextStyle: { fontWeight: 'bold' },
        axisLine: { lineStyle: { width: 2 } },
        splitLine: { lineStyle: { type: 'dashed', color: '#ddd' } }
      },
      yAxis: {
        name: getFieldLabel(yField),
        nameLocation: 'middle',
        nameGap: 35,
        nameTextStyle: { fontWeight: 'bold' },
        axisLine: { lineStyle: { width: 2 } },
        splitLine: { lineStyle: { type: 'dashed', color: '#ddd' } }
      },
      series,
      grid: { backgroundColor: '#fff', borderWidth: 0, containLabel: true }
    }
  }

  // ==================== 热力图 ====================
  const getHeatmapOptions = () => {
    const city = extraConfig.heatmapCity.value
    const field = extraConfig.heatmapField.value
    const source = extraConfig.heatmapSource.value

    if (!city || !field || !source) {
      return { title: { text: '请选择城市、字段和数据来源' } }
    }

    const cityData = daysList.value.filter(
      d => d.city === city && d.source === source
    )
    if (!cityData.length) {
      return { title: { text: `所选城市 ${city} 无数据` } }
    }

    const data = cityData.map(item => [item.forecast_time, item[field]])
    const dates = cityData.map(d => d.forecast_time).sort(compareDate)
    const startDate = dates[0]
    const endDate = dates[dates.length - 1]

    const values = cityData.map(d => d[field]).filter(v => v != null)
    const minVal = Math.min(...values)
    const maxVal = Math.max(...values)

    return {
      backgroundColor: '#fafafa',
      title: {
        text: `${city} (${source}) - ${getFieldLabel(field)} 日历热力图`,
        left: 'left',
        textStyle: { fontWeight: 'bold', fontSize: 16 }
      },
      tooltip: {
        trigger: 'item',
        formatter: params => `${params.value[0]}<br/>值: ${params.value[1]}`,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderWidth: 0,
        borderRadius: 8
      },
      visualMap: {
        min: minVal,
        max: maxVal,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 10,
        inRange: { color: ['#c6e48b', '#7cbc6e', '#239a3b', '#196127'] },
        textStyle: { fontWeight: 'bold' }
      },
      calendar: {
        range: [startDate, endDate],
        cellSize: ['auto', 30],
        yearLabel: { show: true, fontWeight: 'bold' },
        monthLabel: { show: true, fontWeight: 'bold' },
        dayLabel: { show: true, fontWeight: 'bold' },
        itemStyle: { borderWidth: 0.5, borderColor: '#fff' }
      },
      series: {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data,
        emphasis: { scale: true }
      }
    }
  }

  // ==================== 主计算属性 ====================
  const options = computed(() => {
    if (!selectedCities.value.length && !selectedFields.value.length) {
      return null
    }

    const type = chartType.value
    switch (type) {
      case 'line':
        return getLineChartOptions()
      case 'bar':
        return getBarChartOptions()
      case 'radar':
        return getRadarChartOptions()
      case 'scatter':
        return getScatterChartOptions()
      case 'heatmap':
        return getHeatmapOptions()
      default:
        return getLineChartOptions()
    }
  })

  return { chartOptions: options }
}
