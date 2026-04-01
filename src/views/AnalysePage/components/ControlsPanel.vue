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
      <el-checkbox-group
        v-if="!isHeatmap"
        v-model="localSelectedCities"
        :max="cityMaxSelection"
        class="horizontal-checkbox-group"
        :class="{ expanded: isCityExpanded }"
      >
        <el-checkbox v-for="city in cityOptions" :key="city.value" :value="city.value" :label="city.label" />
      </el-checkbox-group>
      <!-- 单选模式（热力图） -->
      <el-select
        v-else
        v-model="localSelectedCities"
        placeholder="请选择城市"
        style="width: 100%"
      >
        <el-option v-for="city in cityOptions" :key="city.value" :label="city.label" :value="city.value" />
      </el-select>
    </div>

    <!-- 天气字段 -->
    <div class="control-group">
      <div class="control-header">
        <label>
          天气字段
          <span v-if="isLineOrBarOrRadar">（最多选 2 个）</span>
          <span v-else-if="isHeatmap">（单选）</span>
        </label>
        <el-button v-if="isLineOrBarOrRadar" type="text" @click="toggleFieldsExpand">
          {{ isFieldsExpanded ? '收起' : '展开' }}
        </el-button>
      </div>
      <!-- 多选字段（折线/柱状/雷达） -->
      <el-checkbox-group
        v-if="isLineOrBarOrRadar"
        v-model="localSelectedFields"
        :max="2"
        class="horizontal-checkbox-group"
        :class="{ expanded: isFieldsExpanded }"
      >
        <el-checkbox v-for="field in fieldOptions" :key="field.value" :value="field.value" :label="field.label" />
      </el-checkbox-group>
      <!-- 单选字段（热力图） -->
      <el-select
        v-else-if="isHeatmap"
        v-model="localSelectedFields"
        placeholder="请选择字段"
        style="width: 100%"
      >
        <el-option v-for="field in fieldOptions" :key="field.value" :label="field.label" :value="field.value" />
      </el-select>
      <!-- 散点图：X/Y 已在下方单独处理，这里不显示字段控件 -->
    </div>

    <!-- 时间范围 + 数据来源 + 图表类型 -->
    <el-row :gutter="20" class="controls-row">
      <el-col :span="8">
        <div class="control-group">
          <label>时间范围</label>
          <el-date-picker
            v-model="localDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            :disabled = 'localChartType === "bar"'
          />
        </div>
      </el-col>
      <el-col :span="8">
        <div class="control-group">
          <label>数据来源</label>
          <el-select
            v-model="localSelectedSource"
            placeholder="请选择数据源"
            :multiple="!isHeatmap"
            :multiple-limit="isHeatmap ? undefined : 2"
            style="width: 100%"
          >
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

    <!-- 动态配置面板：柱状图专用日期选择 -->
    <div v-if="localChartType === 'bar'" class="extra-controls">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="control-group">
            <label>选择日期</label>
            <el-date-picker
              v-model="localBarDate"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
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
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { cityOptions, fieldOptions, sourceOptions } from '../../../constants/weatherOptions'

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

// 展开状态
const isCityExpanded = ref(false)
const isFieldsExpanded = ref(false)

// 辅助计算属性
const isHeatmap = computed(() => localChartType.value === 'heatmap')
const isLineOrBarOrRadar = computed(() => ['line', 'bar', 'radar'].includes(localChartType.value))
const cityMaxSelection = computed(() => (isHeatmap.value ? 1 : 2))

// 监听图表类型变化，调整字段/城市/数据源格式以适应新图表的要求
watch(localChartType, () => {
  localSelectedCities.value = []
  localSelectedFields.value = []
  localSelectedSource.value = []
  // // 当从多字段图表切换到热力图时，如果选中了多个字段，只保留第一个
  // if (newType === 'heatmap' && localSelectedFields.value.length > 1) {
  //   localSelectedFields.value = [localSelectedFields.value[0]]
  // }
  // // 当从热力图切换到多字段图表时，如果字段为空，默认选中第一个字段
  // if (isLineOrBarOrRadar.value && localSelectedFields.value.length === 0) {
  //   localSelectedFields.value = [fieldOptions[0]?.value]
  // }

  // // 城市数量限制：热力图只能选一个城市
  // if (newType === 'heatmap' && localSelectedCities.value.length > 1) {
  //   localSelectedCities.value = [localSelectedCities.value[0]]
  // }

  // // 数据来源：热力图只能单选，将数组转为单值
  // if (newType === 'heatmap' && localSelectedSource.value.length > 1) {
  //   localSelectedSource.value = [localSelectedSource.value[0]]
  // }
  // if (newType !== 'heatmap' && localSelectedSource.value.length === 0) {
  //   localSelectedSource.value = [sourceOptions[0]?.value]
  // }
})

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
/* 样式保持不变 */
.controls-panel {
  background: #ffffff;
  border-radius: 20px;
  padding: 20px 24px;
  margin-bottom: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.02);
  border: 1px solid #eef2f6;
}
.control-group label {
  font-weight: 600;
  font-size: 14px;
  color: #2c3e50;
  margin: 0;
}
.horizontal-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  transition: max-height 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  max-height: 44px;
  overflow: hidden;
}
.horizontal-checkbox-group.expanded {
  max-height: 120px;
  overflow-y: auto;
  overflow-x: hidden;
}
.extra-controls {
  margin-top: 16px;
  padding: 12px 0;
  border-top: 1px solid #eef2f6;
}
</style>
