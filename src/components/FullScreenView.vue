<template>
    <div class="full-screen-view">
      <h2>光电设备视频</h2>
      <div class="video-container" id="player-con"></div>
      <div class="controls">
        <select v-model="selectedCamera" @change="changeCamera">
          <option v-for="camera in cameras" :key="camera.id" :value="camera.src">
            {{ camera.name }}
          </option>
        </select>
        <button @click="refreshVideo" class="refresh-btn">刷新</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { onMounted, onUnmounted, ref, watch } from "vue";
  
  const player = ref(null);
  const selectedCamera = ref('//player.alicdn.com/video/aliyunmedia.mp4'); // 使用你的RTMP地址
  const cameras = [
    { id: 1, name: '摄像头 1', src: '//player.alicdn.com/video/aliyunmedia.mp4' }, // 替换为你的RTMP地址
    { id: 2, name: '摄像头 2', src: 'rtmp://your-rtmp-address-2' }, // 替换为你的RTMP地址
    { id: 3, name: '摄像头 3', src: 'rtmp://your-rtmp-address-3' }, // 替换为你的RTMP地址
  ];
  
  const changeCamera = () => {
    if (player.value) {
      player.value.loadByUrl(selectedCamera.value); // 仅切换视频源
    }
  };
  
  const refreshVideo = () => {
    if (player.value) {
      player.value.dispose(); // 销毁之前的播放器实例
      player.value = null; // 清空引用
    }
  
    player.value = new window.Aliplayer({
      id: 'player-con',
      source: selectedCamera.value,
      autoplay: true, // 自动播放
      isLive: true,   // 设置为直播模式
      // ...其他配置
    });
  };
  
  
  onMounted(async () => {
    // 动态加载 CSS 和 JS (如果在main.js中全局引入了，则不需要这部分)
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://g.alicdn.com/de/prismplayer/2.9.21/skins/default/aliplayer-min.css';
    document.head.appendChild(cssLink);
  
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://g.alicdn.com/de/prismplayer/2.9.21/aliplayer-min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  
    refreshVideo();
  });
  
  onUnmounted(() => {
    if (player.value) {
      player.value.dispose();
    }
  });
  
  // 监听 selectedCamera 的变化，并更新播放器
  watch(selectedCamera, () => {
    changeCamera();
  });
  
  
  </script>

<style scoped>
    .full-screen-view {
        background-color: #001f3f;
        border-radius: 10px;
        padding: 15px;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    
    h2 {
        color: #00ffff;
        text-align: center;
        margin-bottom: 15px;
    }
    
    .video-container {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        margin-bottom: 15px;
    }
    
    video {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
    }
    
    select,
    .refresh-btn {
        background-color: #003366;
        color: #00ffff;
        border: 1px solid #00ffff;
        padding: 5px 10px;
        border-radius: 5px;
        cursor: pointer;
    }
    
    select {
        flex-grow: 1;
        margin-right: 10px;
    }
    
    .refresh-btn {
        white-space: nowrap;
    }
    
    select:hover,
    .refresh-btn:hover {
        background-color: #004080;
    }
</style>
