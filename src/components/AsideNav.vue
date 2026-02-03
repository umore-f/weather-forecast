<template>
  <div class="mbe-sidebar">
    <div class="mbe-menu-item">
      <div class="mbe-icon-container">
        <el-icon :size="30">
          <HomeFilled />
        </el-icon>
      </div>
    </div>
    <div class="mbe-menu-item">
      <div class="mbe-icon-container">
        <el-icon :size="30">
          <MapLocation />
        </el-icon>
      </div>
    </div>
    <div class="mbe-menu-item">
      <div class="mbe-icon-container">
        <el-icon :size="30">
          <TrendCharts />
        </el-icon>
      </div>
    </div>
    <div class="mbe-menu-item">
      <div class="mbe-icon-container">
        <el-icon :size="30">
          <Setting />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
// 组件逻辑保持不变
</script>

<style scoped>
.mbe-sidebar {
  width: 80%;
  height: auto;
  margin-top: 110px;
  margin-left: 10%;
  text-align: center;
  border-radius: 25px;
  padding: 20px 0;
  background: linear-gradient(160deg, #a8e6cf 0%, #dcedc1 100%);
  border: 1px solid #000;
  box-shadow:
    3px 3px 0 #000,
    inset 3px 3px 0 rgba(255, 255, 255, 0.5);
  font-family: 'Fredoka One', 'Balsamiq Sans', 'Comic Sans MS', cursive;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}

.mbe-menu-item {
  margin-bottom: 20px;
  margin-top: 5px;
  display: flex;
  justify-content: center;

}
.mbe-menu-item:last-child {
  margin-bottom: 0px;
}
.mbe-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #000;
  border-radius: 50%;
  box-shadow:
    2px 2px 0 #000,
    inset 2px 2px 0 rgba(255, 255, 255, 0.5);
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.mbe-icon-container:hover {
  transform: translate(3px, 3px);
  box-shadow:
    1px 1px 0 #000,
    inset 2px 2px 0 rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.9);
}

.mbe-icon-container:active {
  transform: translate(4px, 4px);
  box-shadow:
    0px 0px 0 #000,
    inset 2px 2px 0 rgba(255, 255, 255, 0.5);
}

/* 为每个图标添加不同的颜色效果 */
.mbe-menu-item:nth-child(1) .mbe-icon-container:hover {
  background: rgba(255, 235, 153, 0.9);
}

.mbe-menu-item:nth-child(2) .mbe-icon-container:hover {
  background: rgba(153, 221, 255, 0.9);
}

.mbe-menu-item:nth-child(3) .mbe-icon-container:hover {
  background: rgba(255, 153, 204, 0.9);
}

.mbe-menu-item:nth-child(4) .mbe-icon-container:hover {
  background: rgba(204, 255, 153, 0.9);
}

/* 图标样式 */
.mbe-icon-container .el-icon {
  color: #000;
  filter: drop-shadow(1px 1px 0 rgba(255, 255, 255, 0.8));
  transition: all 0.2s ease;
}

.mbe-icon-container:hover .el-icon {
  transform: scale(1.1);
}

/* 添加MBE装饰元素 */
.mbe-sidebar::before {
  content: '';
  position: absolute;
  top: 15px;
  left: 15px;
  width: 15px;
  height: 15px;
  background: #FF9E44;
  border: 2px solid #000;
  border-radius: 50%;
  box-shadow: 2px 2px 0 #000;
  z-index: 1;
}

.mbe-sidebar::after {
  content: '';
  position: absolute;
  bottom: 15px;
  right: 15px;
  width: 12px;
  height: 12px;
  background: #4DABF7;
  border: 2px solid #000;
  border-radius: 50%;
  box-shadow: 2px 2px 0 #000;
  z-index: 1;
}

/* 为每个菜单项添加小装饰 */
.mbe-menu-item:nth-child(odd) .mbe-icon-container::before {
  content: '';
  position: absolute;
  top: 5px;
  right: 5px;
  width: 8px;
  height: 8px;
  background: #FF6B6B;
  border: 1px solid #000;
  border-radius: 50%;
  box-shadow: 1px 1px 0 #000;
}

.mbe-menu-item:nth-child(even) .mbe-icon-container::after {
  content: '';
  position: absolute;
  bottom: 5px;
  left: 5px;
  width: 6px;
  height: 6px;
  background: #36CFC9;
  border: 1px solid #000;
  border-radius: 50%;
  box-shadow: 1px 1px 0 #000;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .mbe-sidebar {
    width: 90%;
    margin-left: 5%;
    padding: 15px 0;
  }

  .mbe-icon-container {
    width: 50px;
    height: 50px;
  }

  .mbe-menu-item {
    margin-bottom: 25px;
  }
}
</style>
