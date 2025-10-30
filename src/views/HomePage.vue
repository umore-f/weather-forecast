<template>
  <div class="container">
    <el-container>
      <el-aside style="background-color: antiquewhite; width: 6vw;">Aside</el-aside>
      <el-main>
        <el-container>
          <el-header style="justify-content: end; display: flex; align-items: center">
            <HeaderNav v-model="model"/>
          </el-header>
          <el-main style="padding-bottom: 5px;">
            <CurrentWeather v-model="model"/>
            <eCharts/>
          </el-main>
        </el-container>
      </el-main>
      <el-aside style="background-color: antiquewhite; width: 16vw;">
        <AirQuality/>
      </el-aside>
    </el-container>
  </div>

</template>

<script setup>
import HeaderNav from '../components/HeaderNav.vue';
import CurrentWeather from '../components/CurrentWeatherShow.vue';
import eCharts from '@/components/eCharts.vue';
import AirQuality from '@/components/AirQuality.vue';
import { onMounted, ref } from 'vue'
import { fetchCityAndWeather } from '@/utils/weatherHelper'

const loadWeatherData = async () => {
  try {
    const data = await fetchCityAndWeather('北京')
    console.log('📊 所有数据:', data)
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}
onMounted(()=>loadWeatherData())
const model = ref(false)
</script>

<style lang="scss" scoped></style>
