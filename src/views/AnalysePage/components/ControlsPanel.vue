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
      <!-- 多选模式（折线/柱状/雷达/散点） -->
      <el-checkbox-group v-if="!isHeatmap" v-model="localSelectedCities" :max="cityMaxSelection"
        class="horizontal-checkbox-group" :class="{ expanded: isCityExpanded }">
        <el-checkbox v-for="city in cityOptions" :key="city.value" :value="city.value" :label="city.label" />
      </el-checkbox-group>
      <!-- 单选模式（热力图） -->
      <el-select v-else v-model="localSelectedCities" placeholder="请选择城市" style="width: 100%">
        <el-option v-for="city in cityOptions" :key="city.value" :label="city.label" :value="city.value" />
      </el-select>
    </div>

    <!-- 天气字段 -->
    <div class="control-group">
      <div class="control-header">
        <label>
          天气字段
          <span v-if="isLineOrBarOrRadar">（最多选 {{ localChartType === 'radar' ? 6 : 2 }} 个）</span>
          <span v-else-if="isHeatmap">（单选）</span>
        </label>
        <el-button v-if="isLineOrBarOrRadar" type="text" @click="toggleFieldsExpand">
          {{ isFieldsExpanded ? '收起' : '展开' }}
        </el-button>
      </div>
      <!-- 多选字段（折线/柱状/雷达） -->
      <el-checkbox-group v-if="isLineOrBarOrRadar" v-model="localSelectedFields" :max=maxFields
        class="horizontal-checkbox-group" :class="{ expanded: isFieldsExpanded }">
        <el-checkbox v-for="field in fieldOptions" :key="field.value" :value="field.value" :label="field.label" />
      </el-checkbox-group>
      <!-- 单选字段（热力图） -->
      <el-select v-else-if="isHeatmap" v-model="localSelectedFields" placeholder="请选择字段" style="width: 100%">
        <el-option v-for="field in fieldOptions" :key="field.value" :label="field.label" :value="field.value" />
      </el-select>
      <!-- 散点图：X/Y 已在下方单独处理，这里不显示字段控件 -->
    </div>

    <!-- 时间范围 + 数据来源 + 图表类型 -->
    <el-row :gutter="20" class="controls-row">
      <el-col :span="8">
        <div class="control-group">
          <label>时间范围</label>
          <el-date-picker v-model="localDateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 100%"
            :disabled="localChartType === 'bar' || localChartType === 'radar'" />
        </div>
      </el-col>
      <el-col :span="8">
        <div class="control-group">
          <label>数据来源</label>
          <el-select v-model="localSelectedSource" placeholder="请选择数据源" :multiple="!isHeatmap"
            :multiple-limit="isHeatmap ? undefined : 2" style="width: 100%">
            <el-option v-for="source in sourceOptions" :key="source.value" :label="source.label"
              :value="source.value" />
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

    <!-- 动态配置面板：柱状图,雷达图专用日期选择 -->
    <div v-if="localChartType === 'bar' || localChartType === 'radar'" class="extra-controls">
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

    <!-- 动态配置面板：散点图专用 X/Y 轴字段选择 -->
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
    <!-- 动态配置面板：雷达图手动设置轴范围 -->
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
import { ref, watch, computed } from 'vue'
import { cityOptions, fieldOptions, sourceOptions } from '../../../constants/weatherOptions'
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
  'update:scatterY'
])

// 本地状态
let localSelectedCities = ref([...props.selectedCities])
let localSelectedFields = ref([...props.selectedFields])
let localSelectedSource = ref([...props.selectedSource])
const localDateRange = ref(props.dateRange ? [...props.dateRange] : null)
const localChartType = ref(props.chartType)
const localBarDate = ref(props.barDate)
const localScatterX = ref(props.scatterX)
const localScatterY = ref(props.scatterY)
const maxFields = computed(() => localChartType.value === 'radar' ? 6 : 2)
// 展开状态
const isCityExpanded = ref(false)
const isFieldsExpanded = ref(false)
const toggleCityExpand = () => {
  isCityExpanded.value = !isCityExpanded.value
}

const toggleFieldsExpand = () => {
  isFieldsExpanded.value = !isFieldsExpanded.value
}
watch([localChartType, localBarDate], () => {
  if ((localChartType.value === 'bar' || localChartType.value === 'radar') && !localBarDate.value) {
    localBarDate.value = dayjs().format('YYYY-MM-DD')
  }
}, { immediate: true })
// 辅助计算属性
const isHeatmap = computed(() => localChartType.value === 'heatmap')
const isLineOrBarOrRadar = computed(() => ['line', 'bar', 'radar'].includes(localChartType.value))
const cityMaxSelection = computed(() => (isHeatmap.value ? 1 : 2))

// 监听图表类型变化，调整字段/城市/数据源格式以适应新图表的要求
watch(localChartType, () => {
  localSelectedCities.value = []
  localSelectedFields.value = []
  localSelectedSource.value = []
})
// 雷达图手动范围配置
const radarRangeManual = ref({})
const isRadarRangeExpanded = ref(false)

// 辅助函数：根据字段值获取 label（需从常量中导入）
import { getFieldLabel } from '../../../constants/weatherOptions'

// 初始化范围对象
const initRadarRangeManual = () => {
  const newObj = {}
  if (Array.isArray(localSelectedFields.value)) {
    localSelectedFields.value.forEach(field => {
      if (!radarRangeManual.value[field]) {
        newObj[field] = { min: null, max: null }
      } else {
        newObj[field] = radarRangeManual.value[field]
      }
    })
    radarRangeManual.value = newObj
  }

}

// 监听字段变化，重新初始化
watch(localSelectedFields, () => {
  initRadarRangeManual()
}, { immediate: true })

// 应用手动范围（发送给父组件）
const applyRadarRanges = () => {
  // 过滤掉未填写完整的项
  const validRanges = {}
  Object.keys(radarRangeManual.value).forEach(field => {
    const { min, max } = radarRangeManual.value[field]
    if (min !== null && max !== null && !isNaN(min) && !isNaN(max)) {
      validRanges[field] = { min, max }
    }
  })
  emit('update:radarRanges', validRanges)
}

// 重置为自动（清空手动值）
const resetRadarRanges = () => {
  const newObj = {}
  localSelectedFields.value.forEach(field => {
    newObj[field] = { min: null, max: null }
  })
  radarRangeManual.value = newObj
  emit('update:radarRanges', {})
}

const toggleRadarRangeExpand = () => {
  isRadarRangeExpanded.value = !isRadarRangeExpanded.value
}
// 监听变化并向上发射
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
/* 整体容器 */
.controls-panel {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  padding: 24px 28px;
  margin-bottom: 32px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(226, 232, 240, 0.6);
  transition: box-shadow 0.3s ease;
}

.controls-panel:hover {
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
}

/* 每个控制组 */
.control-group {
  margin-bottom: 24px;
}

.control-group:last-child {
  margin-bottom: 0;
}

/* 控制组头部 */
.control-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 14px;
}

.control-group label {
  font-weight: 600;
  font-size: 15px;
  color: #1e293b;
  letter-spacing: 0.3px;
  background: linear-gradient(135deg, #1e293b, #334155);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: black;
  border-left: 3px solid #3b82f6;
  padding-left: 12px;
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

/* 复选框组网格布局 - 每行6个，优雅响应式 */
.horizontal-checkbox-group {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px 16px;
  transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  max-height: none;
  overflow: visible;
}

/* 收起状态 */
.horizontal-checkbox-group:not(.expanded) {
  max-height: 52px;
  overflow: hidden;
  mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
}

.horizontal-checkbox-group.expanded {
  max-height: 500px; /* 足够大，实际高度由内容撑开 */
  overflow-y: auto;
  padding-bottom: 4px;
}

/* 复选框样式增强 */
:deep(.el-checkbox) {
  margin-right: 0;
  background: #ffffff;
  padding: 6px 12px;
  border-radius: 24px;
  transition: all 0.2s;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
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
  background: #eef2ff;
  border-color: #3b82f6;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.1);
}

/* :deep(.el-checkbox.is-checked .el-checkbox__label) {
  color: #0c4a6e;
  font-weight: 600;
} */

:deep(.el-checkbox:hover) {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

/* 下拉选择框美化 */
:deep(.el-input__wrapper) {
  border-radius: 16px;
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

:deep(.el-select .el-input__inner) {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

:deep(.el-select-dropdown__item) {
  font-size: 14px;
  padding: 8px 16px;
  transition: background 0.2s;
}

:deep(.el-select-dropdown__item.selected) {
  font-weight: 600;
  color: #3b82f6;
}

/* 日期选择器 */
:deep(.el-date-editor .el-input__wrapper) {
  border-radius: 16px;
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

/* 雷达图手动范围配置 */
.radar-range-config {
  margin-top: 16px;
  padding: 16px;
  background: #f1f5f9;
  border-radius: 20px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.02);
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

:deep(.el-input-number .el-input__wrapper) {
  border-radius: 12px;
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
  font-weight: 500;
  transition: all 0.2s;
}

.range-buttons .el-button--primary {
  background: #3b82f6;
  border-color: #3b82f6;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2);
}

.range-buttons .el-button--primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.range-buttons .el-button:not(.el-button--primary) {
  border-color: #cbd5e1;
  color: #475569;
}

.range-buttons .el-button:not(.el-button--primary):hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #f8fafc;
  transform: translateY(-1px);
}

/* 响应式：小屏幕调整网格列数 */
@media (max-width: 1400px) {
  .horizontal-checkbox-group {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 1200px) {
  .horizontal-checkbox-group {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 992px) {
  .horizontal-checkbox-group {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .controls-panel {
    padding: 20px;
  }
  .horizontal-checkbox-group {
    grid-template-columns: repeat(2, 1fr);
  }
  .control-header {
    flex-direction: column;
    gap: 8px;
  }
  .control-header .el-button--text {
    align-self: flex-start;
  }
}
</style>
