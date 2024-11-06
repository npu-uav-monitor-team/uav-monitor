<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useAircraftData } from '@/composables/useAircraftData'

const { startUpdating, stopUpdating } = useAircraftData()

onMounted(() => {
    startUpdating()
})

onUnmounted(() => {
    stopUpdating()
})
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
</style>
