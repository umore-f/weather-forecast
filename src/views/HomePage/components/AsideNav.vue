<template>
  <div class="sidebar">
    <div class="menu-item">
      <div class="icon-container">
        <el-icon :size="24">
          <router-link to="/">
            <HomeFilled />
          </router-link>
        </el-icon>
      </div>
    </div>
    <div class="menu-item">
      <div class="icon-container">
        <el-icon :size="24">
          <MapLocation />
        </el-icon>
      </div>
    </div>
    <div class="menu-item">
      <div class="icon-container">
        <el-icon :size="24">
          <router-link to="/analyse">
            <TrendCharts />
          </router-link>
        </el-icon>
      </div>
    </div>
    <div class="menu-item">
      <div class="icon-container">
        <el-icon :size="24">
          <Setting />
        </el-icon>
      </div>
    </div>
    <div class="menu-item">
      <div class="icon-container">
        <el-icon :size="24">
          <router-link to="/score">
          <Opportunity />
          </router-link>
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>

</script>

<style scoped>
.sidebar {
  width: 80%;
  height: auto;
  margin-top: 110px;
  margin-left: 10%;
  text-align: center;
  border-radius: 12px;
  padding: 20px 0;
  background: #ffffff;
  border: 1px solid #e9ecef;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}

.menu-item {
  margin-bottom: 20px;
  margin-top: 5px;
  display: flex;
  justify-content: center;
}

.menu-item:last-child {
  margin-bottom: 0px;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  box-shadow: none;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.icon-container:hover {
  background: #e9ecef;
  border-color: #ced4da;
  transform: translateY(-1px);
  box-shadow: none;
}

.icon-container:active {
  transform: translateY(1px);
}

/* 图标样式 */
.icon-container .el-icon {
  color: #495057;
  transition: color 0.2s ease;
}

.icon-container:hover .el-icon {
  color: #212529;
  transform: none;
}

/* 移除所有装饰性伪元素 */
.sidebar::before,
.sidebar::after,
.menu-item .icon-container::before,
.menu-item .icon-container::after {
  display: none;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .sidebar {
    width: 90%;
    margin-left: 5%;
    padding: 15px 0;
  }

  .icon-container {
    width: 40px;
    height: 40px;
  }

  .menu-item {
    margin-bottom: 25px;
  }
}
</style>
