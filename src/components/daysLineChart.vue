<template>
  <div class="temperature-chart">
    <div ref="chartDiv" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick} from 'vue';
import echarts from '@/utils/echarts';
import {useWeatherDaysStore} from '@/store/index'

const daysStore = useWeatherDaysStore()
const weekDays = computed(() => daysStore.days.map(item => item.weekDay))
const processWeekDays = computed(() => {
  const days = [...weekDays.value]
  days[0] = '今天'
  return days
})
const maxTempList = computed(() => daysStore.days.map(item => parseFloat(item.tempMax)))
const minTempList = computed(() => daysStore.days.map(item => parseFloat(item.tempMin)))
const maxTemp = computed(() => Math.max(...maxTempList.value))
const minTemp = computed(() => Math.min(...minTempList.value))


// 获取DOM引用
const chartDiv = ref(null);
let myChart = null;

// 气温数据
const temperatureData = computed(() => ({
  days: processWeekDays.value,
  maxTemp: maxTempList.value,
  minTemp: minTempList.value
}));

// 图表配置
const getChartOption = () => ({
  // 标题配置
  title: {
    text: '一周气温变化',
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
    data: ['最高气温', '最低气温'],
    top: 10,
    left: 25,
  },
  // 网格配置
  grid: {
    left: 25,
    right: 15,
    top: 10,
    bottom: 0,
    containLabel: true
  },
  // X轴配置
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: temperatureData.value.days,
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
    name: '温度(°C)',
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
  // 系列配置 - 从左到右的渐变效果
  series: [
    {
      name: '最高气温',
      type: 'line',
      data: temperatureData.value.maxTemp,
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
    {
      name: '最低气温',
      type: 'line',
      data: temperatureData.value.minTemp,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3,
        color: '#4dabf7'
      },
      itemStyle: {
        color: '#4dabf7'
      },
      label: {
        show: true,
        position: 'bottom',
        formatter: '{c}°C',
        color: '#4dabf7',
        fontSize: 12,
        fontWeight: 'bold'
      },
      // areaStyle: {
      //   color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [ // 修改为水平渐变
      //     { offset: 0, color: 'rgba(77, 171, 247, 0.4)' }, // 左侧浅色
      //     { offset: 0.5, color: 'rgba(77, 171, 247, 0.7)' }, // 中间深色
      //     { offset: 1, color: 'rgba(77, 171, 247, 0.4)' } // 右侧浅色
      //   ])
      // },
      smooth: true
    }
  ]
});
onMounted(() => {
  // 使用 nextTick 确保 DOM 已经渲染
  nextTick(() => {
    myChart = echarts.init(chartDiv.value);
    if (temperatureData.value.days && temperatureData.value.days.length > 0) {
      myChart.setOption(getChartOption());
    }
    window.addEventListener('resize', handleResize);
  });
});

const handleResize = () => {
  myChart && myChart.resize();
};

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
