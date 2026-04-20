<template>
  <div class="custom-tabs-wrapper">
    <el-tabs v-model="activeTab" @tab-click="handleTabClick" style="display: flex; justify-content: space-between;">
      <el-tab-pane name="home" label="首页">
        <template #label>
          <span>
            <el-icon :size="20"><HomeFilled /></el-icon>
            <span style="margin-left: 6px;">首页</span>
          </span>
        </template>
      </el-tab-pane>

      <el-tab-pane name="analyse">
        <template #label>
          <span>
            <el-icon :size="20"><TrendCharts /></el-icon>
            <span style="margin-left: 6px;">分析</span>
          </span>
        </template>
      </el-tab-pane>

      <el-tab-pane name="score">
        <template #label>
          <span>
            <el-icon :size="20"><Opportunity /></el-icon>
            <span style="margin-left: 6px;">评分</span>
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const activeTab = computed(() => route.path)

const handleTabClick = (tab) => {
  const path = tab.props.name
  if (path !== route.path) {
    router.push(path)
  }
}
</script>

<style scoped>
.custom-tabs-wrapper {
  margin-top: 20px;
}
.custom-tabs-wrapper :deep(.el-tabs__nav) {
    justify-content: space-evenly;
    width: stretch;
}
</style>