<!-- eslint-disable no-unused-vars -->
<template>
  <div ref="chartContainer" class="echarts-wrapper" :style="{ height: containerHeight }">
    <v-chart
      v-if="!loading"
      ref="chart"
      :option="options"
      :theme="theme"
      :autoresize="autoResize"
      :init-options="initOptions"
      @click="handleClick"
      @dblclick="handleDblclick"
      @mouseover="handleMouseover"
      @mouseout="handleMouseout"
      @globalout="handleGlobalout"
      @rendered="handleRendered"
      @legendselectchanged="handleLegendSelectChanged"
    />
    <div v-else class="loading-overlay">
      <slot name="loading">
        <span>加载中...</span>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
// import ECharts from 'vue-echarts'
import VChart from 'vue-echarts'
import * as echarts from 'echarts'
import { CalendarComponent } from 'echarts/components'
import { TooltipComponent } from 'echarts/components';
echarts.use([CalendarComponent, TooltipComponent]);
// import { useResizeObserver } from '@vueuse/core' // 可选，用于更精确的尺寸监听
echarts.use([CalendarComponent])
const props = defineProps({
  // ECharts 配置项
  options: {
    type: Object,
    required: true,
  },
  // 主题
  theme: {
    type: [String, Object],
    default: '',
  },
  // 是否自动调整尺寸（监听容器大小变化）
  autoResize: {
    type: Boolean,
    default: true,
  },
  // 初始化选项（如 renderer, devicePixelRatio 等）
  initOptions: {
    type: Object,
    default: () => ({}),
  },
  // 容器高度，支持 css 单位
  height: {
    type: String,
    default: '400px',
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false,
  },
  // 是否显示加载遮罩
  showLoadingMask: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'click',
  'dblclick',
  'mouseover',
  'mouseout',
  'globalout',
  'rendered',
  'updated',
  'legendselectchanged',
])

const chartContainer = ref(null)
const chart = ref(null)

// 计算容器高度（支持动态传入）
const containerHeight = computed(() => props.height)

// 合并选项（可以在这里做默认配置合并）
// const computedOptions = computed(() => {
//   // 如果有默认的全局配置，可以在这里合并
//   // 例如：合并默认的 tooltip、grid 等
//   return props.options
// })

// // 监听 options 变化，手动更新图表（vue-echarts 的 option 是响应式的，但有时需要强制更新）
// watch(
//   computedOptions,
//   (newVal) => {
//     if (chart.value) {
//       chart.value.setOption(newVal, { notMerge: false })
//       emit('updated')
//     }
//   },
//   { deep: true }
// )


// 组件挂载后，如果 autoResize 为 true，且容器存在，监听 resize
onMounted(() => {
  if (props.autoResize && chartContainer.value) {
    // 使用 ResizeObserver 监听容器大小变化
    const resizeObserver = new ResizeObserver(() => {
      if (chart.value) {
        chart.value.resize()
      }
    })
    resizeObserver.observe(chartContainer.value)
    // 保存以便清理
    window.__resizeObserver = resizeObserver
  }
})

// 清理
onBeforeUnmount(() => {
  if (window.__resizeObserver) {
    window.__resizeObserver.disconnect()
    delete window.__resizeObserver
  }
})

// 事件转发
const handleClick = (params) => emit('click', params)
const handleDblclick = (params) => emit('dblclick', params)
const handleMouseover = (params) => emit('mouseover', params)
const handleMouseout = (params) => emit('mouseout', params)
const handleGlobalout = (params) => emit('globalout', params)
const handleRendered = (params) => emit('rendered', params)
const handleLegendSelectChanged = (params) => emit('legendselectchanged', params)

// 暴露方法给父组件（例如手动 resize、获取实例等）
defineExpose({
  chart,
  resize: () => {
    if (chart.value) chart.value.resize()
  },
  getInstance: () => chart.value,
  dispatchAction: (action) => chart.value?.dispatchAction(action)
})
</script>

<style scoped>
.echarts-wrapper {
  position: relative;
  width: 100%;
}
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 10;
}
</style>
