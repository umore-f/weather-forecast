<template>
  <div style="display: flex;">
    <el-button :icon="User" circle style="width: 40px;height: 40px;; text-align: center;" />
    <span>Hello,</span>
    <span>Jack Grealish</span>
    <div style="display: flex;">
      <Location style="width: 24px; height: 24px; margin-left: 12px;" /><span
        style="display: block; margin-left: 8px;">{{ cityStore.cityInfo.name }}</span>
    </div>
  </div>
  <el-switch @click="emitter.emit('showOne',show)" v-model="show" inline-prompt style=" margin-right: 10px;" active-text="未来七天" inactive-text="今天" />

  <div class="header" style="margin-right: 20px;">
    <el-input style="width: 240px;" placeholder="Please input" clearable :prefix-icon="Search" class="myInput"
      v-model="cityName" @keyup.enter="searchCityName" />
  </div>
  <el-button :icon="Bell" circle style="width: 40px;height: 40px;" />
  <!--  -->
</template>
<script setup>
import { Search, Bell, User } from '@element-plus/icons-vue'
import { ref,} from 'vue'
import {useCityStore} from '@/store/city'
const cityStore = useCityStore()
import { fetchCityAndWeather } from '@/utils/weatherHelper'
import emitter from '@/utils/emitter'
async function searchCityName() {
  try {
    const data = await fetchCityAndWeather(cityName.value)
    console.log('📊 所有数据:', data)
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}
const cityName = ref('')
let show = ref(false)
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
