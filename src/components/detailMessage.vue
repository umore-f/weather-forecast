<template>
  <div class="box weather-widget" :class="getWeatherClass()">
    <div class="title">
      <div class="mbe-text">🌅日升:&nbsp;&nbsp;{{ weatherDaysStore.days[0]?.sunrise }}</div>
      <div class="mbe-text">🌙月升:&nbsp;&nbsp;{{ weatherDaysStore.days[0]?.moonrise }}</div>
    </div>
    <div class="main">
      <div class="mbe-icon-container">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-tianqitubiao_qing"></use>
        </svg>
      </div>
      <div class="mbe-text moon-phase">{{ weatherDaysStore.days[0]?.moonPhase }}</div>
      <div class="mbe-icon-container">
        <i :class="'qi-' + `${+weatherDaysStore.days[0]?.moonPhaseIcon || '0'}`"></i>
      </div>
    </div>
    <div class="footer">
      <div class="mbe-text">🌇日落:&nbsp;&nbsp;{{ weatherDaysStore.days[0]?.sunset }}</div>
      <div class="mbe-text">🌙月落:&nbsp;&nbsp;{{ weatherDaysStore.days[0]?.moonset }}</div>
    </div>
  </div>
</template>

<script setup>
import { useWeatherDaysStore } from '@/store/index'
const weatherDaysStore = useWeatherDaysStore()

// 根据时间判断天气风格
const getWeatherClass = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 18) {
    return 'mbe-daytime';
  } else {
    return 'mbe-nighttime';
  }
}
</script>

<style scoped>
/* MBE风格基础样式 */
.box {
  display: flex;
  flex-direction: column;
  width: 95%;
  height: 240px;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 25px;
  position: relative;
  font-family: 'Fredoka One', 'Balsamiq Sans', 'Comic Sans MS', cursive;
  transition: all 0.3s ease;
}

/* 白天样式 */
.mbe-daytime {
  background: linear-gradient(160deg, #8EC5FC 0%, #E0C3FC 100%);
  border: 3px solid #000;
  border-radius: 25px;
  box-shadow:
    4px 4px 0 #000,
    inset 3px 3px 0 rgba(255, 255, 255, 0.4);
}

/* 夜晚样式 */
.mbe-nighttime {
  background: linear-gradient(160deg, #2c3e50 0%, #4a6572 100%);
  border: 3px solid #000;
  border-radius: 25px;
  box-shadow:
    4px 4px 0 #000,
    inset 3px 3px 0 rgba(255, 255, 255, 0.2);
}

/* MBE文字样式 */
.mbe-text {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  text-shadow:
    2px 2px 0 #000,
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border: 2px solid #000;
  border-radius: 15px;
  box-shadow: 2px 2px 0 #000;
  transition: all 0.2s ease;
}

.mbe-text:hover {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 #000;
}

/* 月相文字特殊样式 */
.moon-phase {
  font-size: 1.2rem;
  background: rgba(255, 215, 0, 0.3);
}

/* MBE图标容器 */
.mbe-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.3);
  border: 2px solid #000;
  border-radius: 50%;
  box-shadow: 2px 2px 0 #000;
  padding: 0.5rem;
  transition: all 0.2s ease;
  margin-right: 2px;
}

.mbe-icon-container:hover {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0 #000;
}

/* 图标样式 */
i {
  font-size: 45px;
  color: #FFD700;
  text-shadow:
    2px 2px 0 #000,
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000;
}

.icon {
  width: 4em;
  height: 4em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
  filter: drop-shadow(2px 2px 0 #000);
}

/* 布局样式 */
.title {
  display: flex;
  justify-content: space-between;
  width: 90%;
}

.main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* width: 90%; */
}

.footer {
  display: flex;
  justify-content: space-between;
  width: 90%;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .box {
    height: 220px;
  }

  .mbe-text {
    font-size: 0.9rem;
    padding: 0.4rem 0.8rem;
  }

  .moon-phase {
    font-size: 1rem;
  }

  i {
    font-size: 35px;
  }

  .icon {
    width: 3em;
    height: 3em;
  }

  .title,
  .main,
  .footer {
    width: 95%;
  }
}

/* 添加一些MBE装饰元素 */
.box::before {
  content: '';
  position: absolute;
  top: 10px;
  right: 20px;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.3);
  border: 2px solid #000;
  border-radius: 50%;
  box-shadow: 2px 2px 0 #000;
  z-index: 1;
}

.box::after {
  content: '';
  position: absolute;
  bottom: 10px;
  left: 20px;
  width: 15px;
  height: 15px;
  background: rgba(255, 255, 255, 0.3);
  border: 2px solid #000;
  border-radius: 50%;
  box-shadow: 2px 2px 0 #000;
  z-index: 1;
}
</style>
