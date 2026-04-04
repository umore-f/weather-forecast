<template>
  <div class="player-controls">
    <el-button-group>
      <el-button size="small" :icon="'el-icon-video-play'" @click="start" :disabled="isPlaying">播放</el-button>
      <el-button size="small" :icon="'el-icon-video-pause'" @click="stop" :disabled="!isPlaying">暂停</el-button>
      <el-button size="small" :icon="'el-icon-refresh-right'" @click="reset">重置</el-button>
    </el-button-group>
    <el-slider
      v-model="stepModel"
      :min="0"
      :max="maxStep"
      :step="step"
      show-stops
      :disabled="isPlaying"
      style="width: 200px; margin-left: 12px;"
    />
    <span class="playback-date">{{ currentDate }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { convertToLocalDate } from '../../../utils/dateUtils'

const isPlaying = defineModel('isPlaying', { type: Boolean })
const maxStep = defineModel('maxStep', { type: Number })
const uniqueDates = defineModel('uniqueDates', { type: Array })
const step = defineModel('step', { type: Number })

const stepModel = step

// 当前日期显示
const currentDate = computed(() => {
  const dates = uniqueDates.value
  const idx = step.value
  if (dates?.length && idx >= 0 && idx < dates.length) {
    return convertToLocalDate(dates[idx])
  }
  return ''
})
const start = () => { isPlaying.value = true }
const stop = () => { isPlaying.value = false }
const reset = () => {
  step.value = 0
  isPlaying.value = false
}
</script>

<style scoped>
.player-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.playback-date {
  margin-left: 12px;
  font-size: 13px;
  color: #3b82f6;
  font-weight: 500;
}
</style>
