<template>
  <div class="temperature-chart">
    <div ref="chartDiv" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed} from 'vue';
import * as echarts from 'echarts';
import { useWeatherStore } from '@/store/weather'
const weatherStore = useWeatherStore()
const weekdays = computed(()=>weatherStore.weatherDaysInfo.weekDay)



// 获取DOM引用
const chartDiv = ref(null);
let myChart = null;

// 模拟一周的气温数据
const temperatureData = {
  days: weekdays.value,
  maxTemp: [22, 25, 28, 30, 26, 24, 23],
  minTemp: [12, 15, 18, 20, 16, 14, 13]
};

// 在组件挂载后初始化图表
onMounted(() => {
  // 初始化图表
  myChart = echarts.init(chartDiv.value);

  // 图表配置
  const option = {
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
      top: '10%',
      left: 'center'
    },
    // 网格配置
    grid: {
      left: 0,
      right: 0,
      top: 10,
      bottom: 10,
      containLabel: true
    },
    // X轴配置
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: temperatureData.days,
      axisLine: {
        lineStyle: {
          color: '#999'
        }
      }
    },
    // Y轴配置
    yAxis: {
      type: 'value',
      name: '温度(°C)',
      min: 10,
      max: 35,
      axisLine: {
        lineStyle: {
          color: '#999'
        }
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#eee'
        }
      }
    },
    // 系列配置
    series: [
      {
        name: '最高气温',
        type: 'line',
        data: temperatureData.maxTemp,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#ff6b6b'
        },
        itemStyle: {
          color: '#ff6b6b'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 107, 107, 0.5)' },
            { offset: 1, color: 'rgba(255, 107, 107, 0.1)' }
          ])
        },
        smooth: true
      },
      {
        name: '最低气温',
        type: 'line',
        data: temperatureData.minTemp,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#4dabf7'
        },
        itemStyle: {
          color: '#4dabf7'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(77, 171, 247, 0.5)' },
            { offset: 1, color: 'rgba(77, 171, 247, 0.1)' }
          ])
        },
        smooth: true
      }
    ]
  };

  // 应用配置
  myChart.setOption(option);

  // 窗口大小变化时重绘图表
  window.addEventListener('resize', handleResize);
});

// 处理窗口大小变化
const handleResize = () => {
  myChart && myChart.resize();
};

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
  padding: 20px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.8);
  /* 半透明背景 */
  backdrop-filter: blur(5px);
  /* 毛玻璃效果 */
  box-shadow: inset 0 -3em 3em rgba(0, 0, 0, 0.1),
    0 0 0 2px rgb(190, 190, 190),
    0.3em 0.3em 1em rgba(0, 0, 0, 0.3);
}

.chart-container {
  width: 100%;
  height: 270px;
}
</style>
