<script setup>
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style scoped>
body {
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
  background: #001f3f;
  color: #fff;
}

#app {
  padding: 10px;
  box-sizing: border-box;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
