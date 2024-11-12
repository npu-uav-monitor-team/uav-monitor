<template>
    <div class="radar-view">
        <div class="radar-content">
            <div class="screen-header">
                <h3>全景视频</h3>
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
        </div>
        <div class="illegal-aircraft-list">
            <h3>非法飞行物列表</h3>
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
                    <tr v-for="aircraft in threatAirCraftList" :key="aircraft.id">
                        <td>
                            <input
                                type="radio"
                                :value="aircraft.id"
                                @change="changeSelectedAircraft(aircraft)"
                                name="aircraft-selection"
                            >
                            {{ aircraft.id }}
                        </td>
                        <!-- 雷达数据 -->
                        <td>{{ parseFloat(aircraft.radarData.distance).toFixed(1) }}</td>
                        <td>{{ parseFloat(aircraft.radarData.azimuth2).toFixed(1) }}</td>
                        <td>{{ parseFloat(aircraft.radarData.pitch).toFixed(1) }}</td>
                        <td>{{ parseFloat(aircraft.radarData.speed).toFixed(1) }}</td>
                        <td>{{ parseFloat(aircraft.radarData.longitude).toFixed(6) }}</td>
                        <td>{{ parseFloat(aircraft.radarData.latitude).toFixed(6) }}</td>
                        
                        <!-- 电侦数据 (只显示部分关键信息) -->
                        <td>{{ aircraft.electronicData.type }}</td>
                        <td>{{ aircraft.electronicData.name }}</td>
                        <td>{{ aircraft.electronicData.threatLevel }}</td>
                        <td>{{ parseFloat(aircraft.electronicData.distance).toFixed(1) }}</td>
                        <td>{{ parseFloat(aircraft.electronicData.longitude).toFixed(4) }}</td>
                        <td>{{ parseFloat(aircraft.electronicData.latitude).toFixed(4) }}</td>
                        
                        <!-- 融合数据 (只显示关键位置信息) -->
                        <td>{{ parseFloat(aircraft.fusionData.longitude).toFixed(4) }}</td>
                        <td>{{ parseFloat(aircraft.fusionData.latitude).toFixed(4) }}</td>
                        <td>{{ parseFloat(aircraft.fusionData.azimuth).toFixed(1) }}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <!-- 添加按钮 -->
        <div class="button-group">
            <button @click="router.go(0)">刷新数据</button>
            <button @click="handleRadarGuide">雷达引导</button>
            <button @click="handleElectronicGuide">电侦引导</button>
            <button @click="handleFusionGuide">融合引导</button>
            <button @click="cancelGuide">取消引导</button>
            <button @click="communicationInterference">
                {{ isInterferenceEnabled ? '取消通信干扰' : '通信干扰' }}
            </button>
            <button @click="handlePointCapture"
                    :class="{active: deceptionOperateType === 'capture',
                     not_active: deceptionOperateType !== 'capture'}"
            >定点诱降
            </button>
            <button @click="handleDriveAway"
                    :class="{active: deceptionOperateType === 'driveAway',
                    not_active: deceptionOperateType !== 'driveAway'}"
            >指引驱离
            </button>
            <button @click="handleDefense"
                    :class="{active: deceptionOperateType === 'defense',
                    not_active: deceptionOperateType !== 'defense'}"
            >金钟罩防御
            </button>
            <!-- handleNoFly -->
            <button @click="handleNoFly"
                    :class="{active: deceptionOperateType === 'noFly',
                    not_active: deceptionOperateType !== 'noFly'}"
            >禁飞迫降
            </button>
            <button @click="handleInterference"
                    :class="{active: deceptionOperateType === 'interference',
            not_active: deceptionOperateType !== 'interference'}"
            >导航干扰
            </button>
            <button @click="stopLaunch">取消发射</button>
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
    // 对aircraftData[index].electronicData.threatLevel做判断 目前是所有的都要
    import { computed, isRef, nextTick, onMounted, onUnmounted, ref } from 'vue';
    import axios from "@/api/index.js"
    import { useRGuide } from "@/api/radar.js";
    import { useAircraftData } from '@/composables/useAircraftData'
    import { deceptionService } from "../service/deceptionService";
    import { getDriveAngle, getCapture, actions } from "../composables/deceptionDataStore"
    import { useDeviceControl } from '../composables/useDeviceControl'
    import router from "@/router/index.js";
    
    const selectedStream = ref('1'); // 默认选择全景视频1
    const deceptionOperateType = ref('')
    
    let webRtcServer = null;
    // 从环境变量获取视频流 URL
    const PANORAMIC_VIDEO_URL_1 = import.meta.env.VITE_PANORAMIC_VIDEO_URL
    const PANORAMIC_VIDEO_URL_2 = import.meta.env.VITE_PANORAMIC_VIDEO_URL
    
    const getVideoUrl = () => {
        return selectedStream.value === '1' ? PANORAMIC_VIDEO_URL_1 : PANORAMIC_VIDEO_URL_2;
    };
    
    const refreshVideo = async () => {
        const videoUrl = getVideoUrl();
        const panoramicRtcBackendUrl = import.meta.env.VITE_PANORAMIC_WEBRTC_URL
        
        await nextTick() // 待dom加载完毕
        let videoDocument = document.getElementById('radar-video')
        // eslint-disable-next-line no-undef
        webRtcServer = new WebRtcStreamer(videoDocument, panoramicRtcBackendUrl)
        webRtcServer.connect(videoUrl, null, `rtptransport=tcp&timeout=60`)
    };
    
    const changeStream = () => {
        refreshVideo();
    };
    
    const {aircraftData} = useAircraftData()
    const {cachedSelectedAircraft, selectedAircraftId_repeat} = useAircraftData()
    
    const changeSelectedAircraft = (aircraft) => {
        selectedAircraftId.value = aircraft.id
        cachedSelectedAircraft.value = aircraft.radarData
        selectedAircraftId_repeat.value = aircraft.id
    }
    
    const threatAirCraftList = computed(() => {
        if (!isRef(aircraftData)) {
            console.log('[warning] aircraftData is not a ref')
        }
        // 因为后端是写死了所以这里我们暂时不过筛 默认所有的都是威胁
        // 保留 radarData.updateTime 字段在4秒内的或 radarData.longitude === 0 且 radarData.latitude === 0 数据
        return aircraftData.value
    });
    
    onMounted(() => {
        refreshVideo();
    });
    
    onUnmounted(() => {
        if (webRtcServer) {
            webRtcServer.disconnect();
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
    
    const selectedAircraftId = ref(null);
    
    let radarGuideTimer = null;
    
    const handleRadarGuide = async () => {
        if (!selectedAircraftId.value) {
            alert('请先选择一个目标');
            return;
        }
        radarGuideTimer = setInterval(async () => {
            const aircraft = aircraftData.value.find(item => item.id === selectedAircraftId.value);
            await useRGuide(
                1,
                parseInt(aircraft.radarData.distance) || 0,
                parseFloat(aircraft.radarData.azimuth2) || 0,
                parseFloat(aircraft.radarData.pitch) || 0
            );
            console.log('执行雷达引导操作,目标ID:', selectedAircraftId.value);
        }, import.meta.env.VITE_REQUEST_REFRESH_DURATION);
    };
    
    
    let electronicGuideTimer = null;
    
    const handleElectronicGuide = async () => {
        if (!selectedAircraftId.value) {
            alert('请先选择一个目标');
            return;
        }
        electronicGuideTimer = setInterval(async () => {
            const aircraft = aircraftData.value.find(item => item.id === selectedAircraftId.value);
            await useRGuide(
                2,
                parseInt(aircraft.electronicData.distance) || 0,
                parseFloat(aircraft.electronicData.azimuth) || 0,
                parseFloat(aircraft.electronicData.pitch) || 0
            );
            console.log('执行电侦引导操作,目标ID:', selectedAircraftId.value);
        }, import.meta.env.VITE_REQUEST_REFRESH_DURATION)
    };
    
    let fusionGuideTimer = null;
    
    const handleFusionGuide = async () => {
        if (!selectedAircraftId.value) {
            alert('请先选择一个目标');
            return;
        }
        fusionGuideTimer = setInterval(async () => {
            const aircraft = aircraftData.value.find(item => item.id === selectedAircraftId.value);
            await useRGuide(
                1,
                parseInt(aircraft.fusionData.distance) || 0,
                parseFloat(aircraft.fusionData.azimuth) || 0,
                parseFloat(aircraft.fusionData.pitch) || 0
            );
            console.log('执行融合引导操作,目标ID:', selectedAircraftId.value);
        }, import.meta.env.VITE_REQUEST_REFRESH_DURATION);
    };
    
    const cancelGuide = async () => {
        if (radarGuideTimer) {
            clearInterval(radarGuideTimer);
        }
        if (electronicGuideTimer) {
            clearInterval(electronicGuideTimer);
        }
        if (fusionGuideTimer) {
            clearInterval(fusionGuideTimer);
        }
        await axios.post('/api/v0/photoelectrics/radarAndElectricCancel')
    }
    
    const handleInterference = async () => {
        if (deceptionOperateType.value !== 'stopLaunch') {
            alert('请先取消发射');
            return;
        }
        if (!selectedAircraftId.value) {
            alert('请先选择一个目标');
            return;
        }
        if (await deceptionService.sendCommand(4098)) {
            deceptionOperateType.value = 'interference'
            console.log('执行干扰操作,目标ID:', selectedAircraftId.value);
        }
        
    };
    
    const handlePointCapture = async () => {
        // if (deceptionOperateType.value !== 'stopLaunch') {
        //     alert('请先取消发射');
        //     return;
        // }
        if (!selectedAircraftId.value) {
            alert('请先选择一个目标');
            return;
        }
        let bootstrapData;
        
        
        try {
            let useData = aircraftData.value.find(item => item.id === selectedAircraftId_repeat.value)?.radarData
            bootstrapData = {
                longitude: useData?.longitude ?? 0,
                latitude: useData?.latitude ?? 0,
                altitude: useData?.altitude ?? 0
            }
        } catch (error) {
            alert('未获取到正确的飞行目标');
            return;
        }
        if(await deceptionService.sendCommand(8192, bootstrapData)){
            if(await deceptionService.sendCommand(4352, getCapture())){
                deceptionOperateType.value = 'capture'
                console.log('执行定点捕获操作,目标ID:', selectedAircraftId.value);
            }
        }else{
            alert(`引导命令失败，检查参数:${bootstrapData.latitude}/${bootstrapData.longitude}/${bootstrapData.altitude}`);
            return;
        }
    };
    
    const handleDriveAway = async () => {
        if (deceptionOperateType.value !== 'stopLaunch') {
            alert('请先取消发射');
            return;
        }
        if (!selectedAircraftId.value) {
            alert('请先选择一个目标');
            return;
        }
        if (await deceptionService.sendCommand(4097, getDriveAngle())) {
            deceptionOperateType.value = 'driveAway'
            console.log('执行驱离操作,目标ID:', selectedAircraftId.value);
        }
    };
    
    const handleNoFly = async () => {
        if (deceptionOperateType.value !== 'stopLaunch') {
            alert('请先取消发射');
            return;
        }
        if (!selectedAircraftId.value) {
            alert('请先选择一个目标');
            return;
        }
        if (await deceptionService.sendCommand(4099)) {
            deceptionOperateType.value = 'noFly'
            console.log('执行禁飞操作,目标ID:', selectedAircraftId.value);
        }


    };
    
    const handleDefense = async () => {
        if (deceptionOperateType.value !== 'stopLaunch') {
            alert('请先取消发射');
            return;
        }
        if (!selectedAircraftId.value) {
            alert('请先选择一个目标');
            return;
        }
        if (await deceptionService.sendCommand(4100)) {
            deceptionOperateType.value = 'defense'
            console.log('执行防御操作,目标ID:', selectedAircraftId.value);
        }
    };
    
    const stopLaunch = async () => {
        if (await deceptionService.stopLaunch_1()) {
            deceptionOperateType.value = 'stopLaunch'
            alert('取消发射成功')
        }
    }
    
    const {toggleAutoDefense, isInterferenceEnabled} = useDeviceControl()
    
    const communicationInterference = () => {
        toggleAutoDefense()
    }
</script>

<style scoped>
    .radar-view {
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    
    .radar-content {
        display: flex;
        height: 55%;
        flex-direction: column;
        padding: 15px;
        background-color: rgba(0, 31, 63, 0.8);
        border-radius: 10px 10px 0 0;
    }
    
    .screen-header {
        display: flex;
        height: 3%;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;
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
        display: flex;
        height: 100%;
        position: relative;
        background-color: #0f172a;
        border-radius: 5px;
        overflow: hidden;
    }
    
    .control-group h3 {
        color: #00ffff;
        margin: 0;
        padding: 2px 0;
        text-align: center;
        font-size: 1em;
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
    
    .control-row button:hover,
    .settings-btn:hover {
        background-color: #004080;
    }
    
    .illegal-aircraft-list {
        height: 70%;
        padding: 5px 10px;
        background-color: rgba(0, 31, 63, 0.8);
        border-radius: 0 0 10px 10px;
    }
    
    .table-container {
        margin-top: 20px;
        overflow-x: auto;
        overflow-y: auto;
        font-size: 12px;
        max-height: 350px;
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
        line-height: 24px;
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
    
    .button-group {
        display: grid;
        grid-template-columns: repeat(6, 1fr); /* 第一行 6 列 */
        gap: 8px 12px; /* 设置上下和左右间距 */
        margin: 3px 3px 1% 3px;
    }
    
    .button-group button {
        padding: 5px 8px;
        background-color: rgba(0, 122, 204, 0.8);
        color: white;
        border: 2px solid #00ffff;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.3s;
        white-space: nowrap;
        font-size: 10px; /* 增加字体大小 */
        font-weight: bold;
    }
    
    .button-group button:nth-child(n+7) {
        grid-column: span 1; /* 第二行按钮 */
    }
    
    .button-group button:nth-child(7) {
        grid-column-start: 1; /* 第二行从第一列开始 */
    }
    
    .button-group button:nth-child(7) ~ button {
        grid-template-columns: repeat(6, 1fr); /* 第一行 6 列 */
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
    
    h3 {
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
    
    /* 让第一列稍微宽一点,以适应单选框 */
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
