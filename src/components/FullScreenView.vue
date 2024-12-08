<template>
    <div class="full-screen-view">
      <h3>光电设备视频</h3>
      <div class="video-container" id="player-con">
        <video :id="`video-${selectedCamera}`" autoplay width="100%" height="100%"></video>
      </div>
      <div class="controls">
        <select v-model="selectedCamera" @change="changeCamera">
          <option v-for="camera in cameras" :key="camera.id" :value="camera.id">
            {{ camera.name }}
          </option>
        </select>
        <button @click="refreshVideo" class="refresh-btn">刷新</button>
      </div>
    </div>
  </template>
  
  <script setup>
      import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
      
      const selectedCamera = ref(1); // 默认选择第一个摄像头
      const photoElectronicRtspUrl = import.meta.env.VITE_PHOTOELECTRONIC_VIDEO_URL
      
      const cameras = [
        { id: 1, name: '摄像头 1', src: photoElectronicRtspUrl }, // 替换为你的RTSP地址
        { id: 2, name: '摄像头 2', src: photoElectronicRtspUrl }, // 替换为你的RTSP地址
        { id: 3, name: '摄像头 3', src: photoElectronicRtspUrl }, // 替换为你的RTSP地址
      ];
      
      let webRtcServer = null;
      
      // 从环境变量获取 WebRTC URL
      const WEBRTC_URL = import.meta.env.VITE_PHOTOELECTRONIC_WEBRTC_URL;
      
      const changeCamera = () => {
        if (webRtcServer) {
          webRtcServer.disconnect();
          webRtcServer = null;
        }
        refreshVideo();
      };
      
      const refreshVideo = async () => {
        const rtspStr = cameras.find(camera => camera.id === selectedCamera.value).src;
        if (rtspStr) {
          await nextTick(); // 确保DOM加载完毕
          const videoElement = document.getElementById(`video-${selectedCamera.value}`);
            // eslint-disable-next-line no-undef
          webRtcServer = new WebRtcStreamer(videoElement, WEBRTC_URL);
          webRtcServer.connect(rtspStr, null, `rtptransport=tcp&timeout=60`);
        }
      };
      
      onMounted(() => {
        refreshVideo();
      });
      
      onUnmounted(() => {
        if (webRtcServer) {
          webRtcServer.disconnect();
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
        height: 40%;
        display: flex;
        flex-direction: column;
    }
    
    h3 {
        color: #00ffff;
        text-align: center;
        margin-bottom: 5px;
    }
    
    .video-container {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        margin-bottom: 15px;
        position: relative;
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
    
    .loading-spinner {
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-top: 4px solid #00ffff;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>
