<template>
    <div class="full-screen-view">
        <h2>全景视频监控</h2>
        <div class="video-container">
            <video ref="videoPlayer" autoplay loop muted>
                <source :src="getCameraUrl()" type="video/mp4">
                Your browser does not support the video tag.
            </video>
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
    import { onMounted, ref } from "vue";
    const videoPlayer = ref();
    const name = ref('FullScreenView')
    const selectedCamera = ref('full_screen_video.mp4')
    const cameras = [
        {id: 1, name: '摄像头 1', src: 'full_screen_video.mp4'},
        {id: 2, name: '摄像头 2', src: 'full_screen_video_2.mp4'},
        {id: 3, name: '摄像头 3', src: 'full_screen_video_3.mp4'},
    ]
    const getCameraUrl = () => {
        return new URL(`../assets/${selectedCamera.value}`, import.meta.url).href
    }
    const changeCamera = () => {
        refreshVideo();
    }
    const refreshVideo = () => {
        const video = videoPlayer.value;
        video.load();
        video.play().catch(e => console.error('Error playing video:', e));
    }
    onMounted(() => {
        refreshVideo();
    })
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
