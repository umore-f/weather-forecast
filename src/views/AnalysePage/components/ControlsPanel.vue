<template>
  <div class="controls-panel">
    <!-- 城市 -->
    <div class="control-group">
      <div class="control-header">
        <label>城市（最多选2个）</label>
        <el-button type="text" @click="toggleCityExpand">
          {{ isCityExpanded ? '收起' : '展开' }}
        </el-button>
      </div>
      <el-checkbox-group v-model="localSelectedCities" :max="2" class="horizontal-checkbox-group"
        :class="{ expanded: isCityExpanded }">
        <el-checkbox v-for="city in cityOptions" :key="city.value" :value="city.value" :label="city.label" />
      </el-checkbox-group>
    </div>

    <!-- 天气字段 -->
    <div class="control-group">
      <div class="control-header">
        <label>天气字段（最多选2个）</label>
        <el-button type="text" @click="toggleFieldsExpand">
          {{ isFieldsExpanded ? '收起' : '展开' }}
        </el-button>
      </div>
      <el-checkbox-group v-model="localSelectedFields" :max="2" class="horizontal-checkbox-group"
        :class="{ expanded: isFieldsExpanded }">
        <el-checkbox v-for="field in fieldOptions" :key="field.value" :value="field.value" :label="field.label" />
      </el-checkbox-group>
    </div>

    <!-- 时间范围 + 数据来源 + 图表类型 -->
    <el-row :gutter="20" class="controls-row">
      <el-col :span="8">
        <div class="control-group">
          <label>时间范围</label>
          <el-date-picker v-model="localDateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </div>
      </el-col>
      <el-col :span="8">
        <div class="control-group">
          <label>数据来源</label>
          <el-select v-model="localSelectedSource" placeholder="请选择数据源" multiple style="width: 100%">
            <el-option v-for="source in sourceOptions" :key="source.value" :label="source.label" :value="source.value" />
          </el-select>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="control-group">
          <label>图表类型</label>
          <el-select v-model="localChartType" placeholder="选择图表类型" style="width: 100%">
            <el-option label="折线图（趋势对比）" value="line" />
            <el-option label="柱状图（某日对比）" value="bar" />
            <el-option label="雷达图（多指标对比）" value="radar" />
            <el-option label="散点图（相关性分析）" value="scatter" />
            <el-option label="热力图（日历）" value="heatmap" />
          </el-select>
        </div>
      </el-col>
    </el-row>

    <!-- 动态配置面板 -->
    <div v-if="localChartType === 'bar'" class="extra-controls">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="control-group">
            <label>选择日期</label>
            <el-date-picker v-model="localBarDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD"
              style="width: 100%" />
          </div>
        </el-col>
      </el-row>
    </div>

    <div v-if="localChartType === 'scatter'" class="extra-controls">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="control-group">
            <label>X轴字段</label>
            <el-select v-model="localScatterX" placeholder="选择字段" style="width: 100%">
              <el-option v-for="field in fieldOptions" :key="field.value" :label="field.label" :value="field.value" />
            </el-select>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="control-group">
            <label>Y轴字段</label>
            <el-select v-model="localScatterY" placeholder="选择字段" style="width: 100%">
              <el-option v-for="field in fieldOptions" :key="field.value" :label="field.label" :value="field.value" />
            </el-select>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { cityOptions, fieldOptions, sourceOptions } from '../constants/weatherOptions'

const props = defineProps({
  selectedCities: Array,
  selectedFields: Array,
  selectedSource: Array,
  dateRange: Array,
  chartType: String,
  barDate: String,
  scatterX: String,
  scatterY: String
})

const emit = defineEmits([
  'update:selectedCities',
  'update:selectedFields',
  'update:selectedSource',
  'update:dateRange',
  'update:chartType',
  'update:barDate',
  'update:scatterX',
  'update:scatterY'
])

// 本地双向绑定
const localSelectedCities = ref(props.selectedCities)
const localSelectedFields = ref(props.selectedFields)
const localSelectedSource = ref(props.selectedSource)
const localDateRange = ref(props.dateRange)
const localChartType = ref(props.chartType)
const localBarDate = ref(props.barDate)
const localScatterX = ref(props.scatterX)
const localScatterY = ref(props.scatterY)

// 展开状态
const isCityExpanded = ref(false)
const isFieldsExpanded = ref(false)

const toggleCityExpand = () => { isCityExpanded.value = !isCityExpanded.value }
const toggleFieldsExpand = () => { isFieldsExpanded.value = !isFieldsExpanded.value }

// 监听变化并向上发射
// 这里可以用 watch，但简单起见直接在模板上 @change 发射，但为了简洁，我们用 watch
import { watch } from 'vue'
watch(localSelectedCities, val => emit('update:selectedCities', val))
watch(localSelectedFields, val => emit('update:selectedFields', val))
watch(localSelectedSource, val => emit('update:selectedSource', val))
watch(localDateRange, val => emit('update:dateRange', val))
watch(localChartType, val => emit('update:chartType', val))
watch(localBarDate, val => emit('update:barDate', val))
watch(localScatterX, val => emit('update:scatterX', val))
watch(localScatterY, val => emit('update:scatterY', val))
</script>

<style scoped>
/* 将原有样式迁移至此，仅保留 control-panel 相关样式 */
.controls-panel { /* ... */ }
.control-group { /* ... */ }
.horizontal-checkbox-group { /* ... */ }
/* ... */
</style>
