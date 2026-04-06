<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="controls-panel">
    <!-- 城市选择 -->
    <div class="control-group">
      <div class="control-header">
        <label>
          城市
          <span v-if="cityMaxSelection > 1">（最多选 {{ cityMaxSelection }} 个）</span>
          <span v-else>（单选）</span>
        </label>
        <el-button type="text" @click="toggleCityExpand">
          {{ isCityExpanded ? '收起' : '展开' }}
        </el-button>
      </div>
      <el-checkbox-group
        v-model="selectedCities"
        :max="cityMaxSelection"
        class="horizontal-checkbox-group"
        :class="{ expanded: isCityExpanded }"
      >
        <el-checkbox
          v-for="city in cityOptions"
          :key="city.value"
          :value="city.value"
          :label="city.label"
        />
      </el-checkbox-group>
    </div>

    <!-- 天气字段选择 -->
    <div class="control-group">
      <div class="control-header">
        <label>
          天气字段
          <span v-if="fieldMaxSelection > 1">（最多选 {{ fieldMaxSelection }} 个）</span>
          <span v-else>（单选）</span>
        </label>
      </div>
      <el-checkbox-group
        v-model="selectedFields"
        :max="fieldMaxSelection"
        class="horizontal-checkbox-group"
        :class="{ expanded: true }"
      >
        <el-checkbox
          v-for="field in fieldOptionsShort"
          :key="field.value"
          :value="field.value"
          :label="field.label"
        />
      </el-checkbox-group>
    </div>

    <!-- 时间范围 + 数据来源 -->
    <el-row :gutter="20" class="controls-row">
      <el-col :span="12">
        <div class="control-group">
          <label>时间范围</label>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </div>
      </el-col>
      <el-col :span="12">
        <div class="control-group">
          <label>数据来源</label>
          <el-select
            v-model="selectedSource"
            placeholder="请选择数据源"
            multiple
            :multiple-limit="sourceMaxSelection"
            style="width: 100%"
          >
            <el-option
              v-for="source in sourceOptions"
              :key="source.value"
              :label="source.label"
              :value="source.value"
            />
          </el-select>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { cityOptions, fieldOptionsShort, sourceOptions } from '@/constants/weatherOptions'

// 使用 defineModel 定义双向绑定字段
const selectedCities = defineModel('selectedCities', { type: Array, default: () => [] })
const selectedFields = defineModel('selectedFields', { type: Array, default: () => [] })
const selectedSource = defineModel('selectedSource', { type: Array, default: () => [] })
const dateRange = defineModel('dateRange', { type: Array, default: null })

const cityMaxSelection = defineModel('cityMaxSelection')
const fieldMaxSelection = defineModel('fieldMaxSelection')
const sourceMaxSelection = defineModel('sourceMaxSelection')

// 展开/收起状态（仅 UI 控制，无需暴露）
const isCityExpanded = ref(false)

const toggleCityExpand = () => {
  isCityExpanded.value = !isCityExpanded.value
}

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
  max-height: 500px;
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
