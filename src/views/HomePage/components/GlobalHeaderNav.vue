<template>
  <div class="custom-tabs-wrapper">
    <el-tabs v-model="activeTab" @tab-click="handleTabClick" style="display: flex; justify-content: space-between;">
      <el-tab-pane name="home">
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

      <el-tab-pane name="user">
        <template #label>
          <span>
            <el-icon :size="20"><User /></el-icon>
            <span style="margin-left: 6px;">{{ personalLabel }}</span>
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { emitter } from '@/utils/eventBus'

const router = useRouter()
const route = useRoute()

const userRole = ref('')
const currentUsername = ref('')

const updateUserInfo = () => {
  userRole.value = localStorage.getItem('role') || ''
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const userObj = JSON.parse(userStr)
      currentUsername.value = userObj.username || ''
    } catch {
      currentUsername.value = ''
    }
  } else {
    currentUsername.value = ''
  }
}

const personalLabel = computed(() => {
  if (!userRole.value) return '登录/注册'
  const roleLabel = userRole.value === 'admin' ? '管理员' : '个人'
  return currentUsername.value ? `${roleLabel}: ${currentUsername.value}` : roleLabel
})

// 根据登录状态决定个人tab跳转的路由名称
const getPersonalRouteName = () => {
  if (!userRole.value) return 'login'
  if (userRole.value === 'admin') return 'AdminUsers'
  return 'user'
}

// 当前激活的tab：如果当前路由是 login 或 AdminUsers，则高亮 user tab
const activeTab = computed(() => {
  if (route.name === 'login' || route.name === 'AdminUsers') return 'user'
  return route.name
})

const handleTabClick = (tab) => {
  const tabName = tab.props.name
  let targetRouteName = tabName
  if (tabName === 'user') {
    targetRouteName = getPersonalRouteName()
  }
  if (targetRouteName && targetRouteName !== route.name) {
    router.push({ name: targetRouteName })
  }
}

onMounted(() => {
  updateUserInfo()
  emitter.on('userLoggedIn', updateUserInfo)
  emitter.on('userLoggedOut', updateUserInfo)
})

onUnmounted(() => {
  emitter.off('userLoggedIn', updateUserInfo)
  emitter.off('userLoggedOut', updateUserInfo)
})
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
