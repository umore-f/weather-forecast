<template>
  <div class="temperature-chart">
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

// 图表配置
const getChartOption = () => {
  const totalHours = temperatureData.value.time.length;
  const initialEnd = totalHours > 8 ? Math.floor(8 / totalHours * 100) : 100;
  return {
    // 标题配置
    title: {
      text: '24小时气温变化',
      top: '10px',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    // 提示框配置
    // 提示框配置
    tooltip: {
      trigger: 'axis',
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
          const unit = param.seriesName === '气温' ? '°C' : '%';
          result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:${color}"></span>`;
          result += `${param.seriesName}: ${param.value}${unit}<br/>`;
        });
        return result;
      }
    },
    // 图例配置
    legend: {
      data: [
        {
          name: '气温',
          icon: 'circle',
          itemStyle: {
            color: '#ffc107'
          }
        },
        {
          name: '降雨概率',
          icon: 'rect',
          itemStyle: {
            color: '#1890ff'
          }
        }
      ],
      top: 15,
      left: 25,
      orient: 'horizontal', // 水平排列
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 20, // 图例间距
      textStyle: {
        fontSize: 12,
        color: '#666'
      },
      formatter: function (name) {
        // 为图例添加单位
        const unit = name === '气温' ? ' (°C)' : ' (%)';
        return name + unit;
      }
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
    yAxis: [{
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
    {
      // 右侧Y轴 - 降雨概率
      type: 'value',
      name: '降雨概率%',
      min: 0,
      max: 100,
      position: 'right',
      axisLine: {
        show: false,
        lineStyle: {
          color: '#1890ff'
        }
      },
      axisLabel: {
        show: false,
        color: '#1890ff',
        formatter: '{value}%'
      },
      splitLine: {
        show: false // 右侧Y轴不显示网格线
      }
    }],
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
        smooth: true,

      },
      {
        // 柱状图 - 降雨概率
        name: '降雨概率',
        type: 'bar',
        data: temperatureData.value.rain,
        yAxisIndex: 1, // 使用第二个Y轴（右侧）
        barWidth: '60%', // 柱子的宽度
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#1890ff' },
            { offset: 1, color: '#69c0ff' }
          ]),
          borderRadius: [2, 2, 0, 0] // 柱子上方圆角
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          color: '#1890ff',
          fontSize: 11
        },
        zlevel: 1 // 确保柱状图在折线图下方
      }
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
  border-radius: 15px;
  background: white;
  border: 2px solid #c3c6ce;
  margin-top: 15px;
}

.chart-container {
  width: 100%;
  height: 310px;
}
</style>
