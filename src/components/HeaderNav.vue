<template>
  <div class="mbe-header-container">
    <div class="mbe-user-section">
      <div class="mbe-user-icon">
        <User class="mbe-icon" />
      </div>
      <span class="mbe-greeting">Hello,</span>
      <span class="mbe-username">Jack Grealish</span>
      <div class="mbe-location">
        <Location class="mbe-location-icon" />
        <span class="mbe-city">{{ cityStore?.cityInfo?.name || '0' }}</span>
      </div>
    </div>

    <div class="mbe-switch-section">
      <div class="mbe-switch-container">
        <el-switch
          @click="emitter.emit('showOne', show)"
          v-model="show"
          inline-prompt
          active-text="七天"
          inactive-text="今天"
          class="mbe-switch"
        />
      </div>
    </div>

    <div class="mbe-search-section">
      <el-autocomplete
        style="width: 240px;"
        placeholder="请输入城市名称"
        clearable
        :prefix-icon="Search"
        class="mbe-search-input"
        v-model="cityName"
        @keyup.enter="handleSearch"
        @select="handleSearch"
        :fetch-suggestions="getHot"
      >
        <template #header>
          <div class="mbe-search-header">热门城市</div>
        </template>
      </el-autocomplete>
    </div>

    <div class="mbe-notification">
      <div class="mbe-bell-icon">
        <Bell class="mbe-icon" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search, Bell, User } from '@element-plus/icons-vue'
import { ref, nextTick, onMounted } from 'vue'
import { fetchCityAndWeather, fetchAqiData } from '@/utils/weatherHelper'
import { useCityStore } from '@/store/index'
import emitter from '@/utils/emitter'

const cityName = ref('')

const cityStore = useCityStore()
// 显示热门城市方法
const getHot = (queryString, cb) => {
  const cityNames = cityStore.hotCity.map(item => item.name);
  const results = queryString
    ? cityNames.filter(item =>
      item.toLowerCase().includes(queryString.toLowerCase())
    )
    : cityNames;
  const formattedResults = results.map(name => ({ value: name }));
  cb(formattedResults);
}

let show = ref(false)
// 创建加载状态
const isLoading = ref(false)
const aqiLoadingShow = ref(false)

async function handleSearch() {
  if (!cityName.value.trim()) return

  isLoading.value = true
  aqiLoadingShow.value = true
  // 发出开始加载的信号
  emitter.emit('loadingShow', true)
  emitter.emit('aqiLoadingShow', true)
  try {
    await fetchCityAndWeather(cityName.value)
    // 等待数据更新后检查
    await nextTick()
    emitter.emit('loadingShow', false)
    await fetchAqiData()
    await nextTick()
    emitter.emit('aqiLoadingShow', false)
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    // 无论成功失败，都解除加载状态
    isLoading.value = false
    emitter.emit('loadingShow', false)
    emitter.emit('aqiLoadingShow', false)
    cityName.value = ""
  }
}
async function initHandleSearch() {
  isLoading.value = true
  aqiLoadingShow.value = true
  // 发出开始加载的信号
  emitter.emit('loadingShow', true)
  emitter.emit('aqiLoadingShow', true)
  try {
    await fetchCityAndWeather('北京')
    // 等待数据更新后检查
    await nextTick()
    emitter.emit('loadingShow', false)
    await fetchAqiData()
    await nextTick()
    emitter.emit('aqiLoadingShow', false)
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    // 无论成功失败，都解除加载状态
    isLoading.value = false
    emitter.emit('loadingShow', false)
    emitter.emit('aqiLoadingShow', false)
    cityName.value = ""
  }
}
onMounted(() => cityStore.getHotCity())
onMounted(() => initHandleSearch())
</script>

<style scoped>
.mbe-header-container {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 15px 20px;
  background: linear-gradient(160deg, #a8e6cf 0%, #dcedc1 100%);
  border: 2px solid #000;
  border-radius: 25px;
  box-shadow:
    4px 4px 0 #000,
    inset 3px 3px 0 rgba(255, 255, 255, 0.5);
  font-family: 'Fredoka One', 'Balsamiq Sans', 'Comic Sans MS', cursive;
  position: relative;
  margin-bottom: 20px;
  margin-top: 25px;
}

.mbe-user-section {
  display: flex;
  align-items: center;
  margin-right: auto;
  gap: 12px;
}

.mbe-user-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid #000;
  border-radius: 50%;
  box-shadow: 3px 3px 0 #000;
  transition: all 0.2s ease;
}

.mbe-user-icon:hover {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0 #000;
}

.mbe-greeting {
  font-size: 16px;
  font-weight: bold;
  color: #000;
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.8);
}

.mbe-username {
  font-size: 16px;
  font-weight: bold;
  color: #FF6B6B;
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.8);
}

.mbe-location {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.7);
  border: 2px solid #000;
  border-radius: 20px;
  padding: 4px 12px;
  box-shadow: 2px 2px 0 #000;
  transition: all 0.2s ease;
}

.mbe-location:hover {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 #000;
}

.mbe-location-icon {
  width: 20px;
  height: 20px;
  margin-right: 6px;
}

.mbe-city {
  font-size: 14px;
  font-weight: bold;
  color: #000;
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.8);
}

.mbe-switch-section {
  margin: 0 20px;
}

.mbe-switch-container {
  background: rgba(255, 255, 255, 0.7);
  border: 2px solid #000;
  border-radius: 20px;
  padding: 4px 8px;
  box-shadow: 2px 2px 0 #000;
}

.mbe-search-section {
  margin-right: 20px;
}

.mbe-search-header {
  font-weight: bold;
  color: #000;
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.8);
  padding: 8px 12px;
  font-family: 'Fredoka One', 'Balsamiq Sans', cursive;
}

.mbe-notification {
  display: flex;
  align-items: center;
}

.mbe-bell-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid #000;
  border-radius: 50%;
  box-shadow: 3px 3px 0 #000;
  transition: all 0.2s ease;
}

.mbe-bell-icon:hover {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0 #000;
}

.mbe-icon {
  width: 20px;
  height: 20px;
}

/* Element Plus 组件样式覆盖 */
:deep(.mbe-switch .el-switch__core) {
  border: 2px solid #000 !important;
  box-shadow: 2px 2px 0 #000 !important;
}

:deep(.mbe-switch .el-switch__action) {
  border: 2px solid #000 !important;
  box-shadow: 1px 1px 0 #000 !important;
}

:deep(.mbe-search-input .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.8) !important;
  border: 2px solid #000 !important;
  border-radius: 20px !important;
  box-shadow:
    3px 3px 0 #000,
    inset 2px 2px 0 rgba(255, 255, 255, 0.5) !important;
  font-family: 'Fredoka One', 'Balsamiq Sans', cursive !important;
}

:deep(.mbe-search-input .el-input__wrapper:hover) {
  box-shadow:
    2px 2px 0 #000,
    inset 2px 2px 0 rgba(255, 255, 255, 0.5) !important;
  transform: translate(1px, 1px);
}

:deep(.mbe-search-input .el-input__wrapper.is-focus) {
  box-shadow:
    2px 2px 0 #000,
    inset 2px 2px 0 rgba(255, 255, 255, 0.5) !important;
}

:deep(.mbe-search-input .el-input__inner) {
  color: #000 !important;
  font-weight: bold !important;
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.8) !important;
}

:deep(.mbe-search-input .el-input__inner::placeholder) {
  color: #666 !important;
  font-weight: normal !important;
}

:deep(.el-autocomplete-suggestion) {
  border: 2px solid #000 !important;
  border-radius: 15px !important;
  box-shadow: 3px 3px 0 #000 !important;
  background: rgba(255, 255, 255, 0.95) !important;
}

:deep(.el-autocomplete-suggestion li) {
  color: #000 !important;
  font-family: 'Fredoka One', 'Balsamiq Sans', cursive !important;
  font-weight: bold !important;
}

:deep(.el-autocomplete-suggestion li:hover) {
  background: rgba(168, 230, 207, 0.3) !important;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .mbe-header-container {
    flex-wrap: wrap;
    padding: 12px 15px;
    gap: 12px;
  }

  .mbe-user-section {
    order: 1;
    width: 100%;
    justify-content: center;
    margin-bottom: 10px;
  }

  .mbe-switch-section {
    order: 2;
    margin: 0;
  }

  .mbe-search-section {
    order: 3;
    margin: 0;
    flex-grow: 1;
  }

  .mbe-notification {
    order: 4;
  }

  .mbe-greeting, .mbe-username {
    font-size: 14px;
  }

  .mbe-location {
    padding: 2px 8px;
  }

  .mbe-city {
    font-size: 12px;
  }
}
</style>
