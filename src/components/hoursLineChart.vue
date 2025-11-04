<template>
  <div class="temperature-chart">
    <div ref="chartDiv" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import * as echarts from 'echarts';
import { useWeatherHoursStore } from '@/store/index'

const hoursStore = useWeatherHoursStore()
const time = computed(() => hoursStore.hours.map(item => item.fxTime))
const tempList = computed(() => hoursStore.hours.map(item => item.temp))
const rainList = computed(() => hoursStore.hours.map(item => item.pop))
const maxTemp = computed(() => Math.max(...tempList.value))
const minTemp = computed(() => Math.min(...tempList.value))
// 获取DOM引用
const chartDiv = ref(null);
let myChart = null;

// 气温数据
const temperatureData = computed(() => ({
  time: time.value,
  temp: tempList.value,
  rain: rainList.value
}));

// 图表配置
const getChartOption = () => {
  const totalHours = temperatureData.value.time.length;
  const initialEnd = totalHours > 8 ? Math.floor(8 / totalHours * 100) : 100;
  return {
    // 标题配置
    title: {
      text: '一天气温变化',
      top: '0px',
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold'
      }
    },
    // 提示框配置
    tooltip: {
      trigger: 'axis',
      length: 60,
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#ffc107',
          width: 1,
          type: 'dashed',
          opacity: 0.7
        }
      },
      formatter: function (params) {
        let result = `${params[0].axisValue}<br/>`;
        params.forEach(param => {
          const color = param.color;
          result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:${color}"></span>`;
          result += `${param.seriesName}: ${param.value}°C<br/>`;
        });
        return result;
      }
    },
    // 图例配置
    legend: {
      data: ['气温'],
      top: 10,
      left: 25,
    },
    // 网格配置
    grid: {
      left: 25,
      right: 15,
      top: 10,
      bottom: -5,
      containLabel: true
    },
    // X轴配置
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: temperatureData.value.time,
      axisLine: {
        lineStyle: {
          color: '#999'
        },
        show: false
      },
      // 不显示刻度
      axisTick: {
        show: false
      },
      axisLabel: {
        interval: 0,
        rotate: 15, // 旋转30度
        margin: 10 // 增加边距
      }

    },
    // Y轴配置
    // Y轴配置 - 隐藏Y轴
    yAxis: {
      type: 'value',
      name: '温度℃',
      min: minTemp.value - 5,
      max: maxTemp.value + 5,
      show: false, // 隐藏Y轴
      axisLine: {
        show: false // 隐藏轴线
      },
      axisTick: {
        show: false // 隐藏刻度
      },
      axisLabel: {
        show: false // 隐藏标签
      },
      splitLine: {
        show: false // 隐藏网格线
      }
    },
     // 数据区域缩放组件
    dataZoom: [
      // {
      //   type: 'slider', // 滑动条型数据区域缩放组件
      //   show: true,
      //   xAxisIndex: [0],
      //   bottom: 20, // 距离容器底部的距离
      //   height: 20, // 组件高度
      //   start: 0, // 初始起始位置
      //   end: initialEnd, // 初始结束位置
      //   handleSize: '80%', // 控制手柄大小
      //   handleStyle: {
      //     color: '#ffc107'
      //   },
      //   textStyle: {
      //     color: '#666'
      //   },
      //   fillerColor: 'rgba(255, 193, 7, 0.2)', // 选中区域填充颜色
      //   borderColor: '#ddd'
      // },
      {
        type: 'inside', // 内置型数据区域缩放组件
        xAxisIndex: [0],
        start: 0,
        end: initialEnd,
        zoomOnMouseWheel: false, // 关闭鼠标滚轮缩放
        moveOnMouseMove: true, // 开启拖拽平移
        moveOnMouseWheel: true // 开启鼠标滚轮平移
      }
    ],
    // 系列配置 - 从左到右的渐变效果
    series: [
      {
        name: '气温',
        type: 'line',
        data: temperatureData.value.temp,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#ffc107'
        },
        itemStyle: {
          color: '#ffc107'
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}°C',
          color: '#ffc107',
          fontSize: 12,
          fontWeight: 'bold'
        },
        // areaStyle: {
        //   color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [ // 修改为水平渐变 (x1, y1, x2, y2)
        //     { offset: 0, color: 'rgba(255, 107, 107, 0.4)' }, // 左侧浅色
        //     { offset: 0.5, color: 'rgba(255, 107, 107, 0.7)' }, // 中间深色
        //     { offset: 1, color: 'rgba(255, 107, 107, 0.4)' } // 右侧浅色
        //   ])
        // },
        smooth: true,

      },
    ]
  }
};


// 在组件挂载后初始化图表
onMounted(() => {
  // 初始化图表
  myChart = echarts.init(chartDiv.value);
  // 只有在有数据时才设置图表
  if (temperatureData.value.time && temperatureData.value.time.length > 0) {
    myChart.setOption(getChartOption());
  }

  // 窗口大小变化时重绘图表
  window.addEventListener('resize', handleResize);
});

// 处理窗口大小变化
const handleResize = () => {
  myChart && myChart.resize();
};
// 监听 temperatureData 变化，当有数据时更新图表
watch(temperatureData, (newData) => {
  if (newData.time && newData.time.length > 0 && myChart) {
    myChart.setOption(getChartOption());
  }
}, { deep: true });
// 组件卸载前清理资源
onUnmounted(() => {
  if (myChart) {
    window.removeEventListener('resize', handleResize);
    myChart.dispose();
    myChart = null;
  }
});
</script>

<style scoped>
.temperature-chart {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 10px;
  border-radius: 8px;
  background: transparent;
}

.chart-container {
  width: 100%;
  height: 310px;
}
</style>
