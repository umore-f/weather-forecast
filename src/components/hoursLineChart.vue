<template>
  <div class="temperature-chart mbe-weather-widget">
    <div ref="chartDiv" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import echarts from '@/utils/echarts';
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

// MBE风格配色
const mbeColors = {
  temp: '#FF9E44',     // 橙色
  rain: '#36CFC9',     // 青色
  background: '#FFF9F0', // 浅米色背景
  text: '#5A5A5A',     // 深灰色文字
  border: '#000000'     // 黑色边框
};

// 图表配置
const getChartOption = () => {
  const totalHours = temperatureData.value.time.length;
  const initialEnd = totalHours > 8 ? Math.floor(8 / totalHours * 100) : 100;

  return {
    backgroundColor: mbeColors.background,
    // 标题配置
    title: {
      text: '24小时气温变化',
      top: '10px',
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: mbeColors.text,
        textShadow: '2px 2px 0 rgba(255,255,255,0.8)'
      }
    },
    // 提示框配置 - MBE风格
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#FFF',
      borderColor: mbeColors.border,
      borderWidth: 2,
      textStyle: {
        color: mbeColors.text,
        fontSize: 12,
        fontFamily: "'Fredoka One', 'Balsamiq Sans', cursive"
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: mbeColors.temp,
          width: 2,
          type: 'solid'
        }
      },
      formatter: function (params) {
        let result = `<div style="font-weight:bold;margin-bottom:5px;">${params[0].axisValue}</div>`;
        params.forEach(param => {
          const color = param.color;
          const unit = param.seriesName === '气温' ? '°C' : '%';
          result += `<div style="display:flex;align-items:center;margin:3px 0;">
            <span style="display:inline-block;margin-right:8px;border-radius:50%;width:12px;height:12px;background-color:${color};border:1.5px solid #000"></span>
            <span>${param.seriesName}: <strong>${param.value}${unit}</strong></span>
          </div>`;
        });
        return result;
      }
    },
    // 图例配置 - MBE风格
    legend: {
      data: ['气温', '降雨概率'],
      top: -5,
      left: 'start',
      orient: 'horizontal',
      itemWidth: 16,
      itemHeight: 16,
      itemGap: 25,
      textStyle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: mbeColors.text,
        fontFamily: "'Fredoka One', 'Balsamiq Sans', cursive",
        textShadow: '1px 1px 0 rgba(255,255,255,0.8)'
      },
      itemStyle: {
        borderWidth: 1.5,
        borderColor: mbeColors.border
      },
      formatter: function (name) {
        const unit = name === '气温' ? ' (°C)' : ' (%)';
        return name + unit;
      }
    },
    // 网格配置
    grid: {
      left: 15,
      right: 15,
      top: 55,
      bottom: 5,
      containLabel: true
    },
    // X轴配置 - MBE风格
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: temperatureData.value.time,
      axisLine: {
        lineStyle: {
          color: mbeColors.border,
          width: 2
        }
      },
      axisTick: {
        show: true,
        length: 6,
        lineStyle: {
          color: mbeColors.border,
          width: 2
        }
      },
      axisLabel: {
        interval: 0,
        rotate: 0,
        color: mbeColors.text,
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: "'Fredoka One', 'Balsamiq Sans', cursive",
        margin: 10,
        textShadow: '1px 1px 0 rgba(255,255,255,0.8)'
      }
    },
    // Y轴配置 - MBE风格
    yAxis: [{
      type: 'value',
      name: '温度℃',
      nameTextStyle: {
        color: mbeColors.text,
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: "'Fredoka One', 'Balsamiq Sans', cursive"
      },
      min: minTemp.value - 3,
      max: maxTemp.value + 3,
      axisLine: {
        show: true,
        lineStyle: {
          color: mbeColors.border,
          width: 2
        }
      },
      axisTick: {
        show: true,
        length: 6,
        lineStyle: {
          color: mbeColors.border,
          width: 2
        }
      },
      axisLabel: {
        color: mbeColors.text,
        fontSize: 11,
        fontWeight: 'bold',
        fontFamily: "'Fredoka One', 'Balsamiq Sans', cursive",
        textShadow: '1px 1px 0 rgba(255,255,255,0.8)'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0,0,0,0.1)',
          width: 1,
          type: 'dashed'
        }
      }
    },
    {
      type: 'value',
      name: '降雨概率%',
      nameTextStyle: {
        color: mbeColors.text,
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: "'Fredoka One', 'Balsamiq Sans', cursive"
      },
      min: 0,
      max: 100,
      position: 'right',
      axisLine: {
        show: true,
        lineStyle: {
          color: mbeColors.border,
          width: 2
        }
      },
      axisTick: {
        show: true,
        length: 6,
        lineStyle: {
          color: mbeColors.border,
          width: 2
        }
      },
      axisLabel: {
        color: mbeColors.text,
        fontSize: 11,
        fontWeight: 'bold',
        fontFamily: "'Fredoka One', 'Balsamiq Sans', cursive",
        textShadow: '1px 1px 0 rgba(255,255,255,0.8)',
        formatter: '{value}%'
      },
      splitLine: {
        show: false
      }
    }],
    // 数据区域缩放组件
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0],
        start: 0,
        end: initialEnd,
        zoomOnMouseWheel: false,
        moveOnMouseMove: true,
        moveOnMouseWheel: true
      }
    ],
    // 系列配置 - MBE风格
    series: [
      {
        name: '气温',
        type: 'line',
        data: temperatureData.value.temp,
        symbol: 'circle',
        symbolSize: 12,
        lineStyle: {
          width: 4,
          color: mbeColors.temp,
          shadowBlur: 8,
          shadowColor: mbeColors.temp
        },
        itemStyle: {
          color: mbeColors.temp,
          borderWidth: 2,
          borderColor: mbeColors.border,
          shadowBlur: 5,
          shadowColor: 'rgba(0,0,0,0.2)'
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}°C',
          color: mbeColors.temp,
          fontSize: 12,
          fontWeight: 'bold',
          fontFamily: "'Fredoka One', 'Balsamiq Sans', cursive",
          backgroundColor: 'rgba(255,255,255,0.8)',
          borderColor: mbeColors.border,
          borderWidth: 1,
          borderRadius: 8,
          padding: [4, 6],
          textShadow: '1px 1px 0 rgba(255,255,255,0.8)'
        },
        smooth: true,
        z: 2
      },
      {
        name: '降雨概率',
        type: 'bar',
        data: temperatureData.value.rain,
        yAxisIndex: 1,
        barWidth: '60%',
        itemStyle: {
          color: mbeColors.rain,
          borderWidth: 2,
          borderColor: mbeColors.border,
          borderRadius: [4, 4, 0, 0],
          shadowBlur: 5,
          shadowColor: 'rgba(0,0,0,0.2)'
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          color: mbeColors.rain,
          fontSize: 11,
          fontWeight: 'bold',
          fontFamily: "'Fredoka One', 'Balsamiq Sans', cursive",
          textShadow: '1px 1px 0 rgba(255,255,255,0.8)'
        },
        z: 1
      }
    ]
  };
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
  padding: 15px;
  margin-top: 15px;
}

.mbe-weather-widget {
  background: linear-gradient(160deg, #FFF9F0 0%, #FFF0E0 100%);
  border: 3px solid #000;
  border-radius: 25px;
  box-shadow:
    4px 4px 0 #000,
    inset 3px 3px 0 rgba(255, 255, 255, 0.5);
  font-family: 'Fredoka One', 'Balsamiq Sans', 'Comic Sans MS', cursive;
  position: relative;
  overflow: hidden;
}

.chart-container {
  width: 100%;
  height: 300px;
}

/* 添加MBE装饰元素 */
.mbe-weather-widget::before {
  content: '';
  position: absolute;
  top: 15px;
  right: 20px;
  width: 25px;
  height: 25px;
  background: #FFD700;
  border: 2px solid #000;
  border-radius: 50%;
  box-shadow: 2px 2px 0 #000;
  z-index: 1;
}

.mbe-weather-widget::after {
  content: '';
  position: absolute;
  bottom: 15px;
  left: 20px;
  width: 20px;
  height: 20px;
  background: #4DABF7;
  border: 2px solid #000;
  border-radius: 50%;
  box-shadow: 2px 2px 0 #000;
  z-index: 1;
}
</style>
