<template>
  <div class="custom-tabs-wrapper">
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane name="home" label="首页">
        <template #label>
          <span>
            <el-icon :size="20"><HomeFilled /></el-icon>
            <span style="margin-left: 6px;">首页</span>
          </span>
        </template>
      </el-tab-pane>

      <el-tab-pane name="map" label="">
        <template #label>
          <span>
            <el-icon :size="20"><MapLocation /></el-icon>
            <span style="margin-left: 6px;">地图</span>
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

      <el-tab-pane name="settings">
        <template #label>
          <span>
            <el-icon :size="20"><Setting /></el-icon>
            <span style="margin-left: 6px;">设置</span>
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
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
</style>