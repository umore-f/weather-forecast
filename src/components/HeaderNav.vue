<template>
  <div style="display: flex;">
    <el-button :icon="User" circle style="width: 40px;height: 40px;; text-align: center;" />
    <span>Hello,</span>
    <span>Jack Grealish</span>
    <div style="display: flex;">
      <Location style="width: 24px; height: 24px; margin-left: 12px;" /><span
        style="display: block; margin-left: 8px;">{{ cityStore?.cityInfo?.name || '0' }}</span>
    </div>
  </div><el-switch @click="emitter.emit('showOne', show)" v-model="show" inline-prompt style=" margin-right: 10px;"
    active-text="七天" inactive-text="今天" />

  <div class="header" style="margin-right: 20px;">
    <el-autocomplete style="width: 240px;" placeholder="Please input" clearable :prefix-icon="Search" class="myInput"
      v-model="cityName" @keyup.enter="handleSearch" @select="handleSearch" :fetch-suggestions="getHot"><template
        #header>热门城市</template></el-autocomplete>
  </div>
  <el-button :icon="Bell" circle style="width: 40px;height: 40px;" />
</template>
<script setup>
import { Search, Bell, User } from '@element-plus/icons-vue'
import { ref,nextTick, onMounted } from 'vue'
import { fetchCityAndWeather,fetchAqiData } from '@/utils/weatherHelper'
import {useCityStore,useWeatherNowStore,useWeatherHoursStore,useWeatherDaysStore} from '@/store/index'
import emitter from '@/utils/emitter'
// const nowStore = useWeatherNowStore()
// const hoursStore = useWeatherHoursStore()
// const daysStore = useWeatherDaysStore()

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
  emitter.emit('aqiLoadingShow',true)
  try {
    await fetchCityAndWeather(cityName.value)
    // 等待数据更新后检查
    await nextTick()
    emitter.emit('loadingShow', false)
    await fetchAqiData()
    await nextTick()
    emitter.emit('aqiLoadingShow',false)
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    // 无论成功失败，都解除加载状态
    isLoading.value = false
    emitter.emit('loadingShow', false)
    emitter.emit('aqiLoadingShow',false)
    cityName.value = ""
  }
}
onMounted(() => cityStore.getHotCity())
</script>

<style scoped>
div:nth-child(1) {
  margin-right: auto;
}

span {
  line-height: 40px;
}

svg {
  margin-top: 4px;
}
</style>
