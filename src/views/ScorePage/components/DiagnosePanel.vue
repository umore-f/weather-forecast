<template>
  <div class="diagnose-container">
    <!-- 场景筛选 -->
    <div class="scene-filter">
      <span class="filter-label">场景筛选：</span>
      <el-button-group>
        <el-button :type="activeScene === 'extremeHeat' ? 'primary' : 'default'" @click="setScene('extremeHeat')">极端高温</el-button>
        <el-button :type="activeScene === 'heavyRain' ? 'primary' : 'default'" @click="setScene('heavyRain')">强降水</el-button>
        <el-button :type="activeScene === 'calm' ? 'primary' : 'default'" @click="setScene('calm')">平稳天气</el-button>
        <el-button :type="activeScene === 'all' ? 'primary' : 'default'" @click="setScene('all')">全部场景</el-button>
      </el-button-group>
    </div>

    <!-- 雷达图 + 箱线图 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <div class="diagnose-card">
          <div class="card-title">数据源综合性能雷达图</div>
          <EChartsWrapper :options="radarDiagnoseOptions" height="380px" :loading="diagnoseLoading" />
        </div>
      </el-col>
      <el-col :span="12">
        <div class="diagnose-card">
          <div class="card-title">历史误差分布（箱线图）</div>
          <EChartsWrapper :options="boxplotOptions" height="380px" :loading="diagnoseLoading" />
        </div>
      </el-col>
    </el-row>

    <!-- 桑基图溯源 -->
    <div class="diagnose-card full-width">
      <div class="card-title">可信度溯源（点击Tab1折线图某天查看权重）</div>
      <div v-if="!selectedTraceDate" class="trace-placeholder">
        请先在“多源对比分析”页面的折线图上点击某一天，将显示该日真值合成权重。
      </div>
      <div v-else>
        <div class="trace-info">日期：{{ selectedTraceDate }} | 真值计算方式：基于各源历史误差动态加权</div>
        <EChartsWrapper :options="sankeyOptions" height="320px" />
      </div>
    </div>
  </div>
</template>

<script setup>
import EChartsWrapper from '../../../components/EChartsWrapper.vue'

// 使用 defineModel 声明双向绑定的 activeScene
const activeScene = defineModel('activeScene', { type: String })

// 其他 props 保持单向传递（不需要子组件修改）
defineProps({
  rawData: Array,
  selectedTraceDate: String,
  radarDiagnoseOptions: Object,
  boxplotOptions: Object,
  sankeyOptions: Object,
  diagnoseLoading: Boolean
})

// 场景切换方法：直接修改 defineModel 返回的 ref 值
const setScene = (scene) => {
  activeScene.value = scene
}
</script>

<style scoped>
/* 原样式保持不变 */
.diagnose-container {
  padding: 8px;
}
.scene-filter {
  background: #ffffff;
  border-radius: 16px;
  padding: 12px 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.filter-label {
  font-weight: 600;
  color: #2c3e50;
}
.diagnose-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid #eef2f6;
}
.full-width {
  width: 100%;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #2c3e50;
  border-left: 4px solid #f59e0b;
  padding-left: 12px;
}
.trace-placeholder {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
}
.trace-info {
  margin-bottom: 16px;
  font-size: 14px;
  color: #475569;
}
</style>
