<!-- src/components/BaseChart.vue -->
<template>
  <div
    v-if="!isSSR"
    :ref="chartRef"
    :style="{ width: width, height: height }"
  ></div>
  <div v-else class="ssr-placeholder">
    图表加载中...
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import echarts from '@/utils/echarts-config'

// 定义组件属性
const props = defineProps({
  // 图表配置选项
  options: {
    type: Object,
    required: true,
    default: () => ({})
  },
  // 图表宽度
  width: {
    type: String,
    default: '100%'
  },
  // 图表高度
  height: {
    type: String,
    default: '400px'
  },
  // 图表主题
  theme: {
    type: [String, Object],
    default: null
  },
  // 是否开启自动响应尺寸变化
  autoResize: {
    type: Boolean,
    default: true
  }
})

// 定义组件事件
const emit = defineEmits(['chart-mounted', 'chart-updated', 'chart-click'])

// 响应式变量
const chartRef = ref('chart-container')
const chartInstance = ref(null)
const isSSR = ref(typeof window === 'undefined')

// 初始化图表
const initChart = async () => {
  if (isSSR.value) return

  await nextTick()

  const dom = chartRef.value?.$el || chartRef.value
  if (!dom) return

  try {
    // 销毁已存在的实例
    if (chartInstance.value) {
      chartInstance.value.dispose()
    }

    // 创建新的图表实例
    chartInstance.value = echarts.init(dom, props.theme)

    // 设置图表配置
    chartInstance.value.setOption(props.options, true)

    // 绑定事件
    chartInstance.value.on('click', (params) => {
      emit('chart-click', params)
    })

    // 触发挂载事件
    emit('chart-mounted', chartInstance.value)

    // 监听窗口大小变化
    if (props.autoResize) {
      window.addEventListener('resize', handleResize)
    }
  } catch (error) {
    console.error('初始化图表失败:', error)
  }
}

// 处理窗口大小变化
const handleResize = () => {
  if (chartInstance.value) {
    chartInstance.value.resize()
  }
}

// 更新图表
const updateChart = (newOptions) => {
  if (chartInstance.value) {
    chartInstance.value.setOption(newOptions || props.options, true)
    emit('chart-updated', chartInstance.value)
  }
}

// 获取图表实例
const getChartInstance = () => {
  return chartInstance.value
}

// 导出方法给父组件使用
defineExpose({
  updateChart,
  getChartInstance,
  resize: handleResize
})

// 生命周期
onMounted(() => {
  isSSR.value = false
  initChart()
})

onUnmounted(() => {
  if (chartInstance.value) {
    // 移除事件监听
    if (props.autoResize) {
      window.removeEventListener('resize', handleResize)
    }
    // 销毁图表实例
    chartInstance.value.dispose()
    chartInstance.value = null
  }
})

// 监听属性变化
watch(
  () => props.options,
  (newOptions) => {
    updateChart(newOptions)
  },
  { deep: true }
)

watch(
  () => props.theme,
  () => {
    if (chartInstance.value) {
      chartInstance.value.dispose()
      initChart()
    }
  }
)
</script>

<style scoped>
.ssr-placeholder {
  text-align: center;
  padding: 20px;
  color: #999;
  background-color: #f5f5f5;
}
</style>
