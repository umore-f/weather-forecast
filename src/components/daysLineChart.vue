<template>
  <div class="temperature-chart mbe-weather-widget">
    <div ref="chartDiv" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import echarts from '@/utils/echarts';
import { useWeatherDaysStore } from '@/store/index'

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
const rainfall = computed(() => daysStore.days.map(item => item.precip))

// 获取DOM引用
const chartDiv = ref(null);
let myChart = null;

// 气温数据
const temperatureData = computed(() => ({
  days: processWeekDays.value,
  maxTemp: maxTempList.value,
  minTemp: minTempList.value,
  rain: rainfall.value,
}));

// MBE风格配色
const mbeColors = {
  maxTemp: '#FF9E44', // 橙色
  minTemp: '#4DABF7', // 蓝色
  rain: '#36CFC9',    // 青色
  background: '#FFF9F0', // 浅米色背景
  text: '#5A5A5A',    // 深灰色文字
  border: '#000000'    // 黑色边框
};

// 图表配置
const getChartOption = () => {
  const maxRainfall = Math.max(...temperatureData.value.rain);
  const rainMax = maxRainfall === 0 ? 10 : Math.max(10, Math.ceil(maxRainfall * 1.2));

  return {
    backgroundColor: mbeColors.background,
    // 标题配置
    title: {
      text: '七天气温变化',
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
          color: mbeColors.maxTemp,
          width: 2,
          type: 'solid'
        }
      },
      formatter: function (params) {
        let result = `<div style="font-weight:bold;margin-bottom:5px;">${params[0].axisValue}</div>`;
        params.forEach(param => {
          const color = param.color;
          let unit = '°C';
          if (param.seriesName === '降水量') {
            unit = 'mm';
          }
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
      data: ['最高气温', '最低气温', '降水量'],
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
      data: temperatureData.value.days,
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
        margin: 15,
        textShadow: '1px 1px 0 rgba(255,255,255,0.8)'
      }
    },
    // Y轴配置 - MBE风格
    yAxis: [{
      type: 'value',
      name: '温度(°C)',
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
      name: '降水量(mm)',
      nameTextStyle: {
        color: mbeColors.text,
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: "'Fredoka One', 'Balsamiq Sans', cursive"
      },
      min: 0,
      max: rainMax,
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
        textShadow: '1px 1px 0 rgba(255,255,255,0.8)'
      },
      splitLine: {
        show: false
      }
    }],
    // 系列配置 - MBE风格
    series: [
      {
        name: '最高气温',
        type: 'line',
        data: temperatureData.value.maxTemp,
        symbol: 'circle',
        symbolSize: 12,
        symbolKeepAspect: true,
        lineStyle: {
          width: 4,
          color: mbeColors.maxTemp,
          shadowBlur: 8,
          shadowColor: mbeColors.maxTemp
        },
        itemStyle: {
          color: mbeColors.maxTemp,
          borderWidth: 2,
          borderColor: mbeColors.border,
          shadowBlur: 5,
          shadowColor: 'rgba(0,0,0,0.2)'
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}°C',
          color: mbeColors.maxTemp,
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
        name: '最低气温',
        type: 'line',
        data: temperatureData.value.minTemp,
        symbol: 'circle',
        symbolSize: 12,
        lineStyle: {
          width: 4,
          color: mbeColors.minTemp,
          shadowBlur: 8,
          shadowColor: mbeColors.minTemp
        },
        itemStyle: {
          color: mbeColors.minTemp,
          borderWidth: 2,
          borderColor: mbeColors.border,
          shadowBlur: 5,
          shadowColor: 'rgba(0,0,0,0.2)'
        },
        label: {
          show: true,
          position: 'bottom',
          formatter: '{c}°C',
          color: mbeColors.minTemp,
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
        name: '降水量',
        type: 'bar',
        data: temperatureData.value.rain,
        yAxisIndex: 1,
        barWidth: '25%',
        itemStyle: {
          color: mbeColors.rain,
          borderWidth: 2,
          borderColor: mbeColors.border,
          borderRadius: [6, 6, 0, 0],
          shadowBlur: 5,
          shadowColor: 'rgba(0,0,0,0.2)'
        },
        label: {
          show: true,
          position: 'top',
          formatter: (params) => {
            return params.value > 0 ? params.value + 'mm' : '';
          },
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

onMounted(() => {
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
