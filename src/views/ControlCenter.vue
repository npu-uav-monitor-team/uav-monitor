<template>
    <div id="home">
        <div class="title-container">
            <h1 class="main-title">低空经济飞行器指挥控制管理系统</h1>
            <button @click="goToTracking()" class="main-button">
                追踪页面
            </button>
            <button @click="goToMonitorCenter()" class="main-button">
                设备监控中心
            </button>
        </div>
        
        <div class="main-container">
            <div class="left-panel">
                <RadarView/>
            </div>
            <div class="right-panel">
                <FullScreenView/>
                <ControlPanel/>
            </div>
        </div>
    </div>
</template>

<script setup>
    import FullScreenView from "../components/FullScreenView.vue";
    import ControlPanel from "../components/ControlPanel.vue";
    import RadarView from "../components/RadarView.vue";
    import { useRouter } from "vue-router";
    
    const router = useRouter()
    
    const goToTracking = async () => {
        await router.push("/tracking");
    }
    
    const goToMonitorCenter = async () => {
        await router.push("/monitor-center");
    }
</script>

<style scoped>
    #home {
        padding: 10px;
        box-sizing: border-box;
        height: 100vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    
    .title-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .main-title {
        flex: 1;
        text-align: center;
    }
    
    .main-button {
        background-color: #004080;
        color: #ffffff;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        margin-right: 10px;
    }
    
    .main-button:hover {
        background-color: #0059b3;
    }
    
    .main-title {
        text-align: center;
        color: #ffffff;
        margin: 0;
        padding: 10px 0;
        font-size: 28px;
        font-weight: bold;
    }
    
    .main-container {
        display: flex;
        flex-grow: 1;
        gap: 10px;
    }
    
    .left-panel {
        flex: 3;
        display: flex;
        flex-direction: column;
    }
    
    .right-panel {
        flex: 2;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .left-panel, .right-panel > * {
        border: 1px solid #00ffff;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
    }
</style>
