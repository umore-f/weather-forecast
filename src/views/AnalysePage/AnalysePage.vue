<template>
  <div class="weather-chart-container">
    <!-- 控制栏 -->
    <div class="controls">
      <div class="control-group">
        <label>城市（最多选3个）</label>
        <div class="checkbox-group">
          <label v-for="city in cityOptions" :key="city.value">
            <input type="checkbox" :value="city.value" v-model="selectedCities"
              :disabled="selectedCities.length >= 3 && !selectedCities.includes(city.value)" />
            {{ city.label }}
          </label>
        </div>
      </div>

      <div class="control-group">
        <label>天气字段（最多选3个）</label>
        <div class="checkbox-group">
          <label v-for="field in fieldOptions" :key="field.value">
            <input type="checkbox" :value="field.value" v-model="selectedFields"
              :disabled="selectedFields.length >= 3 && !selectedFields.includes(field.value)" />
            {{ field.label }}
          </label>
        </div>
      </div>

      <div class="control-group">
        <label>时间颗粒度</label>
        <div class="radio-group">
          <label>
            <input type="radio" value="day" v-model="granularity" /> 天
          </label>
          <label>
            <input type="radio" value="hour" v-model="granularity" /> 小时
          </label>
        </div>
      </div>
    </div>

    <!-- 图表区域：使用封装的 EChartsWrapper -->
    <div class="chart-wrapper">
      <EChartsWrapper :options="chartOptions" height="400px" :loading="loading" @click="handleChartClick" />
      <div v-if="!hasValidSelection" class="no-data">请至少选择一个城市和一个字段</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { weatherApi } from '../../apis/weatherApi'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

// 工具函数：UTC 转东八区时间（仅时间）
// function convertToLocalTime(utcTimeStr) {
//   return dayjs(utcTimeStr).tz('Asia/Shanghai').format('HH:mm')
// }

// 工具函数：UTC 转东八区日期（仅日期）
function convertToLocalDate(utcTimeStr) {
  return dayjs(utcTimeStr).tz('Asia/Shanghai').format('YYYY/MM/DD')
}
// const hoursList = ref([]) //全部的小时数据
const daysList = ref([]) //全部的小时数据
// ---------- 配置 ----------
const cityOptions = [
  { label: '北京', value: '北京' },
  { label: '上海', value: '上海' },
  { label: '广州', value: '广州' },
  { label: '深圳', value: '深圳' },
  { label: '杭州', value: '杭州' },
  { label: '成都', value: '成都' },
  { label: '南京', value: '南京' },
  { label: '武汉', value: '武汉' },
  { label: '重庆', value: '重庆' },
  { label: '苏州', value: '苏州' },
  { label: '天津', value: '天津' },
  { label: '长沙', value: '长沙' },
  { label: '青岛', value: '青岛' },
  { label: '西安', value: '西安' },
  { label: '郑州', value: '郑州' },
  { label: '合肥', value: '合肥' },
  { label: '宁波', value: '宁波' },
  { label: '无锡', value: '无锡' },
  { label: '济南', value: '济南' },
  { label: '福州', value: '福州' },
  { label: '厦门', value: '厦门' },
  { label: '东莞', value: '东莞' },
  { label: '佛山', value: '佛山' },
  { label: '大连', value: '大连' },
  { label: '沈阳', value: '沈阳' },
  { label: '昆明', value: '昆明' },
  { label: '南昌', value: '南昌' },
  { label: '哈尔滨', value: '哈尔滨' },
  { label: '泉州', value: '泉州' },
  { label: '常州', value: '常州' }
];

const fieldOptions = [
  { label: '最高温度 (°C)', value: 'temp_max' },
  { label: '最低温度 (°C)', value: 'temp_min' },
  { label: '温度 (°C)', value: 'temp' },
  { label: '湿度 (%)', value: 'humidity' },
  { label: '风速 (km/h)', value: 'wind_speed' },
  { label: '风向', value: 'wind_direction' },
  { label: '降水类型', value: 'precip_type' },
  { label: '降水量 (mm)', value: 'precip_total' },
  { label: '降水概率 (%)', value: 'precip_prob' },
  { label: '天气状况', value: 'weather_text' },
  { label: '气压 (hPa)', value: 'pressure' },
  { label: '云量 (%)', value: 'cloud_cover' },
  { label: '能见度 (km)', value: 'visibility' },
  { label: '紫外线指数', value: 'uv_index' },
  { label: '露点 (°C)', value: 'dew' },
  { label: '是否有效', value: 'is_valid' },
  { label: '阵风 (km/h)', value: 'wind_gust' },
  { label: '日出时间', value: 'sunrise' },
  { label: '日落时间', value: 'sunset' },
  // { label: '类型', value: 'type' }
];
const selectedSource = [
  { label: '和风天气', value: 'QWeather' },
  { label: 'tomorrow.io', value: 'tomorrow.io' },
  { label: 'visualcrossing', value: 'visualcrossing' },
]
// 选中的值
const selectedCities = ref([])
const selectedFields = ref([])
const granularity = ref('day') // 'day' 或 'hour'
const loading = ref(false)      // 加载状态（模拟数据可设为 false）

// 限制最多3个
watch(selectedCities, (val) => {
  if (val.length > 3) selectedCities.value = val.slice(0, 3)
})
watch(selectedFields, (val) => {
  if (val.length > 3) selectedFields.value = val.slice(0, 3)
})

// 判断是否有有效选择
const hasValidSelection = computed(() => {
  return selectedCities.value.length > 0 && selectedFields.value.length > 0
})


// 生成图表所需的数据系列
const generateChartSeries = () => {
  const series = [];
  for (const city of selectedCities.value) {
    for (const field of selectedFields.value) {
      // 一次查找城市和字段信息
      const cityInfo = cityOptions.find(c => c.value === city);
      const fieldInfo = fieldOptions.find(f => f.value === field);

      const cityLabel = cityInfo?.label ?? city; // 降级处理
      const fieldLabel = fieldInfo?.label ?? field;
      const fieldValue = fieldInfo?.value;       // 字段名

      const name = `${cityLabel}-${fieldLabel}`;

      const data = daysList.value.map(item => item[fieldValue]);

      series.push({
        name,
        type: 'line',
        data,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
      });
    }
  }
  return series;
};
const xAxisData = computed(() => daysList.value.map(item => convertToLocalDate(item.forecast_time)))

// 图表选项（传递给 EChartsWrapper）
const chartOptions = computed(() => {
  if (!hasValidSelection.value) return null

  return {
    title: {
      text: '天气数据对比',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: generateChartSeries().map(s => s.name),
      top: 30,
      left: 'center',
    },
    grid: {
      left: '5%',
      right: '5%',
      top: '15%',
      bottom: '5%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: xAxisData.value,
      boundaryGap: false,
      axisLabel: {
        rotate: granularity.value === 'hour' ? 45 : 0,
      },
    },
    yAxis: {
      type: 'value',
      name: '数值',
    },
    series: generateChartSeries(),
  }
})

// 图表点击事件（可选）
const handleChartClick = (params) => {
  console.log('图表点击：', params)
}


watch([selectedCities, selectedFields, selectedSource], async () => {
  let error = null;
  if (hasValidSelection.value) {
    loading.value = true;
    try {
      const allDaysResult = await weatherApi.getWeatherDaysInfo(selectedCities.value, undefined, 'Qweather');

      if (allDaysResult.code === 200) {
        daysList.value = allDaysResult.data || [];
        generateChartSeries();
      } else {
        error.value = allDaysResult.message;
        console.error('API 错误：', error.value);
      }
    } catch (err) {
      error.value = err.message || '网络请求失败';
      console.error('请求失败：', err);
    } finally {
      loading.value = false;
    }
  }
});
</script>

<style scoped>
.weather-chart-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 24px;
}

.control-group {
  flex: 1;
  min-width: 200px;
}

.control-group label {
  font-weight: 500;
  display: block;
  margin-bottom: 8px;
  color: #333;
}

.checkbox-group,
.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.checkbox-group label,
.radio-group label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: normal;
  cursor: pointer;
  user-select: none;
}

input[type="checkbox"],
input[type="radio"] {
  margin: 0;
  cursor: pointer;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  min-height: 400px;
}

.no-data {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #999;
  font-size: 14px;
}
</style>
