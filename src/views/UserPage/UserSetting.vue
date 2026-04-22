<template>
  <div class="user-settings-container">
    <!-- 用户个人信息卡片 -->
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
        </div>
      </template>
      <el-form :model="userInfoForm" :rules="userInfoRules" ref="userInfoFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userInfoForm.username" placeholder="请输入用户名（3-20位）" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userInfoForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="userInfoForm.password" placeholder="不修改则留空" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" v-if="userInfoForm.password">
          <el-input type="password" v-model="userInfoForm.confirmPassword" placeholder="请再次输入新密码" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="updateUserInfo2" :loading="updatingInfo">保存修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 默认显示设置卡片 -->
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>默认显示设置</span>
          <el-button type="primary" @click="saveSettings" :loading="saving">
            保存设置
          </el-button>
        </div>
      </template>

      <el-form :model="form" label-width="120px" label-position="left">
        <!-- 默认城市（多选） -->
        <el-form-item label="默认城市">
          <el-select v-model="form.display_cities" multiple filterable collapse-tags collapse-tags-tooltip
            placeholder="请选择默认显示的城市" style="width: 100%">
            <el-option v-for="city in cityOptions" :key="city.value" :label="city.label" :value="city.value" />
          </el-select>
          <div class="form-tip">可选择多个城市，将作为图表默认展示的城市</div>
        </el-form-item>

        <!-- 天气字段（多选） -->
        <el-form-item label="天气字段">
          <el-select v-model="form.weather_fields" multiple filterable collapse-tags collapse-tags-tooltip
            placeholder="请选择需要展示的天气字段" style="width: 100%">
            <el-option v-for="field in fieldScoreOptions" :key="field.value" :label="field.label" :value="field.value" />
          </el-select>
          <div class="form-tip">选择在图表或表格中显示的天气指标</div>
        </el-form-item>

        <!-- 数据源（多选） -->
        <el-form-item label="数据源">
          <el-select v-model="form.data_sources" multiple filterable collapse-tags collapse-tags-tooltip
            placeholder="请选择数据源" style="width: 100%">
            <el-option v-for="source in sourceOptions" :key="source.value" :label="source.label"
              :value="source.value" />
          </el-select>
          <div class="form-tip">选择数据来源，可多选</div>
        </el-form-item>

        <!-- 默认时间范围 -->
        <el-form-item label="默认时间范围">
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%" />
          <div class="form-tip">可选，若未选择则使用系统默认范围</div>
        </el-form-item>
      </el-form>
    </el-card>

    <div style="text-align: center; margin-top: 20px;">
      <el-button type="danger" @click="logout">退出登录</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserSettings, updateUserSettings } from '@/apis/userSetting'
import { updateUserInfo, getUserProfile } from '@/apis/user'  // 新增：修改用户信息接口
import { cityOptions, fieldScoreOptions, sourceOptions } from '@/constants/weatherOptions'
import { useUserSettingsStore } from '@/store/userSettings'
import { emitter } from '@/utils/eventBus'
import { useRouter } from 'vue-router'
const router = useRouter()
const settingsStore = useUserSettingsStore()
const saving = ref(false)
const updatingInfo = ref(false)

// 用户个人信息表单
const userInfoForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})
const userInfoFormRef = ref()
const userInfoRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3到20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { min: 6, max: 20, message: '密码长度在6到20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    {
      validator: (rule, value, callback) => {
        if (userInfoForm.password && value !== userInfoForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 加载当前用户信息
const loadUserInfo = async () => {
  try {
    const res = await getUserProfile()
    userInfoForm.username = res.data.username
    userInfoForm.email = res.data.email
    // 密码字段不填充
  // eslint-disable-next-line no-unused-vars
  } catch (error) {
    ElMessage.error('获取用户信息失败')
  }
}

// 更新用户信息
const updateUserInfo2 = async () => {
  const valid = await userInfoFormRef.value.validate()
  if (!valid) return

  updatingInfo.value = true
  try {
    const data = {
      username: userInfoForm.username,
      email: userInfoForm.email
    }
    if (userInfoForm.password) {
      data.password = userInfoForm.password
    }
    await updateUserInfo(data)
    ElMessage.success('个人信息修改成功')
    // 更新 localStorage 中的用户名（可选）
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
    storedUser.username = userInfoForm.username
    storedUser.email = userInfoForm.email
    localStorage.setItem('user', JSON.stringify(storedUser))
    // 清空密码框
    userInfoForm.password = ''
    userInfoForm.confirmPassword = ''
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '修改失败')
  } finally {
    updatingInfo.value = false
  }
}

// 默认显示设置表单
const form = reactive({
  display_cities: [],
  weather_fields: [],
  data_sources: [],
  date_start: null,
  date_end: null
})

const dateRange = computed({
  get: () => {
    if (form.date_start && form.date_end) {
      return [form.date_start, form.date_end]
    }
    return null
  },
  set: (val) => {
    if (val && val.length === 2) {
      form.date_start = val[0]
      form.date_end = val[1]
    } else {
      form.date_start = null
      form.date_end = null
    }
  }
})

const loadSettings = async () => {
  try {
    const res = await getUserSettings()
    const data = res.data
    form.display_cities = data.display_cities || []
    form.weather_fields = data.weather_fields || []
    form.data_sources = data.data_sources || []
    form.date_start = data.date_start || null
    form.date_end = data.date_end || null
  } catch (error) {
    ElMessage.error('加载设置失败：' + (error.response?.data?.message || error.message))
  }
}

const saveSettings = async () => {
  if (form.display_cities.length === 0) {
    ElMessage.warning('请至少选择一个默认城市')
    return
  }
  if (form.weather_fields.length === 0) {
    ElMessage.warning('请至少选择一个天气字段')
    return
  }
  if (form.data_sources.length === 0) {
    ElMessage.warning('请至少选择一个数据源')
    return
  }

  saving.value = true
  try {
    await updateUserSettings({ ...form })
    settingsStore.updateSettings({
      display_cities: form.display_cities,
      weather_fields: form.weather_fields,
      data_sources: form.data_sources,
      date_start: form.date_start,
      date_end: form.date_end,
    })
    ElMessage.success('设置保存成功')
  } catch (error) {
    ElMessage.error('保存失败：' + (error.response?.data?.message || error.message))
  } finally {
    saving.value = false
  }
}
const validateSettings = () => {
  if (form.display_cities.length === 0) {
    ElMessage.warning('请至少选择一个默认城市')
    return false
  }
  if (form.weather_fields.length === 0) {
    ElMessage.warning('请至少选择一个天气字段')
    return false
  }
  if (form.data_sources.length === 0) {
    ElMessage.warning('请至少选择一个数据源')
    return false
  }
  return true
}
const logout =  async () => {
  if (!validateSettings()) return
  await saveSettings()
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('role')
  emitter.emit('userLoggedOut')
  router.push('/login')
  ElMessage.success('已退出登录')
}

onMounted(() => {
  loadUserInfo()
  loadSettings()
})
</script>

<style scoped>
.user-settings-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.settings-card {
  max-width: 800px;
  margin: 0 auto 20px auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 500;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
