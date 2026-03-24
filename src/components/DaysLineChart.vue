<template>
  <div class="page-container">
    <EChartsWrapper
      :options="lineChartOptions"
      height="500px"
      :loading="loading"
      @click="handleChartClick"
    />
  </div>
</template>

<script setup>
// import { ref, reactive } from 'vue'
// 如果未全局注册，需在此处导入组件
// import EChartsWrapper from '@/components/EChartsWrapper.vue'
import { ref, onMounted, onUnmounted, reactive} from 'vue'
import { weatherApi } from '../apis/weatherApi'
import { emitter } from '../utils/eventBus'
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import dayjs from 'dayjs';
dayjs.extend(utc);
dayjs.extend(timezone);

function convertToLocalTime(utcTimeStr) {
  // 解析 UTC 时间，转换为东八区时间，并格式化为 HH:mm
  return dayjs(utcTimeStr).tz('Asia/Shanghai').format('HH:mm');
}

const hoursList = ref([]) //和风数据
const hoursList1 = ref([]) // ti数据
const loading = ref(false)
const error = ref(null)
const selectedCity = ref('广州')

const fetchData = async (city) => {
  const cityToUse = city || selectedCity.value
  loading.value = true
  error.value = null
  try {
    const response = await weatherApi.getWeatherNowInfo(
      cityToUse,
      undefined,
      'QWeather'
    )
    const response1 = await weatherApi.getWeatherNowInfo(
      cityToUse,
      undefined,
      'tomorrow.io'
    )
    const result = response.data
    const result1 = response1.data
    if (result.code === 200 || result1.code === 200) {
      hoursList.value = result.data
      hoursList1.value = result1.data
      updateLineChartOptions(hoursList.value,hoursList1.value)
      
      selectedCity.value = cityToUse   // 更新当前城市
    } else {
      error.value = result.message
    }
  } catch (err) {
    error.value = err.message || '网络请求失败'
  } finally {
    loading.value = false
  }
}

// 定义事件处理函数
const handleCityChange = (cityName) => {
  if (cityName) {
    fetchData(cityName)
    selectedCity.value = cityName
  }
}


// 双折线图的配置
const lineChartOptions = reactive({
  title: {
    text: '小时气温趋势',
    left: 'left'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  },
  legend: {
    data: ['产品 A', '产品 B'],
    top: 30,
    left: 'center'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: []
  },
  yAxis: {
    type: 'value',
    name: '摄氏度'
  },
  series: [
    {
      name: '和风天气',
      type: 'line',
      data: [],
      smooth: true,          // 平滑曲线
      lineStyle: { width: 2 },
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: { color: '#5470c6' }
    },
    {
      name: 'tomorrow.io',
      type: 'line',
      data: [],
      smooth: true,
      lineStyle: { width: 2 },
      symbol: 'diamond',
      symbolSize: 8,
      itemStyle: { color: '#fac858' }
    }
  ]
})

// 图表点击事件处理
const handleChartClick = (params) => {
  console.log('图表被点击：', params)
}
function updateLineChartOptions(data,data1) {
  // lineChartOptions.xAxis.data = data.map(item => convertToLocalTime(item.forecast_time))
  lineChartOptions.xAxis.data = data1.map(item => convertToLocalTime(item.forecast_time))
  lineChartOptions.series[0].data = data.map(item => item.temperature)
  lineChartOptions.series[1].data = data1.map(item => item.temperature)

}
updateLineChartOptions(hoursList.value,hoursList1.value)
// 生命周期：注册监听器
onMounted(() => {
  emitter.on('cityName', handleCityChange)
  // 初始加载默认城市的数据
  fetchData()
})

// 生命周期：移除监听器，防止内存泄漏
onUnmounted(() => {
  emitter.off('cityName', handleCityChange)
})
</script>

<style scoped>
.page-container {
  margin-top: 16px;
  padding: 20px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.25s ease, transform 0.25s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  border: 1px solid #f0f2f5;
}
</style>