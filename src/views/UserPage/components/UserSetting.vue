<template>
  <div class="user-settings-container">
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>用户个性化设置</span>
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
        <el-button type="danger" @click="logout">退出登录</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserSettings, updateUserSettings } from '@/apis/userSetting'
import { cityOptions, fieldScoreOptions, sourceOptions } from '@/constants/weatherOptions'
import { useUserSettingsStore } from '@/store/userSettings'
const settingsStore = useUserSettingsStore()

const saving = ref(false)

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('role')
  window.location.reload()  // 刷新页面，UserPage 会重新检测登录状态
}

// 表单数据（与后端字段匹配）
const form = reactive({
  display_cities: [],
  weather_fields: [],
  data_sources: [],
  date_start: null,
  date_end: null
})

// 日期范围选择器的双向绑定（辅助）
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

// 加载已有设置
const loadSettings = async () => {
  try {
    const res = await getUserSettings()
    const data = res.data
    // 回填表单
    form.display_cities = data.display_cities || []
    form.weather_fields = data.weather_fields || []
    form.data_sources = data.data_sources || []
    form.date_start = data.date_start || null
    form.date_end = data.date_end || null
  } catch (error) {
    ElMessage.error('加载设置失败：' + (error.response?.data?.message || error.message))
  }
}

// 保存设置
const saveSettings = async () => {
  // 简单前端校验：至少选择一个城市？根据需求可自定义
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
    // 更新本地 store
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

onMounted(() => {
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
  margin: 0 auto;
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
