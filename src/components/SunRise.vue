<template>
  <div class="simple-sun-arc">
    <div ref="chartDiv" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import echarts from '@/utils/echarts';

const chartDiv = ref(null);
let myChart = null;

const sunData = ref({
  sunrise: '06:30',
  sunset: '18:45',
  current: '14:20'
});

const timeToAngle = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  const startMinutes = 6 * 60;
  const endMinutes = 18 * 60;
  const range = endMinutes - startMinutes;

  const progress = (totalMinutes - startMinutes) / range;
  return Math.max(0, Math.min(180, progress * 180));
};

const getChartOption = () => {
  const sunriseAngle = timeToAngle(sunData.value.sunrise);
  const sunsetAngle = timeToAngle(sunData.value.sunset);
  const currentAngle = timeToAngle(sunData.value.current);

  return {
    backgroundColor: 'transparent',
    polar: {
      center: ['50%', '50%'],
      radius: '80%'
    },
    angleAxis: {
      min: 0,
      max: 180,
      startAngle: 90,
      clockwise: true,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false
      },
      splitLine: {
        show: false
      }
    },
    radiusAxis: {
      min: 0,
      max: 1,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false
      },
      splitLine: {
        show: false
      }
    },
    series: [
      // 背景弧线
      {
        type: 'line',
        coordinateSystem: 'polar',
        symbol: 'none',
        lineStyle: {
          color: 'rgba(200, 200, 200, 0.3)',
          width: 8
        },
        data: Array.from({length: 181}, (_, i) => [i, 1]),
        z: 1
      },
      // 白天时段弧线
      {
        type: 'line',
        coordinateSystem: 'polar',
        symbol: 'none',
        lineStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#FF9800' },
            { offset: 0.5, color: '#FFC107' },
            { offset: 1, color: '#FF5722' }
          ]),
          width: 8
        },
        data: Array.from(
          {length: Math.ceil(sunsetAngle - sunriseAngle) + 1},
          (_, i) => [sunriseAngle + i, 1]
        ),
        z: 2
      },
      // 日出标记
      {
        type: 'scatter',
        coordinateSystem: 'polar',
        symbol: 'circle',
        symbolSize: 10,
        itemStyle: {
          color: '#4CAF50'
        },
        data: [[sunriseAngle, 1]],
        z: 3
      },
      // 日落标记
      {
        type: 'scatter',
        coordinateSystem: 'polar',
        symbol: 'circle',
        symbolSize: 10,
        itemStyle: {
          color: '#F44336'
        },
        data: [[sunsetAngle, 1]],
        z: 3
      },
      // 当前太阳位置
      {
        type: 'scatter',
        coordinateSystem: 'polar',
        symbol: 'circle',
        symbolSize: 16,
        itemStyle: {
          color: '#FFC107',
          borderColor: '#FFF',
          borderWidth: 2
        },
        data: [[currentAngle, 1]],
        z: 4
      }
    ]
  };
};

onMounted(() => {
  myChart = echarts.init(chartDiv.value);
  myChart.setOption(getChartOption());

  window.addEventListener('resize', handleResize);
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
.simple-sun-arc {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 10px;
}

.chart-container {
  width: 100%;
  height: 200px;
}
</style>
