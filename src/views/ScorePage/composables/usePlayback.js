import { ref, watch, onBeforeUnmount } from 'vue'

export function usePlayback(uniqueDates) {


  const isPlaying = ref(false)
  const playbackStep = ref(0)
  const maxPlaybackStep = ref(0)
  let playbackInterval = null

  const updateMaxStep = () => {

    maxPlaybackStep.value = uniqueDates.value.length > 0 ? uniqueDates.value.length - 1 : 0
    if (playbackStep.value > maxPlaybackStep.value) playbackStep.value = 0
  }

  watch(uniqueDates, updateMaxStep, { immediate: true })
  
  const startPlayback = () => {
    console.log('startPlayback 被调用了')
    if (isPlaying.value) return
    if (playbackStep.value >= maxPlaybackStep.value) playbackStep.value = 0
    isPlaying.value = true
    playbackInterval = setInterval(() => {
      if (playbackStep.value < maxPlaybackStep.value) {
        playbackStep.value++
      } else {
        stopPlayback()
      }
    }, 800)
  }

  const stopPlayback = () => {
    if (playbackInterval) clearInterval(playbackInterval)
    isPlaying.value = false
  }

  const resetPlayback = () => {
    stopPlayback()
    playbackStep.value = 0
  }

  const onPlaybackStepChange = (val) => {

    playbackStep.value = val
  }

  onBeforeUnmount(() => {
    if (playbackInterval) clearInterval(playbackInterval)
  })

  return {
    isPlaying,
    playbackStep,
    maxPlaybackStep,
    startPlayback,
    stopPlayback,
    resetPlayback,
    onPlaybackStepChange
  }
}
