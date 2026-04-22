<template>
  <div class="auth-container">
    <el-card class="auth-card">
      <el-tabs v-model="activeTab" class="auth-tabs">
        <!-- 登录选项卡 -->
        <el-tab-pane label="登录" name="login">
          <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" label-width="80px">
            <el-form-item label="角色" prop="role">
              <el-radio-group v-model="loginForm.role">
                <el-radio label="user">普通用户</el-radio>
                <el-radio label="admin">管理员</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="用户名" prop="username">
              <el-input v-model="loginForm.username" placeholder="请输入用户名" />
            </el-form-item>

            <el-form-item label="密码" prop="password">
              <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleLogin" :loading="loading" style="width: 100%">
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 注册选项卡（仅普通用户） -->
        <el-tab-pane label="注册" name="register">
          <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" label-width="80px">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="registerForm.username" placeholder="请输入用户名（3-20位）" />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="registerForm.email" placeholder="请输入邮箱" />
            </el-form-item>

            <el-form-item label="密码" prop="password">
              <el-input v-model="registerForm.password" type="password" placeholder="请输入密码（6-20位）" show-password />
            </el-form-item>

            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" show-password />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleRegister" :loading="loading" style="width: 100%">
                注册
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { adminLogin } from '@/apis/admin'
import { register, userLogin } from '@/apis/user'
import { useRouter } from 'vue-router'
import { emitter } from '@/utils/eventBus'
const router = useRouter()
const emit = defineEmits(['login-success'])
const activeTab = ref('login')
const loading = ref(false)
import { useUserSettingsStore } from '@/store/userSettings'
const settingsStore = useUserSettingsStore()
// 登录表单
const loginForm = reactive({
  role: 'user',
  username: '',
  password: ''
})

const loginFormRef = ref()
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3到20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6到20个字符', trigger: 'blur' }
  ]
}

// 注册表单
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const registerFormRef = ref()
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3到20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6到20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 处理登录
const handleLogin = async () => {
  const valid = await loginFormRef.value.validate()
  if (!valid) return
  // 清空旧数据
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('role')
  settingsStore.reset()  // 重置 store
  loading.value = true
  try {
    let response
    if (loginForm.role === 'user') {
      response = await userLogin({
        username: loginForm.username,
        password: loginForm.password
      })
    } else {
      response = await adminLogin({
        username: loginForm.username,
        password: loginForm.password
      })
    }

    const { token, user, admin } = response.data
    if (user&&!user.is_life) {
      ElMessage.error('该账户已禁用!')
      return
    }
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user || admin))
    localStorage.setItem('role', loginForm.role)
    emitter.emit('userLoggedIn')
    ElMessage.success(response.data.message)

    if (loginForm.role === 'admin') {
      router.push('/admin/users')   // 跳转到管理员页面
    } else {
      router.push('/user')
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '登录失败')
  } finally {
    loading.value = false
  }
}

// 处理注册
const handleRegister = async () => {
  const valid = await registerFormRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    const response = await register({
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password
    })

    const { token, user } = response.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('role', 'user')

    ElMessage.success('注册成功')
    emit('login-success')
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
}

.auth-card {
  width: 450px;
  border-radius: 8px;
}

.auth-tabs {
  margin: 20px;
}
</style>
