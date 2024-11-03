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
                    <video id="radar-video" autoplay width="100%" height="100%"></video>
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
                    <tr v-for="aircraft in aircraftData" :key="aircraft.id">
                        <td>
                            <input
                                type="radio"
                                :value="aircraft.id"
                                v-model="selectedAircraftId"
                                name="aircraft-selection"
                            >
                            {{ aircraft.id }}
                        </td>
                        <!-- 雷达数据 -->
                        <td>{{ aircraft.radarData.distance }}</td>
                        <td>{{ aircraft.radarData.azimuth }}</td>
                        <td>{{ aircraft.radarData.pitch }}</td>
                        <td>{{ aircraft.radarData.speed }}</td>
                        <td>{{ aircraft.radarData.longitude }}</td>
                        <td>{{ aircraft.radarData.latitude }}</td>
                        
                        <!-- 电侦数据 (只显示部分关键信息) -->
                        <td>{{ aircraft.electronicData.type }}</td>
                        <td>{{ aircraft.electronicData.name }}</td>
                        <td>{{ aircraft.electronicData.threadLevel }}</td>
                        <td>{{ aircraft.electronicData.distance }}</td>
                        <td>{{ aircraft.electronicData.longitude }}</td>
                        <td>{{ aircraft.electronicData.latitude }}</td>
                        
                        <!-- 融合数据 (只显示关键位置信息) -->
                        <td>{{ aircraft.fusionData.longitude }}</td>
                        <td>{{ aircraft.fusionData.latitude }}</td>
                        <td>{{ aircraft.fusionData.azimuth }}</td>
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
            <button @click="handleInterference"
            :class="{active: deceptionOperateType == 'interference', not_active: deceptionOperateType != 'interference'}"
            >干扰</button>
            <button @click="handlePointCapture"
            :class="{active: deceptionOperateType == 'capture', not_active: deceptionOperateType != 'capture'}"
            >定点捕获</button>
            <button @click="handleDriveAway"
            :class="{active: deceptionOperateType == 'driveAway', not_active: deceptionOperateType != 'driveAway'}"
            >驱离</button>
            <button @click="handleNoFly"
            :class="{active: deceptionOperateType == 'noFly', not_active: deceptionOperateType != 'noFly'}"
            >禁飞</button>
            <button @click="handleDefense"
            :class="{active: deceptionOperateType == 'defense', not_active: deceptionOperateType != 'defense'}"
            >防御</button>
            <button @click="stopLaunch" class="active">取消发射</button>
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
    import { nextTick, onMounted, onUnmounted, ref } from 'vue';
    import { useRGuide } from "@/api/radar.js";
    import { sendCommand, stopLaunch_1 } from '@/components/ControlPanel.vue'
    import axios from '@/api/index.js';
    
    const selectedStream = ref('1'); // 默认选择全景视频1
    const deceptionOperateType = ref('')

    let webRtcServer = null;
    // 从环境变量获取视频流 URL
    const PANORAMIC_VIDEO_URL_1 = import.meta.env.VITE_PANORAMIC_WEBRTC_URL
    const PANORAMIC_VIDEO_URL_2 = import.meta.env.VITE_PANORAMIC_WEBRTC_URL
    
    const getVideoUrl = () => {
        return selectedStream.value === '1' ? PANORAMIC_VIDEO_URL_1 : PANORAMIC_VIDEO_URL_2;
    };
    
    const refreshVideo = async () => {
        await nextTick();
        const videoElement = document.getElementById('radar-video');
        const videoUrl = getVideoUrl();
        if (webRtcServer) {
            webRtcServer.disconnect();
        }
        const panoramicRtcBackendUrl = import.meta.env.VITE_PANORAMIC_WEBRTC_URL
        // eslint-disable-next-line no-undef
        webRtcServer = new WebRtcStreamer(videoElement, panoramicRtcBackendUrl);
        webRtcServer.connect(videoUrl, null, `rtptransport=tcp&timeout=60`);
    };
    
    const changeStream = () => {
        refreshVideo();
    };
    
    onMounted(() => {
        refreshVideo();
        updateElectronicData();
        dataUpdateTimer = setInterval(updateElectronicData, 5000);
    });
    
    onUnmounted(() => {
        if (webRtcServer) {
            webRtcServer.disconnect();
        }
        if (dataUpdateTimer) {
            clearInterval(dataUpdateTimer);
        }
    });
    
    const refresh = () => {
        console.log('刷新数据');
    };
    
    const showSettings = ref(false);
    
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
    
    const selectedAircraftId = ref();
    
    const handleRadarGuide = async () => {
        if (!selectedAircraftId.value) {
            alert('请先选择一个目标');
            return;
        }
        const aircraft = aircraftData.value.find(item => item.id === selectedAircraftId.value);
        const data = await useRGuide(
            aircraft.radarData.distance,
            parseFloat(aircraft.radarData.azimuth.slice(0, -1)),
            parseFloat(aircraft.radarData.pitch.slice(0, -1))
        );
        console.log(data);
    };
    
    const handleElectronicGuide = async () => {
        if (!selectedAircraftId.value) {
            alert('请先选择一个目标');
            return;
        }
        const aircraft = aircraftData.value.find(item => item.id === selectedAircraftId.value);
        const data = await useRGuide(
            aircraft.electronicData.distance,
            parseFloat(aircraft.electronicData.azimuth.slice(0, -1)),
            parseFloat(aircraft.electronicData.pitch.slice(0, -1))
        );
        console.log(data);
        console.log('执行电侦引导操作，目标ID:', selectedAircraftId.value);
    };
    
    const handleFusionGuide = async() => {
        if (!selectedAircraftId.value) {
            alert('请先选择一个目标');
            return;
        }
        const aircraft = aircraftData.value.find(item => item.id === selectedAircraftId.value);
        const data = await useRGuide(
            aircraft.electronicData.distance,
            parseFloat(aircraft.fusionData.azimuth.slice(0, -1)),
            parseFloat(aircraft.fusionData.pitch.slice(0, -1))
        );
        console.log(data);
        console.log('执行融合引导操作，目标ID:', selectedAircraftId.value);
    };
    
    const handleInterference = async () => {
        if(deceptionOperateType.value !== 'stopLaunch') {
            alert('请先取消发射');
            return;
        }
        if (!selectedAircraftId.value) {
            alert('请先选择一个目标');
            return;
        }
        if(await sendCommand(4098))deceptionOperateType.value = 'interference'
        console.log('执行干扰操作，目标ID:', selectedAircraftId.value);
        
    };
    
    const handlePointCapture = async () => {
        if(deceptionOperateType.value !== 'stopLaunch') {
            alert('请先取消发射');
            return;
        }
        if (!selectedAircraftId.value) {
            alert('请先选择一个目标');
            return;
        }
        if(await sendCommand(4352))deceptionOperateType.value = 'capture'
        console.log('执行定点捕获操作，目标ID:', selectedAircraftId.value);
    };
    
    const handleDriveAway = async () => {
        if(deceptionOperateType.value !== 'stopLaunch') {
            alert('请先取消发射');
            return;
        }
        if (!selectedAircraftId.value) {
            alert('请先选择一个目标');
            return;
        }
        if(await sendCommand(4097))deceptionOperateType.value = 'driveAway'
        console.log('执行驱离操作，目标ID:', selectedAircraftId.value);
    };
    
    const handleNoFly = async () => {
        if(deceptionOperateType.value !== 'stopLaunch') {
            alert('请先取消发射');
            return;
        }
        if (!selectedAircraftId.value) {
            alert('请先选择一个目标');
            return;
        }
        if(await sendCommand(4099))deceptionOperateType.value = 'noFly'
        console.log('执行禁飞操作，目标ID:', selectedAircraftId.value);
    };
    
    const handleDefense = async () => {
        if(deceptionOperateType.value !== 'stopLaunch') {
            alert('请先取消发射');
            return;
        }
        if (!selectedAircraftId.value) {
            alert('请先选择一个目标');
            return;
        }
        if(await sendCommand(4100))deceptionOperateType.value = 'defense'
        console.log('执行防御操作，目标ID:', selectedAircraftId.value);
    };

    const stopLaunch = async () => {
        await stopLaunch_1()
        deceptionOperateType.value = 'stopLaunch'
        alert('取消发射成功')
    }
    
    // 添加模拟数据
    const aircraftData = ref([
        {
            id: 1,
            radarData: {
                distance: 1000,
                azimuth: '50°',
                pitch: '30°',
                speed: '300',
                longitude: '113.2456',
                latitude: '25.4562'
            },
            electronicData: {
                type: 'UAV',
                name: 'Mavic3',
                speed: '280',
                altitude: '1200',
                distance: '1100',
                updateTime: '2024-03-21 14:30:00',
                threadLevel: 'high',
                latitude: '25.4564',
                longitude: '113.2458',
                pitch: '32°',
                azimuth: '52°'
            },
            fusionData: {
                longitude: '113.2457', // (113.2456 + 113.2458) / 2
                latitude: '25.4563',   // (25.4562 + 25.4564) / 2
                pitch: '31°',          // (30° + 32°) / 2
                azimuth: '51°',        // (50° + 52°) / 2
                distance: 1050,        // (1000 + 1100) / 2
                speed: 290            // (300 + 280) / 2
            }
        },
        {
            id: 2,
            radarData: {
                distance: 2000,
                azimuth: '60°',
                pitch: '25°',
                speed: '250',
                longitude: '113.3456',
                latitude: '25.5562'
            },
            electronicData: {
                type: 'UAV',
                name: 'Phantom4',
                speed: '240',
                altitude: '800',
                distance: '2100',
                updateTime: '2024-03-21 14:30:00',
                threadLevel: 'medium',
                latitude: '25.5564',
                longitude: '113.3458',
                pitch: '27°',
                azimuth: '62°'
            },
            fusionData: {
                longitude: '113.3457',
                latitude: '25.5563',
                pitch: '26°',
                azimuth: '61°',
                distance: 2050,
                speed: 245
            }
        }
    ]);

    const updateElectronicData = async () => {
        try {
            const response = await axios.get('/api/v0/uavs');
            // 遍历现有的 aircraftData，更新电侦数据
            aircraftData.value = aircraftData.value.map(aircraft => {
                // 在 response.data 中查找匹配的 UAV 数据
                const uavData = response.data.find(uav => uav.id === aircraft.id);
                if (uavData) {
                    return {
                        ...aircraft,
                        electronicData: {
                            type: uavData.type || 'UAV',
                            name: uavData.name || 'Unknown',
                            speed: uavData.speed?.toString() || '0',
                            altitude: uavData.altitude?.toString() || '0',
                            distance: uavData.distance?.toString() || '0',
                            updateTime: new Date().toLocaleString(),
                            threadLevel: uavData.threadLevel || 'low',
                            latitude: uavData.latitude?.toString() || '0',
                            longitude: uavData.longitude?.toString() || '0',
                            pitch: `${uavData.pitch || 0}°`,
                            azimuth: `${uavData.azimuth || 0}°`
                        }
                    };
                }
                return aircraft;
            });
        } catch (error) {
            console.error('获取UAV数据失败:', error);
        }
    };

    let dataUpdateTimer;
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
        gap: 15px;
        margin-top: 15px;
        padding: 10px;
    }
    
    .button-group button {
        flex: 1;
        padding: 12px 20px;
        background-color: rgba(0, 122, 204, 0.8);
        color: white;
        border: 2px solid #00ffff;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.3s;
        white-space: nowrap;
        font-size: 16px;
        font-weight: 500;
    }
    
    .button-group button:hover {
        background-color: rgba(0, 144, 234, 0.8);
        transform: translateY(-2px);
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
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
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
    
    .control-buttons {
        display: flex;
        gap: 10px;
        margin-top: 10px;
    }
    
    .control-buttons button {
        flex: 1;
        padding: 8px 15px;
        background-color: rgba(0, 122, 204, 0.8);
        color: white;
        border: 1px solid #00ffff;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
        white-space: nowrap;
        font-size: 14px;
    }
    
    .control-buttons button:hover {
        background-color: rgba(0, 144, 234, 0.8);
    }
    
    tbody tr:hover {
        background-color: rgba(0, 255, 255, 0.1);
    }
    
    input[type="radio"] {
        cursor: pointer;
        margin-right: 5px;
    }
    
    /* 让第一列稍微宽一点，以适应单选框 */
    td:first-child {
        min-width: 60px;
    }
    .active {
    background-color: #00a8ff !important;
    color: #ffffff !important;
    border: 2px solid #00ffff !important;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
    transform: scale(1.05);
    transition: all 0.3s ease;
}

.not_active {
    background-color: rgba(0, 31, 63, 0.8) !important;
    color: #00ffff !important;
    border: 1px solid #00ffff !important;
    transition: all 0.3s ease;
}

.active:hover {
    background-color: #0097e6 !important;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.7) !important;
}

.not_active:hover {
    background-color: rgba(0, 41, 83, 0.9) !important;
    border-color: #00ffff !important;
}
</style>
