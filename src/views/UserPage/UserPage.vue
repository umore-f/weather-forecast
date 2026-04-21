<!-- src/views/UserPage/UserPage.vue -->
<template>
  <div class="user-page-container">
    <!-- 未登录：显示登录注册 -->
    <LoginRegister v-if="!isLoggedIn" @login-success="handleLoginSuccess" />
    <!-- 已登录：显示用户设置 -->
    <UserSetting v-else />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LoginRegister from './components/LoginRegister.vue'      // 路径根据实际调整
import UserSetting from './components/UserSetting.vue'

const isLoggedIn = ref(false)

// 检查本地 token
const checkLoginStatus = () => {
  const token = localStorage.getItem('token')
  isLoggedIn.value = !!token
}

// 登录成功回调（由 LoginRegister 触发）
const handleLoginSuccess = () => {
  isLoggedIn.value = true
}

onMounted(() => {
  checkLoginStatus()
})
</script>

<style scoped>
.user-page-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}
</style>
