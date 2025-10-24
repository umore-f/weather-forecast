<template>
  <div>
    <el-input style="width: 240px" placeholder="Please input" clearable />
  </div>
  
</template>

<script setup>
// import { cityApi } from '@/apis/cityApi';
// import { onMounted, ref } from 'vue'
// const cityInfo = ref([])
// const cityName = ref('')
// const getCityInfo = async (location) => {
//   const res = await cityApi.searchCity(location)
//   if (res.data.code === '200') {
//     cityInfo.value = res.data.location || []
//   } else {
//     throw new Error(res.data.message || '获取城市信息失败')
//   }
// }
// onMounted(() => getCityInfo('北京'))
// function searchCity() {
//   console.log('函数调用了吗');

//   getCityInfo(cityName.value.trim())
// }
</script>

<style scoped>

</style>
