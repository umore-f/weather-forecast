<template>
  <div class="header-container">
    <div class="user-section">
      <div class="location">
        <el-tooltip
        effect="light"
        content="默认城市: 北京"
        placement="bottom"
        >
          <span class="city">{{ searchValue }}</span>
        </el-tooltip>
      </div>
    </div>

    <div class="switch-section">

      <div class="switch-container">
        <span style="margin-right: 16px;">数据来源:</span>
        <el-switch
          v-model="showSource"
          inline-prompt
          active-text="  和风天气  "
          inactive-text="tomorrow.io"
          class="switch"
          @change="switchSource"
          size="large"
        />
      </div>
      <div class="switch-container1">
        <span style="margin-right: 16px;">范围:</span>
        <el-switch
          v-model="showTime"
          inline-prompt
          active-text="24小时"
          inactive-text="实时"
          class="switch"
          @change="switchTime"
          size="large"
        />
      </div>
    </div>

    <div class="search-section">
      <el-autocomplete
        style="width: 240px;"
        placeholder="请输入城市名称,仅支持部分城市"
        v-model="searchValue"
        :fetch-suggestions="remoteSearch"
        clearable
        :debounce="300"
        @select="handleSelect"
        class="search-input"
      >
        <template #header>
          <div class="search-header">城市信息</div>
        </template>
        <template #default="{ item }">
          <div class="value">{{ item.value }}</div>
          <span class="link">所属区域: {{ item.extra }}</span>
          <p class="link">位置: {{ item.lon }},{{ item.lat }}</p>
        </template>
      </el-autocomplete>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { cityApi } from '@/apis/city'
import { emitter } from '../../../utils/eventBus'
import { useUserPreferences } from '@/composables/useUserPreferences'

// 用户设置
const { defaultCities, defaultSources, loaded } = useUserPreferences()
const searchValue = ref('')
const showSource = ref(true)
const showTime = ref(false)

const remoteSearch = async (queryString, cb) => {
  if (!queryString) {
    cb([])
    return
  }

  try {
    const response = await cityApi.getCityInfo(queryString)
    const cityData = response.data?.data  // 这是一个对象

    // 防御：如果没有数据或数据不是对象，返回空数组
    if (!cityData || typeof cityData !== 'object' || Object.keys(cityData).length === 0) {
      cb([])
      return
    }

    // 将单个对象包装成数组，再映射成组件需要的格式
    const suggestions = [cityData].map(item => ({
      value: item.name,                     // 显示文本
      id: item.id,
      extra: item.province,
      lon: item.lon ? Number(item.lon).toFixed(2) : null,
      lat: item.lat ? Number(item.lat).toFixed(2) : null
    }))

    cb(suggestions)
  } catch (error) {
    ElMessage.error('获取城市建议失败',error)
    cb([])
  }
}
// 监听用户设置加载完成，应用默认城市和数据源
watch(loaded, (isLoaded) => {
  if (!isLoaded) return

  // 处理默认城市
  if (defaultCities.value && defaultCities.value.length > 0) {
    const defaultCity = defaultCities.value[0]
    searchValue.value = defaultCity
    // 触发城市变更事件，通知其他组件
    emitter.emit('cityName', defaultCity)
  } else {
    searchValue.value = '北京'
    emitter.emit('cityName', '北京')
  }
  // 处理默认数据源
  if (defaultSources.value && defaultSources.value.length > 0) {
    const firstSource = defaultSources.value[0]
    showSource.value = (firstSource === 'QWeather')   // true=和风, false=tomorrow.io
    emitter.emit('source', showSource.value)
  } else {
    showSource.value = 'QWeather'
    emitter.emit('source', 'QWeather')  // 未登录或无设置，开关置为未选中（或禁用）
  }
}, { immediate: true })
const handleSelect = (item) => {
  emitter.emit('cityName', item.value)
}
const switchSource = (showSource) => {
  emitter.emit('source', showSource)
}
const switchTime = (showTime) => {
  emitter.emit('time', showTime)
}
</script>

<style scoped>
.header-container {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 24px;
  background: #ffffff;
  border-bottom: 1px solid #e9ecef;
  border-radius: 0;
  box-shadow: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  margin-bottom: 0;
  margin-top: 0;
  transition: all 0.2s ease;
}

/* 用户区域 */
.user-section {
  display: flex;
  align-items: center;
  margin-right: auto;
  gap: 12px;
}

.user-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #f8f9fa;
  border: none;
  border-radius: 50%;
  box-shadow: none;
  transition: background 0.2s ease;
}

.user-icon:hover {
  background: #e9ecef;
  transform: none;
  box-shadow: none;
}

.greeting {
  font-size: 14px;
  font-weight: 500;
  color: #6c757d;
  text-shadow: none;
}

.username {
  font-size: 14px;
  font-weight: 600;
  color: #212529;
  text-shadow: none;
}

.location {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border: none;
  border-radius: 20px;
  padding: 4px 12px;
  box-shadow: none;
  transition: background 0.2s ease;
}

.location:hover {
  background: #e9ecef;
  transform: none;
  box-shadow: none;
}

.location-icon {
  width: 16px;
  height: 16px;
  margin-right: 6px;
  color: #6c757d;
}

.city {
  font-size: 13px;
  font-weight: 500;
  color: #495057;
  text-shadow: none;
}

/* Switch 区域 */
.switch-section {
  margin: 0 16px;
  display: flex;
}

.switch-container {
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  margin-right: 16px;
  width: 180px;
}
.switch-container1 {
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  margin-right: 16px;
  width: 120px;
}

/* 搜索区域 */
.search-section {
  margin-right: 16px;
}

.search-header {
  font-weight: 500;
  color: #495057;
  text-shadow: none;
  padding: 8px 12px;
  font-family: inherit;
  font-size: 13px;
  border-bottom: 1px solid #e9ecef;
}

.notification {
  display: flex;
  align-items: center;
}

.bell-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #f8f9fa;
  border: none;
  border-radius: 50%;
  box-shadow: none;
  transition: background 0.2s ease;
  cursor: pointer;
}

.bell-icon:hover {
  background: #e9ecef;
  transform: none;
  box-shadow: none;
}

.icon {
  width: 18px;
  height: 18px;
  color: #495057;
}

/* Element Plus 组件简约风格覆盖 */
:deep(.switch .el-switch__core) {
  border: 1px solid #dee2e6 !important;
  background-color: #e9ecef !important;
  box-shadow: none !important;
  transition: all 0.2s ease;
}

:deep(.switch .el-switch__core .el-switch__action) {
  background-color: #ffffff !important;
  border: 1px solid #dee2e6 !important;
  box-shadow: none !important;
}

:deep(.switch.is-checked .el-switch__core) {
  border-color: #4c6ef5 !important;
  background-color: #4c6ef5 !important;
}

:deep(.search-input .el-input__wrapper) {
  background: #ffffff !important;
  border: 1px solid #dee2e6 !important;
  border-radius: 8px !important;
  box-shadow: none !important;
  transition: all 0.2s ease;
  padding: 2px 12px;
}

:deep(.search-input .el-input__wrapper:hover) {
  border-color: #adb5bd !important;
  box-shadow: none !important;
  transform: none;
}

:deep(.search-input .el-input__wrapper.is-focus) {
  border-color: #4c6ef5 !important;
  box-shadow: 0 0 0 2px rgba(76, 110, 245, 0.1) !important;
}

:deep(.search-input .el-input__inner) {
  color: #212529 !important;
  font-weight: 400 !important;
  text-shadow: none !important;
  font-family: inherit !important;
}

:deep(.search-input .el-input__inner::placeholder) {
  color: #adb5bd !important;
  font-weight: 400 !important;
}

:deep(.el-autocomplete-suggestion) {
  border: 1px solid #e9ecef !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
  background: #ffffff !important;
}

:deep(.el-autocomplete-suggestion li) {
  color: #495057 !important;
  font-family: inherit !important;
  font-weight: 400 !important;
  font-size: 13px;
}

:deep(.el-autocomplete-suggestion li:hover) {
  background: #f8f9fa !important;
}

/* 响应式调整 - 简约风格适配 */
@media (max-width: 768px) {
  .header-container {
    flex-wrap: wrap;
    padding: 12px 16px;
    gap: 12px;
  }

  .user-section {
    order: 1;
    width: 100%;
    justify-content: flex-start;
    margin-bottom: 0;
  }

  .switch-section {
    order: 2;
    margin: 0;
  }

  .search-section {
    order: 3;
    margin: 0;
    flex-grow: 1;
  }

  .notification {
    order: 4;
  }

  .greeting, .username {
    font-size: 13px;
  }

  .location {
    padding: 2px 10px;
  }

  .city {
    font-size: 12px;
  }

  :deep(.search-input .el-input__wrapper) {
    padding: 2px 8px;
  }
}
</style>
