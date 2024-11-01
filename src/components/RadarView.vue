<template>
    <div class="radar-view">
        <div class="radar-content">
            <div class="screen-header">
                <h2>全景视频</h2>
                <div class="device-selector">
                    <select v-model="selectedStream" @change="changeStream">
                        <option value="1">全景视频1</option>
                        <option value="2">全景视频2</option>
                    </select>
                </div>
                <div class="screen-controls">
                    <button @click="refresh">刷新</button>
                </div>
            </div>
            <div class="device-display">
                <div class="video-container" id="radar-video-con">
                    <div v-if="isLoading" class="loading-spinner"></div>
                    <video v-else id="radar-video" autoplay width="100%" height="100%"></video>
                </div>
            </div>
            <div class="device-controls">
                <div class="controls-container">
                    <!-- 雷制 -->
                    
                    <!-- 详细设置按钮 -->
                   
                </div>
            </div>
        </div>
        <div class="illegal-aircraft-list">
            <h2>非法飞行物列表</h2>
            <div class="table-container">
                <table>
                    <thead>
                    <tr>
                        <th colspan="1"></th>
                        <th colspan="6">雷达数据</th>
                        <th colspan="6">电侦数据</th>
                        <th colspan="3">融合数据</th>
                    </tr>
                    <tr>
                        <th>ID</th>
                        <th>距离</th>
                        <th>方位角</th>
                        <th>俯仰角</th>
                        <th>速度</th>
                        <th>经度</th>
                        <th>纬度</th>
                        <th>频段</th>
                        <th>型号</th>
                        <th>来源</th>
                        <th>信号强度</th>
                        <th>经度</th>
                        <th>纬度</th>
                        <th>经度</th>
                        <th>纬度</th>
                        <th>方位角</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>01</td>
                        <td>1KM</td>
                        <td>50°</td>
                        <td>160°</td>
                        <td>300km/h</td>
                        <td>25.4562</td>
                        <td>113.2456</td>
                        <td>2.4G</td>
                        <td>Mavic3</td>
                        <td>无人机</td>
                        <td>强</td>
                        <td>25.4562</td>
                        <td>113.2456</td>
                        <td>25.4562</td>
                        <td>113.2456</td>
                        <td>52°</td>
                    </tr>
                    <tr>
                        <td>02</td>
                        <td>2KM</td>
                        <td>60°</td>
                        <td>150°</td>
                        <td>250km/h</td>
                        <td>26.1234</td>
                        <td>114.5678</td>
                        <td>5.8G</td>
                        <td>Phantom4</td>
                        <td>无人机</td>
                        <td>中</td>
                        <td>26.1234</td>
                        <td>114.5678</td>
                        <td>26.1234</td>
                        <td>114.5678</td>
                        <td>60°</td>
                    </tr>
                    <tr>
                        <td>03</td>
                        <td>3KM</td>
                        <td>70°</td>
                        <td>140°</td>
                        <td>200km/h</td>
                        <td>27.9876</td>
                        <td>115.6789</td>
                        <td>1.2G</td>
                        <td>Inspire2</td>
                        <td>无人机</td>
                        <td>弱</td>
                        <td>27.9876</td>
                        <td>115.6789</td>
                        <td>27.9876</td>
                        <td>115.6789</td>
                        <td>70°</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <!-- 添加按钮 -->
        <div class="button-group">
            <button @click="handleRadarGuide">雷达引导</button>
            <button @click="handleElectronicGuide">电侦引导</button>
            <button @click="handleFusionGuide">融合引导</button>
            <button @click="handleInterference">干扰</button>
            <button @click="handleDeception">诱骗</button>
        </div>
        <!-- 设置弹窗 -->
        <div v-if="showSettings" class="settings-modal">
            <div class="settings-content">
                <!-- 添加关闭按钮 -->
                <button class="close-btn" @click="closeSettings">×</button>
                
                <!-- 静默区设置 -->
                <div class="settings-section">
                    <h3>静默区设置</h3>
                    <div class="settings-group">
                        <label class="checkbox-label">
                            <input type="checkbox" v-model="settings.silentZone.enabled"> 使能
                        </label>
                        <div class="input-group">
                            <label>开始角</label>
                            <div class="number-input">
                                <input type="number" v-model="settings.silentZone.startAngle">
                                <div class="number-controls">
                                    <button class="arrow-btn" @click="incrementStartAngle">▲</button>
                                    <button class="arrow-btn" @click="decrementStartAngle">▼</button>
                                </div>
                            </div>
                        </div>
                        <div class="input-group">
                            <label>结束角</label>
                            <div class="number-input">
                                <input type="number" v-model="settings.silentZone.endAngle">
                                <div class="number-controls">
                                    <button class="arrow-btn" @click="incrementEndAngle">▲</button>
                                    <button class="arrow-btn" @click="decrementEndAngle">▼</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 其他设置保持不变 -->
            </div>
        </div>
    </div>
</template>

<script setup>
    import { computed, onMounted, ref, onUnmounted, nextTick } from 'vue';
    
    const selectedStream = ref('1'); // 默认选择全景视频1
    const isLoading = ref(true);
    let webRtcServer = null;

    // 从环境变量获取视频流 URL
    const RADAR_VIDEO_URL_1 = import.meta.env.VITE_RADAR_VIDEO_URL_1;
    const RADAR_VIDEO_URL_2 = import.meta.env.VITE_RADAR_VIDEO_URL_2;

    const getVideoUrl = () => {
        return selectedStream.value === '1' ? RADAR_VIDEO_URL_1 : RADAR_VIDEO_URL_2;
    };

    const refreshVideo = async () => {
        isLoading.value = true;
        await nextTick();
        const videoElement = document.getElementById('radar-video');
        const videoUrl = getVideoUrl();
        if (webRtcServer) {
            webRtcServer.disconnect();
        }
        webRtcServer = new WebRtcStreamer(videoElement, videoUrl);
        webRtcServer.connect(videoUrl, null, `rtptransport=tcp&timeout=60`);
        webRtcServer.on('connected', () => {
            isLoading.value = false;
        });
    };

    const changeStream = () => {
        refreshVideo();
    };

    onMounted(() => {
        refreshVideo();
    });

    onUnmounted(() => {
        if (webRtcServer) {
            webRtcServer.disconnect();
        }
    });
    
    const loadDeviceData = (deviceId) => {
        console.log('加载设备数据:', deviceId);
    };
    
    const refresh = () => {
        console.log('刷新数据');
    };
    
    const highlightAircraft = (id) => {
        activeTarget.value = illegalAircraft.value.find(aircraft => aircraft.id === id);
    };
    
    const unhighlightAircraft = () => {
        activeTarget.value = null;
    };
    
    const showSettings = ref(false);
    const scanRange = ref(50);
    const scanMode = ref('normal');
    
    const openSettings = () => {
        showSettings.value = true;
    };
    
    const handleStandby = () => {
        console.log('执行待机操作');
    };

    const handleSearch = () => {
        console.log('执行搜索操作');
    };

    const handleTrack = () => {
        console.log('执行跟踪操作');
    };

    const handleTest = () => {
        console.log('执行调试操作');
    };

    const handlePowerAll = () => {
        console.log('执行一体机上电操作');
    };

    const handlePowerFront = () => {
        console.log('执行前端上电操作');
    };

    const handlePowerSystem = () => {
        console.log('执行系统上电操作');
    };

    const settings = ref({
        silentZone: {
            enabled: true,
            startAngle: 270.0,
            endAngle: 90.0
        },
        status: {
            servoAngle: 0.0,
            temperature: 0,
            range: 5
        },
        clutterMap: {
            save: false,
            load: false
        },
        position: {
            latitude: '4.204982',
            longitude: '08.85629',
            altitude: '4.2e+02',
            autoRefresh: false,
            northReturn: false,
            effective: true
        },
        servoMode: {
            mode: 'idle',
            angle: 0
        }
    });

    const incrementStartAngle = () => {
        settings.value.silentZone.startAngle = Math.min(360, settings.value.silentZone.startAngle + 1);
    };

    const decrementStartAngle = () => {
        settings.value.silentZone.startAngle = Math.max(0, settings.value.silentZone.startAngle - 1);
    };

    const incrementEndAngle = () => {
        settings.value.silentZone.endAngle = Math.min(360, settings.value.silentZone.endAngle + 1);
    };

    const decrementEndAngle = () => {
        settings.value.silentZone.endAngle = Math.max(0, settings.value.silentZone.endAngle - 1);
    };

    const closeSettings = () => {
        showSettings.value = false;
    };

    const selectedAircraftId = ref(null);

    const handleButtonClick = () => {
        console.log('选中的飞行物ID:', selectedAircraftId.value);
    };

    const handleRadarGuide = () => {
        console.log('执行雷达引导操作');
    };

    const handleElectronicGuide = () => {
        console.log('执行电侦引导操作');
    };

    const handleFusionGuide = () => {
        console.log('执行融合引导操作');
    };

    const handleInterference = () => {
        console.log('执行干扰操作');
    };

    const handleDeception = () => {
        console.log('执行诱骗操作');
    };
</script>

<style scoped>
    .radar-view {
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    
    .radar-content {
        flex: 2;
        display: flex;
        flex-direction: column;
        padding: 15px;
        background-color: rgba(0, 31, 63, 0.8);
        border-radius: 10px 10px 0 0;
    }
    
    .screen-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #1e3a8a;
    }
    
    .device-selector {
        display: flex;
        gap: 10px;
    }
    
    .device-selector select {
        background-color: #003366;
        color: #00ffff;
        border: 1px solid #00ffff;
        border-radius: 5px;
        padding: 5px 10px;
        cursor: pointer;
        transition: background-color 0.3s;
    }
    
    .device-selector select:hover {
        background-color: #004080;
    }
    
    .screen-controls {
        display: flex;
        gap: 10px;
    }
    
    .screen-controls button,
    .device-controls button {
        background-color: #003366;
        color: #00ffff;
        border: 1px solid #00ffff;
        border-radius: 5px;
        padding: 5px 10px;
        cursor: pointer;
        transition: background-color 0.3s;
    }
    
    .screen-controls button:hover,
    .device-controls button:hover {
        background-color: #004080;
    }
    
    .device-display {
        flex-grow: 1;
        position: relative;
        background-color: #0f172a;
        border-radius: 5px;
        overflow: hidden;
    }
    
    .image-container {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .device-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
    
    .device-label {
        position: absolute;
        top: 10px;
        left: 10px;
        background: rgba(15, 23, 42, 0.8);
        color: #00ffff;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 0.9em;
        z-index: 10;
    }
    
    .device-controls {
        margin-top: 20px;
        padding: 0 15px;
    }
    
    .controls-container {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 20px;
    }
    
    .control-group {
        flex: 1;
        background-color: rgba(15, 23, 42, 0.8);
        padding: 0 10px 10px 5px;
        border-radius: 5px;
        border: 1px solid rgba(0, 255, 255, 0.3);
    }
    
    .control-group h3 {
        color: #00ffff;
        margin: 0;
        padding: 2px 0;
        text-align: center;
        font-size: 1em;
    }
    
    .control-row {
        display: flex;
        gap: 10px;
        justify-content: center;
    }
    
    .control-row button {
        background-color: #003366;
        color: #00ffff;
        border: 1px solid #00ffff;
        border-radius: 5px;
        padding: 8px 15px;
        cursor: pointer;
        transition: background-color 0.3s;
        white-space: nowrap;
    }
    
    .settings-group {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        padding: 10px;
        background: none;
        border: none;
    }
    
    .settings-btn {
        height: 100%;
        background-color: #003366;
        color: #00ffff;
        border: 1px solid #00ffff;
        border-radius: 5px;
        padding: 8px 15px;
        cursor: pointer;
        transition: background-color 0.3s;
    }
    
    .control-row button:hover,
    .settings-btn:hover {
        background-color: #004080;
    }
    
    .illegal-aircraft-list {
        flex: 1;
        padding: 5px 10px;
        background-color: rgba(0, 31, 63, 0.8);
        border-radius: 0 0 10px 10px;
        overflow-y: auto;
    }
    
    .table-container {
        overflow-x: auto;
    }
    
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 0;
        min-width: 1200px;
    }
    
    th, td {
        padding: 4px 8px;
        text-align: center;
        border: 1px solid rgba(0, 255, 255, 0.3);
    }
    
    th {
        background-color: rgba(0, 51, 102, 0.8);
        color: #00ffff;
    }
    
    tr.highlighted {
        background-color: rgba(255, 102, 0, 0.3);
    }
    
    .settings-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .settings-content {
        background-color: rgb(200, 200, 200, 0.1);
        padding: 20px;
        border-radius: 5px;
        border: 1px solid #00ffff;
        width: 600px;
        color: #00ffff;
        position: relative;
    }
    
    .settings-section {
        margin-bottom: 20px;
    }
    
    .settings-section h3 {
        color: #00ffff;
        margin-bottom: 10px;
        font-size: 1em;
        border-bottom: 1px solid rgba(0, 255, 255, 0.3);
        padding-bottom: 5px;
    }
    
    .settings-group {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        padding: 10px;
    }
    
    .input-group {
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .input-group label {
        min-width: 80px;
    }
    
    .input-group input[type="number"] {
        background-color: transparent;
        border: 1px solid #00ffff;
        color: #00ffff;
        padding: 3px 5px;
        width: 100px;
        -moz-appearance: textfield;
    }
    
    .input-group input[type="number"]::-webkit-outer-spin-button,
    .input-group input[type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    
    .number-input {
        display: flex;
        align-items: center;
    }
    
    .number-controls {
        display: flex;
        flex-direction: column;
        margin-left: -1px;
    }
    
    .arrow-btn {
        padding: 0 5px;
        font-size: 8px;
        background: transparent;
        border: 1px solid #00ffff;
        color: #00ffff;
        cursor: pointer;
        height: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .unit {
        color: #00ffff;
        margin-left: 5px;
    }
    
    .button-group {
        display: flex;
        justify-content: space-around;
        margin-top: 20px;
    }

    .button-group button {
        background-color: #003366;
        color: #00ffff;
        border: 1px solid #00ffff;
        border-radius: 5px;
        padding: 8px 15px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .button-group button:hover {
        background-color: #004080;
    }

    .close-btn {
        position: absolute;
        right: 10px;
        top: 10px;
        background: transparent;
        border: none;
        color: #00ffff;
        font-size: 24px;
        cursor: pointer;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
    }

    .close-btn:hover {
        background-color: rgba(0, 255, 255, 0.1);
    }

    .video-container {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        position: relative;
    }

    .loading-spinner {
        display: flex;
        justify-content: center;
        align-items: center;
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

    video {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    h2 {
        color: #00ffff;
        margin: 0;
        padding: 0 10px;
        flex-grow: 1;
        text-align: center;
    }
</style>
