<template>
  <div class="controls-panel">

    <!-- 城市 -->
    <div class="control-group">
      <div class="control-header">
        <label>
          城市
          <span v-if="!isHeatmap && cityMaxSelection > 1">（最多选 {{ cityMaxSelection }} 个）</span>
          <span v-else>（单选）</span>
        </label>
        <el-button v-if="!isHeatmap" type="text" @click="toggleCityExpand">
          {{ isCityExpanded ? '收起' : '展开' }}
        </el-button>
      </div>
      <el-checkbox-group
        v-if="!isHeatmap"
        v-model="selectedCitiesModel"
        :max="cityMaxSelection"
        class="horizontal-checkbox-group"
        :class="{ expanded: isCityExpanded }"
      >
        <el-checkbox v-for="city in cityOptions" :key="city.value" :value="city.value" :label="city.label" />
      </el-checkbox-group>
      <el-select v-else v-model="selectedCitiesModel" placeholder="请选择城市" style="width: 100%">
        <el-option v-for="city in cityOptions" :key="city.value" :label="city.label" :value="city.value" />
      </el-select>
    </div>

    <!-- 天气字段 -->
    <div class="control-group">
      <div class="control-header">
        <label>
          天气字段
          <span v-if="isLineOrBarOrRadar">（最多选 {{ maxFields }} 个）</span>
          <span v-else-if="isHeatmap">（单选）</span>
        </label>
        <el-button v-if="isLineOrBarOrRadar" type="text" @click="toggleFieldsExpand">
          {{ isFieldsExpanded ? '收起' : '展开' }}
        </el-button>
      </div>
      <el-checkbox-group
        v-if="isLineOrBarOrRadar"
        v-model="selectedFieldsModel"
        :max="maxFields"
        class="horizontal-checkbox-group"
        :class="{ expanded: isFieldsExpanded }"
      >
        <el-checkbox v-for="field in fieldOptions" :key="field.value" :value="field.value" :label="field.label" />
      </el-checkbox-group>
      <el-select v-else-if="isHeatmap" v-model="selectedFieldsModel" placeholder="请选择字段" style="width: 100%">
        <el-option v-for="field in fieldOptions" :key="field.value" :label="field.label" :value="field.value" />
      </el-select>
    </div>

    <!-- 时间范围 + 数据来源 + 图表类型 -->
    <el-row :gutter="20" class="controls-row">
      <el-col :span="8">
        <div class="control-group">
          <label>时间范围</label>
          <div v-if="!isBarOrRadar" class="date-quick-buttons">
            <el-button size="small" @click="setQuickDate('today')">今天</el-button>
            <el-button size="small" @click="setQuickDate('7days')">最近7天</el-button>
            <el-button size="small" @click="setQuickDate('30days')">最近30天</el-button>
          </div>
          <el-date-picker
            v-model="dateRangeModel"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            :disabled="isBarOrRadar"
          />
        </div>
      </el-col>
      <el-col :span="8">
        <div class="control-group">
          <label>数据来源</label>
          <el-select v-model="selectedSourceModel" placeholder="请选择数据源" :multiple="!isHeatmap"
            :multiple-limit="isHeatmap ? undefined : 3" style="width: 100%">
            <el-option v-for="source in sourceOptions" :key="source.value" :label="source.label" :value="source.value" />
          </el-select>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="control-group">
          <label>图表类型</label>
          <el-select v-model="chartTypeModel" placeholder="选择图表类型" style="width: 100%">
            <el-option label="折线图（趋势对比）" value="line" />
            <el-option label="柱状图（某日对比）" value="bar" />
            <el-option label="雷达图（多指标对比）" value="radar" />
            <el-option label="散点图（相关性分析）" value="scatter" />
            <el-option label="热力图（日历）" value="heatmap" />
          </el-select>
        </div>
      </el-col>
    </el-row>

    <!-- 柱状图/雷达图专用日期 -->
    <div v-if="localChartType === 'bar' || localChartType === 'radar'" class="extra-controls">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="control-group">
            <label>选择日期</label>
            <el-date-picker v-model="barDateModel" type="date" placeholder="选择日期" value-format="YYYY-MM-DD"
              style="width: 100%" />
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 散点图专用 X/Y -->
    <div v-if="localChartType === 'scatter'" class="extra-controls">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="control-group">
            <label>X轴字段</label>
            <el-select v-model="scatterXModel" placeholder="选择字段" style="width: 100%">
              <el-option v-for="field in fieldOptions" :key="field.value" :label="field.label" :value="field.value" />
            </el-select>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="control-group">
            <label>Y轴字段</label>
            <el-select v-model="scatterYModel" placeholder="选择字段" style="width: 100%">
              <el-option v-for="field in fieldOptions" :key="field.value" :label="field.label" :value="field.value" />
            </el-select>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 雷达图手动范围配置 -->
    <div v-if="localChartType === 'radar'" class="extra-controls">
      <el-row :gutter="20">
        <el-col :span="24">
          <div class="control-group">
            <div class="control-header">
              <label>雷达图轴范围（留空则自动计算）</label>
              <el-button type="text" @click="toggleRadarRangeExpand">
                {{ isRadarRangeExpanded ? '收起' : '展开' }}
              </el-button>
            </div>
            <div v-if="isRadarRangeExpanded" class="radar-range-config">
              <div v-for="field in localSelectedFields" :key="field" class="range-item">
                <span class="field-label">{{ getFieldLabel(field) }}</span>
                <el-input-number v-model="radarRangeManual[field].min" :placeholder="`最小值`" size="small"
                  style="width: 120px; margin-right: 10px;" :controls="false" />
                <span>~</span>
                <el-input-number v-model="radarRangeManual[field].max" :placeholder="`最大值`" size="small"
                  style="width: 120px; margin-left: 10px;" :controls="false" />
              </div>
              <div class="range-buttons">
                <el-button type="primary" size="small" @click="applyRadarRanges">应用手动范围</el-button>
                <el-button size="small" @click="resetRadarRanges">重置为自动</el-button>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { cityOptions, fieldOptions, sourceOptions, getFieldLabel } from '../../../constants/weatherOptions'
import dayjs from 'dayjs'

const props = defineProps({
  selectedCities: { type: Array, default: () => [] },
  selectedFields: { type: Array, default: () => [] },
  selectedSource: { type: Array, default: () => [] },
  dateRange: { type: Array, default: null },
  chartType: { type: String, default: 'line' },
  barDate: { type: String, default: null },
  scatterX: { type: String, default: 'temp' },
  scatterY: { type: String, default: 'humidity' }
})

const emit = defineEmits([
  'update:selectedCities',
  'update:selectedFields',
  'update:selectedSource',
  'update:dateRange',
  'update:chartType',
  'update:barDate',
  'update:scatterX',
  'update:scatterY',
  'update:radarRanges'
])

// ----- 本地状态（使用 computed get/set 实现双向同步，减少手动watch）-----
const localChartType = ref(props.chartType)

const selectedCitiesModel = computed({
  get: () => props.selectedCities,
  set: val => emit('update:selectedCities', val)
})
const selectedFieldsModel = computed({
  get: () => props.selectedFields,
  set: val => emit('update:selectedFields', val)
})
const selectedSourceModel = computed({
  get: () => props.selectedSource,
  set: val => emit('update:selectedSource', val)
})
const dateRangeModel = computed({
  get: () => props.dateRange,
  set: val => emit('update:dateRange', val)
})
const chartTypeModel = computed({
  get: () => localChartType.value,
  set: val => {
    localChartType.value = val
    emit('update:chartType', val)
  }
})
const barDateModel = computed({
  get: () => props.barDate,
  set: val => emit('update:barDate', val)
})
const scatterXModel = computed({
  get: () => props.scatterX,
  set: val => emit('update:scatterX', val)
})
const scatterYModel = computed({
  get: () => props.scatterY,
  set: val => emit('update:scatterY', val)
})

// 内部辅助
const isHeatmap = computed(() => localChartType.value === 'heatmap')
const isLineOrBarOrRadar = computed(() => ['line', 'bar', 'radar'].includes(localChartType.value))
const isBarOrRadar = computed(() => localChartType.value === 'bar' || localChartType.value === 'radar')
const cityMaxSelection = computed(() => (isHeatmap.value ? 1 : 2))
const maxFields = computed(() => localChartType.value === 'radar' ? 6 : 2)

// 展开状态
const isCityExpanded = ref(false)
const isFieldsExpanded = ref(false)
const toggleCityExpand = () => { isCityExpanded.value = !isCityExpanded.value }
const toggleFieldsExpand = () => { isFieldsExpanded.value = !isFieldsExpanded.value }

// 快捷日期
const setQuickDate = (type) => {
  const today = dayjs()
  let start, end
  switch (type) {
    case 'today':
      start = today.format('YYYY-MM-DD')
      end = today.format('YYYY-MM-DD')
      break
    case '7days':
      start = today.subtract(6, 'day').format('YYYY-MM-DD')
      end = today.format('YYYY-MM-DD')
      break
    case '30days':
      start = today.subtract(29, 'day').format('YYYY-MM-DD')
      end = today.format('YYYY-MM-DD')
      break
    default: return
  }
  dateRangeModel.value = [start, end]
}

// 雷达图手动范围相关
const radarRangeManual = ref({})
const isRadarRangeExpanded = ref(false)

const initRadarRangeManual = () => {
  const newObj = {}
  const fields = props.selectedFields
  if (Array.isArray(fields)) {
    fields.forEach(field => {
      if (!radarRangeManual.value[field]) {
        newObj[field] = { min: null, max: null }
      } else {
        newObj[field] = radarRangeManual.value[field]
      }
    })
    radarRangeManual.value = newObj
  }
}
watch(() => props.selectedFields, () => initRadarRangeManual(), { immediate: true })

const applyRadarRanges = () => {
  const validRanges = {}
  Object.keys(radarRangeManual.value).forEach(field => {
    const { min, max } = radarRangeManual.value[field]
    if (min !== null && max !== null && !isNaN(min) && !isNaN(max)) {
      validRanges[field] = { min, max }
    }
  })
  emit('update:radarRanges', validRanges)
}
const resetRadarRanges = () => {
  const newObj = {}
  props.selectedFields.forEach(field => {
    newObj[field] = { min: null, max: null }
  })
  radarRangeManual.value = newObj
  emit('update:radarRanges', {})
}
const toggleRadarRangeExpand = () => {
  isRadarRangeExpanded.value = !isRadarRangeExpanded.value
}

// ----- 图表类型切换时的智能预设 -----
watch(localChartType, (newType) => {
  // 1. 预设字段
  if (newType === 'line' || newType === 'bar') {
    const defaultFields = fieldOptions.slice(0, 2).map(f => f.value)
    selectedFieldsModel.value = defaultFields
  } else if (newType === 'radar') {
    const radarDefault = ['temp', 'humidity', 'precip', 'wind_spd']
    const available = radarDefault.filter(v => fieldOptions.some(f => f.value === v))
    selectedFieldsModel.value = available
  } else if (newType === 'scatter') {
    selectedFieldsModel.value = []
  } else if (newType === 'heatmap') {
    const tempField = fieldOptions.find(f => f.value === 'temp')
    if (tempField) selectedFieldsModel.value = tempField.value
  }

  // 2. 预设城市
  if (newType === 'heatmap') {
    if (cityOptions.length) selectedCitiesModel.value = cityOptions[0].value
  } else {
    const defaultCities = cityOptions.slice(0, 2).map(c => c.value)
    selectedCitiesModel.value = defaultCities
  }

  // 3. 预设数据源（全选）
  if (sourceOptions.length) {
    selectedSourceModel.value = sourceOptions.map(s => s.value)
  }

  // 4. 日期处理
  if (newType === 'bar' || newType === 'radar') {
    if (!barDateModel.value) {
      barDateModel.value = dayjs().format('YYYY-MM-DD')
    }
  } else {
    if (!dateRangeModel.value || dateRangeModel.value.length === 0) {
      const end = dayjs()
      const start = end.subtract(6, 'day')
      dateRangeModel.value = [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')]
    }
  }
}, { immediate: true })
</script>

<style scoped>
/* 整体容器 */
.controls-panel {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px 28px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02), 0 4px 16px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(226, 232, 240, 0.6);
  transition: box-shadow 0.3s ease;
}

.controls-panel:hover {
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
}

.control-group {
  margin-bottom: 24px;
}

.control-group:last-child {
  margin-bottom: 0;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 14px;
}

.control-group label {
  font-weight: 500;
  font-size: 15px;
  color: #0f172a;
  border-left: 2px solid #3b82f6;
  padding-left: 10px;
}

.control-header .el-button--text {
  font-size: 13px;
  color: #64748b;
  padding: 0 6px;
  transition: color 0.2s, transform 0.2s;
}

.control-header .el-button--text:hover {
  color: #3b82f6;
  transform: translateX(2px);
}

/* 复选框网格 */
.horizontal-checkbox-group {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px 14px;
  transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  max-height: none;
  overflow: visible;
}

.horizontal-checkbox-group:not(.expanded) {
  max-height: 52px;
  overflow: hidden;
  mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
}

.horizontal-checkbox-group.expanded {
  max-height: 500px;
  overflow-y: auto;
  padding-bottom: 4px;
}

/* 复选框样式（高级感核心） */
:deep(.el-checkbox) {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 6px 12px;
  margin-right: 0;
  transition: all 0.15s cubic-bezier(0.2, 0.9, 0.4, 1.1);
}

:deep(.el-checkbox__input) {
  margin-right: 8px;
}

:deep(.el-checkbox__label) {
  font-size: 14px;
  color: #334155;
  padding-left: 0;
  font-weight: 500;
}

:deep(.el-checkbox.is-checked) {
  background: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
  transform: scale(0.98);
}

:deep(.el-checkbox.is-checked .el-checkbox__label) {
  color: #1e40af;
  font-weight: 600;
}

:deep(.el-checkbox:hover) {
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

/* 快捷日期按钮组 */
.date-quick-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.date-quick-buttons .el-button {
  border-radius: 10px;
  padding: 5px 12px;
  font-size: 12px;
}

/* 下拉框、输入框统一圆角 */
:deep(.el-input__wrapper) {
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02), inset 0 0 0 1px #e2e8f0;
  transition: all 0.2s;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #3b82f6 inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2), 0 0 0 1px #3b82f6 inset;
}

/* 额外配置区域 */
.extra-controls {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eef2f6;
  position: relative;
}

.extra-controls::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, transparent);
}

/* 雷达图手动范围 */
.radar-range-config {
  margin-top: 16px;
  padding: 16px;
  background: #f1f5f9;
  border-radius: 16px;
}

.range-item {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 8px;
}

.field-label {
  width: 100px;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  background: #ffffff;
  padding: 4px 8px;
  border-radius: 20px;
  text-align: center;
}

.range-buttons {
  margin-top: 16px;
  text-align: right;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.range-buttons .el-button {
  border-radius: 20px;
  padding: 8px 20px;
}

/* 响应式 */
@media (max-width: 1400px) {
  .horizontal-checkbox-group { grid-template-columns: repeat(5, 1fr); }
}

@media (max-width: 1200px) {
  .horizontal-checkbox-group { grid-template-columns: repeat(4, 1fr); }
}

@media (max-width: 992px) {
  .horizontal-checkbox-group { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .controls-panel { padding: 20px; }
  .horizontal-checkbox-group { grid-template-columns: repeat(2, 1fr); }
  .control-header { flex-direction: column; gap: 8px; }
}
</style>
