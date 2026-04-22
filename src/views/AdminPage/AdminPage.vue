<template>
  <div class="admin-container">
    <div class="admin-header">
      <h2>用户管理</h2>
      <el-button type="danger" @click="handleLogout">退出登录</el-button>
    </div>
    <el-table :data="userList" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="created_at" label="注册时间" width="180">
        <template #default="{ row }">
          {{ new Date(row.created_at).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button type="primary" link @click="viewSettings(row.id)">查看设置</el-button>
          <el-button type="primary" link @click="setDisable(row.id)" :disabled="!row.is_life">禁用</el-button>
          <el-button type="primary" link @click="setEnable(row.id)" :disabled="row.is_life">启用</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 用户设置详情弹窗 -->
    <el-dialog v-model="dialogVisible" title="用户个性化设置" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="默认城市">
          {{ userSettings.display_cities?.join(', ') || '未设置' }}
        </el-descriptions-item>
        <el-descriptions-item label="天气字段">
          {{ userSettings.weather_fields?.join(', ') || '未设置' }}
        </el-descriptions-item>
        <el-descriptions-item label="数据源">
          {{ userSettings.data_sources?.join(', ') || '未设置' }}
        </el-descriptions-item>
        <el-descriptions-item label="起始日期">
          {{ userSettings.date_start || '未设置' }}
        </el-descriptions-item>
        <el-descriptions-item label="结束日期">
          {{ userSettings.date_end || '未设置' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUsers, getUserSettingsById, disableUserById, enableUserById } from '@/apis/admin'
import { useUserSettingsStore } from '@/store/userSettings'
import { emitter } from '@/utils/eventBus'

const router = useRouter()
const settingsStore = useUserSettingsStore()

const userList = ref([])
const dialogVisible = ref(false)
const userSettings = ref({})

const fetchUsers = async () => {
  try {
    const res = await getUsers()
    userList.value = res.data
  // eslint-disable-next-line no-unused-vars
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  }
}

const viewSettings = async (userId) => {
  try {
    const res = await getUserSettingsById(userId)
    userSettings.value = res.data
    dialogVisible.value = true
  // eslint-disable-next-line no-unused-vars
  } catch (error) {
    ElMessage.error('获取用户设置失败')
  }
}
const setDisable = async (userId) => {
  try {
    const res = await disableUserById(userId)
    fetchUsers()
    ElMessage.success(res.data.message)
  // eslint-disable-next-line no-unused-vars
  } catch (error) {
    ElMessage.error('获取用户设置失败')
  }
}
const setEnable = async (userId) => {
  try {
    const res = await enableUserById(userId)
    fetchUsers()
    ElMessage.success(res.data.message)
  // eslint-disable-next-line no-unused-vars
  } catch (error) {
    ElMessage.error('获取用户设置失败')
  }
}
// 退出登录
const handleLogout = () => {
  // 清除本地存储
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('role')
  // 重置 store
  settingsStore.reset()
  // 跳转到登录页
  emitter.emit('userLoggedOut')
  router.push('/login')
  ElMessage.success('已退出登录')
}

onMounted(() => {
  // window.location.reload()
  fetchUsers()
})
</script>

<style scoped>
.admin-container {
  padding: 20px;
}
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
