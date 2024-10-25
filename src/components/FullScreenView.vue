<template>
    <div class="full-screen-view">
        <h2>全景视频监控</h2>
        <div class="video-container">
            <video ref="videoPlayer" controls width="100%"/>
        </div>
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
    import { onMounted, onUnmounted, ref } from "vue";
    import Hls from 'hls.js';
    
    let hls = null;
    const videoPlayer = ref();
    const selectedCamera = ref('http://localhost:8585/hls/playlist.m3u8')
    const cameras = [
        {id: 1, name: '摄像头 1', src: 'http://localhost:8585/hls/playlist.m3u8'},
        {id: 2, name: '摄像头 2', src: 'http://localhost:8585/hls/playlist.m3u8'},
        {id: 3, name: '摄像头 3', src: 'http://localhost:8585/hls/playlist.m3u8'},
    ]
    const changeCamera = () => {
        refreshVideo();
    }
    const refreshVideo = () => {
        hls.loadSource(selectedCamera.value);
        hls.attachMedia(videoPlayer.value);
        hls.on(Hls.Events.ERROR, (event, data) => {
            console.error(`HLS error: ${data.type} - ${data.details}`);
        });
    }
    onMounted(() => {
        hls = new Hls();
        hls.loadSource(selectedCamera.value);
        hls.attachMedia(videoPlayer.value);
        hls.on(Hls.Events.ERROR, (event, data) => {
            console.error(`HLS error: ${data.type} - ${data.details}`);
        });
    })
    
    onUnmounted(() => {
        if (hls) {
            hls.destroy();
        }
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
