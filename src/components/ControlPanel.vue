<template>
    <div class="control-panel">
        <div class="tabs">
            <button
                @click="activeTab = 'control'"
                :class="{ active: activeTab === 'control' }"
            >
                无线设备控制
            </button>
            <button
                @click="activeTab = 'optoelectronic'"
                :class="{ active: activeTab === 'optoelectronic' }"
            >
                光电设备控制
            </button>
            <button
                @click="activeTab = 'deception'"
                :class="{ active: activeTab === 'deception' }"
            >
                诱骗和干扰
            </button>
        </div>
        
        <div class="tab-content">
            <div v-if="activeTab === 'control'" class="control-content">
                <div class="status-section">
                    <div class="status-row">
                        <div class="status-item">
                            <span>设备状态：</span>
                            <span :class="['status-indicator', wirelessDeviceOnline ? 'online' : 'offline']">
                                {{ wirelessDeviceOnline ? '在线' : '离线' }}
                            </span>
                        </div>
                        <div class="status-item">
                            <span>设备状态：</span>
                            <span :class="['status-badge', wirelessDeviceNormal ? 'normal' : 'abnormal']">
                                {{ wirelessDeviceNormal ? '正常' : '异常' }}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="control-section defense-settings">
                    <h4>Defense Settings</h4>
                    <div class="input-group-container">
                        <div class="input-group">
                            <label>Defense delay (sec)</label>
                            <input type="number" v-model="defenseDelay">
                            <button @click="confirmDefenseDelay">确认</button>
                        </div>
                        <div class="input-group">
                            <label>Defense duration (min)</label>
                            <input type="number" v-model="defenseDuration">
                            <button @click="confirmDefenseDuration">确认</button>
                        </div>
                    </div>
                </div>
                <div class="control-section">
                    <h4>Sensors</h4>
                    <table class="sensor-info-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>详细信息</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="sensor in sensors" :key="sensor.id">
                                <td>{{ sensor.id }}</td>
                                <td><button @click="showSensorDetails(sensor.id)">详细信息</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="auto-defense">
                    <span>Auto Defense</span>
                    <label class="switch">
                        <input type="checkbox" v-model="autoDefense" @change="toggleAutoDefense">
                        <span class="slider round"></span>
                    </label>
                </div>
            </div>
            
            <div v-else-if="activeTab === 'optoelectronic'" class="control-content">
                <div class="status-section">
                    <div class="status-row">
                        <div class="status-item">
                            <span>设备状态：</span>
                            <span :class="['status-indicator', optoelectronicDeviceOnline ? 'online' : 'offline']">
                                {{ optoelectronicDeviceOnline ? '在线' : '离线' }}
                            </span>
                        </div>
                        <div class="status-item">
                            <span>设备状态：</span>
                            <span :class="['status-badge', optoelectronicDeviceNormal ? 'normal' : 'abnormal']">
                                {{ optoelectronicDeviceNormal ? '正常' : '异常' }}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="control-section">
                    <h4>目标信息</h4>
                    <table class="target-info-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>类型</th>
                            <th>距离 (KM)</th>
                            <th>方位角 (°)</th>
                            <th>俯仰角 (°)</th>
                            <th>速度 (km/h)</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>{{ currentTarget.id || 'N/A' }}</td>
                            <td>{{ currentTarget.type || 'N/A' }}</td>
                            <td>{{ currentTarget.distance || 'N/A' }}</td>
                            <td>{{ currentTarget.azimuth || 'N/A' }}</td>
                            <td>{{ currentTarget.elevation || 'N/A' }}</td>
                            <td>{{ currentTarget.speed || 'N/A' }}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <div class="control-section">
                    <div class="button-grid">
                        <button @click="toggleServo">{{ servoStatus ? '伺服关机' : '伺服开机' }}</button>
                        <button @click="toggleChannel">{{ channelType ? '红外通道' : '电视通道' }}</button>
                        <button @click="resetOptoelectronic">电归零</button>
                        <button @click="toggleTargetColor">{{ targetColor ? '目标白' : '目标黑' }}</button>
                        <button @click="toggleTrackingMode">{{ trackingMode ? '质心' : '相关' }}</button>
                        <button @click="toggleInfrared">{{ infraredStatus ? '红外关机' : '红外开机' }}</button>
                        <button @click="toggleInfraredColor">{{ infraredColor ? '红外热黑' : '红外热白' }}</button>
                        <button @click="toggleLaser">{{ laserStatus ? '激光关' : '激光开' }}</button>
                        <button @click="toggleFrequency">{{ frequency ? '5Hz' : '12.5Hz' }}</button>
                        <button @click="showSettingsDialog = true">详细设置</button>
                        <div class="focus-wheel">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <g>
                                    <circle cx="50" cy="50" r="45" fill="#005a8c"/>
                                    <polygon points="50,15 42,30 58,30" fill="#00ffff" @click="adjustFocus('up')"/>
                                    <polygon points="85,50 70,42 70,58" fill="#00ffff" @click="adjustFocus('right')"/>
                                    <polygon points="50,85 58,70 42,70" fill="#00ffff" @click="adjustFocus('down')"/>
                                    <polygon points="15,50 30,58 30,42" fill="#00ffff" @click="adjustFocus('left')"/>
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="control-content">
                <div class="status-section">
                    <div class="status-row">
                        <div class="status-item">
                            <span>设备状态：</span>
                            <span :class="['status-indicator', deviceOnline ? 'online' : 'offline']">
                                {{ deviceOnline ? '在线' : '离线' }}
                            </span>
                        </div>
                        <div class="status-item">
                            <span>设备状态：</span>
                            <span :class="['status-badge', deviceNormal ? 'normal' : 'abnormal']">
                                {{ deviceNormal ? '正常' : '异常' }}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="control-section">
                    <h4>经纬度（雷达数据）</h4>
                    <div class="coordinates-display">
                        <div class="coordinate">{{ radarData.longitude }}°</div>
                        <div class="coordinate">{{ radarData.latitude }}°</div>
                    </div>
                </div>

                <div class="control-section">
                    <h4>模糊度</h4>
                    <input 
                        type="range" 
                        v-model="simulationLevel" 
                        min="0" 
                        max="100" 
                        class="simulation-slider"
                    >
                    <div class="slider-value">{{ simulationLevel }}</div>
                </div>

                <div class="control-section">
                    <div class="action-buttons">
                        <button @click="stopEmission" class="action-btn">停止发射</button>
                        <button @click="approachEmission" class="action-btn">就近发射</button>
                        <button @click="sendCommand" class="action-btn">发送</button>
                    </div>
                </div>

                <div class="control-section drive-away-section">
                    <h4>驱离角度 (°)</h4>
                    <div class="angle-input-container">
                        <input 
                            type="number" 
                            v-model="driveAwayAngle" 
                            min="0" 
                            max="360"
                            class="angle-input"
                        >
                        <button @click="driveAway" class="drive-away-btn">驱离</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 弹窗 -->
        <div v-if="showSettingsDialog" class="modal-overlay">
            <div class="modal-content">
                <h2>详细设置</h2>
                <div class="settings-grid">
                    <div class="setting-item">
                        <label>跟踪灵敏度</label>
                        <input type="range" v-model="settings.sensitivity" min="1" max="10" step="1">
                        <span>{{ settings.sensitivity }}</span>
                    </div>
                    <div class="setting-item">
                        <label>目标尺寸</label>
                        <input type="range" v-model="settings.targetSize" min="1" max="100" step="1">
                        <span>{{ settings.targetSize }}</span>
                    </div>
                    <div class="setting-item">
                        <label>对比度</label>
                        <input type="range" v-model="settings.contrast" min="0" max="100" step="1">
                        <span>{{ settings.contrast }}</span>
                    </div>
                    <div class="setting-item">
                        <label>亮度</label>
                        <input type="range" v-model="settings.brightness" min="0" max="100" step="1">
                        <span>{{ settings.brightness }}</span>
                    </div>
                    <div class="setting-item">
                        <label>图像增强</label>
                        <select v-model="settings.enhancement">
                            <option value="none">关闭</option>
                            <option value="low">低</option>
                            <option value="medium">中</option>
                            <option value="high">高</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>噪声抑制</label>
                        <select v-model="settings.noiseReduction">
                            <option value="none">关闭</option>
                            <option value="low">低</option>
                            <option value="medium">中</option>
                            <option value="high">高</option>
                        </select>
                    </div>
                </div>
                <div class="settings-footer">
                    <button @click="saveSettings">保存</button>
                    <button @click="closeSettings">取消</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { onMounted, ref, onUnmounted } from "vue";
    
    const activeTab = ref('control');
    const activeBands = ref([]);
    const defenseDelay = ref(60);
    const defenseDuration = ref(1);
    const autoDefense = ref(false);
    
    // 新增的状态变量
    const wirelessDeviceOnline = ref(true);
    const wirelessDeviceNormal = ref(true);
    const optoelectronicDeviceOnline = ref(true);
    const optoelectronicDeviceNormal = ref(true);
    
    const currentTarget = ref({
        id: '',
        type: '',
        distance: '',
        azimuth: '',
        elevation: '',
        speed: ''
    });
    const currentMode = ref('visible');
    const currentPanoramaMode = ref('visible');
    
    // 添加新的状态变量
    const servoStatus = ref(false);
    const channelType = ref(false);
    const targetColor = ref(false);
    const trackingMode = ref(false);
    const infraredStatus = ref(false);
    const infraredColor = ref(false);
    const laserStatus = ref(false);
    const frequency = ref(false);
    const showSettingsDialog = ref(false);
    
    // 添加设置相关的状态变量
    const settings = ref({
        sensitivity: 5,
        targetSize: 50,
        contrast: 50,
        brightness: 50,
        enhancement: 'none',
        noiseReduction: 'none'
    });
    
    const deviceOnline = ref(true);
    const deviceNormal = ref(true);
    const radarData = ref({
        longitude: 0.0000,
        latitude: 0.0000
    });
    const simulationLevel = ref(100);
    const driveAwayAngle = ref(10);
    
    const sensors = ref([
        { id: 'SF7000012719' },
        { id: 'SF7000012720' },
        // 添加更多传感器数据
    ]);
    
    // 预留的控制接口
    function updateWirelessDeviceStatus() {
        // TODO: 调用后端 API 获取无线设备状态
        // 示例：
        // const response = await api.getWirelessDeviceStatus();
        // wirelessDeviceOnline.value = response.online;
        // wirelessDeviceNormal.value = response.normal;
    }
    
    function updateOptoelectronicDeviceStatus() {
        // TODO: 调用后端 API 获取光电设备状态
        // 示例：
        // const response = await api.getOptoelectronicDeviceStatus();
        // optoelectronicDeviceOnline.value = response.online;
        // optoelectronicDeviceNormal.value = response.normal;
    }
    
    // 在组件挂载时获取设备状态
    onMounted(() => {
        updateWirelessDeviceStatus();
        updateOptoelectronicDeviceStatus();
        // 可以设置定时器定期更新状态
        // setInterval(() => {
        //     updateWirelessDeviceStatus();
        //     updateOptoelectronicDeviceStatus();
        // }, 5000); // 每5秒更新一次
        
        // 这里应该是从实际数据源获取目标信息
        currentTarget.value = {
            id: 'UAV-001',
            type: '无人机',
            speed: 120,
            altitude: 500,
            distance: 2.5
        };

        updateRadarData();
        // 定期更新雷达数据
        const updateInterval = setInterval(updateRadarData, 5000); // 每5秒更新一次

        // 组件卸载时清除定时器
        onUnmounted(() => {
            clearInterval(updateInterval);
        });
    });
    
    // 切换频段
    function toggleBand(band) {
        const index = activeBands.value.indexOf(band);
        if (index > -1) {
            activeBands.value.splice(index, 1);
        } else {
            activeBands.value.push(band);
        }
        // TODO: 调用后端 API 更新频段状态
    }
    
    // 更新防御延迟
    function updateDefenseDelay() {
        // TODO: 调用后端 API 更新防御延迟
    }
    
    // 更新防御持续时间
    function updateDefenseDuration() {
        // TODO: 调用后端 API 更新防御持续时间
    }
    
    // 执行防御
    function defend() {
        // TODO: 调用后端 API 执行防御
        window.location.href = 'http://192.168.10.188:8081/#/Index'
    }
    
    // 切换自动防御
    function toggleAutoDefense() {
        // TODO: 调用后端 API 切换自动防御状态
    }
    
    function adjustFocus(direction) {
        // TODO: 实现调焦功能
        console.log(`调整焦距: ${direction}`);
    }
    
    function adjustBrightness(direction) {
        // TODO: 实现亮度调节功能
        console.log(`Adjusting brightness: ${direction}`);
    }
    
    function switchMode(mode) {
        currentMode.value = mode;
        // TODO: 实现模式切换功能
        console.log(`Switched to ${mode} mode`);
    }
    
    function switchPanoramaMode(mode) {
        currentPanoramaMode.value = mode;
        // TODO: 实现全景视频监控模式切换功能
        console.log(`切换全景视频监控模式到: ${mode}`);
    }
    
    function controlAction(buttonNumber) {
        console.log(`Button ${buttonNumber} clicked`);
        // TODO: 实现具体的控制功能
    }
    
    // 添加切换函数
    function toggleServo() {
        servoStatus.value = !servoStatus.value;
        // TODO: 调用后端 API
        console.log(`伺服状态: ${servoStatus.value ? '关机' : '开机'}`);
    }
    
    function toggleChannel() {
        channelType.value = !channelType.value;
        // TODO: 调用后端 API
        console.log(`通道类型: ${channelType.value ? '红外' : '电视'}`);
    }
    
    function resetOptoelectronic() {
        // TODO: 调用后端 API
        console.log('光电归零');
    }
    
    function toggleTargetColor() {
        targetColor.value = !targetColor.value;
        // TODO: 调用后端 API
        console.log(`目标颜色: ${targetColor.value ? '白' : '黑'}`);
    }
    
    function toggleTrackingMode() {
        trackingMode.value = !trackingMode.value;
        // TODO: 调用后端 API
        console.log(`跟踪模式: ${trackingMode.value ? '质心' : '相关'}`);
    }
    
    function toggleInfrared() {
        infraredStatus.value = !infraredStatus.value;
        // TODO: 调用后端 API
        console.log(`红外状态: ${infraredStatus.value ? '关机' : '开机'}`);
    }
    
    function toggleInfraredColor() {
        infraredColor.value = !infraredColor.value;
        // TODO: 调用后端 API
        console.log(`红外颜色: ${infraredColor.value ? '热黑' : '热白'}`);
    }
    
    function toggleLaser() {
        laserStatus.value = !laserStatus.value;
        // TODO: 调用后端 API
        console.log(`激光状态: ${laserStatus.value ? '关' : '开'}`);
    }
    
    function toggleFrequency() {
        frequency.value = !frequency.value;
        // TODO: 调用后端 API
        console.log(`频率: ${frequency.value ? '5Hz' : '12.5Hz'}`);
    }
    
    function stopEmission() {
        console.log('停止发射');
        // TODO: 实现停止发射逻辑
    }
    
    function approachEmission() {
        console.log('就近发射');
        // TODO: 实现就近发射逻辑
    }
    
    function sendCommand() {
        console.log('发送命令');
        // TODO: 实现发送命令逻辑
    }
    
    function driveAway() {
        console.log('执行驱离', driveAwayAngle.value);
        // TODO: 实现驱离逻辑
    }
    
    // 保存设置
    function saveSettings() {
        // TODO: 调用后端 API 保存设置
        console.log('保存设置:', settings.value);
        showSettingsDialog.value = false;
    }
    
    // 关闭设置弹窗
    function closeSettings() {
        showSettingsDialog.value = false;
    }
    
    // 显示设置弹窗
    function showSettings() {
        showSettingsDialog.value = true;
    }

    // 添加雷达数据获取方法
    async function updateRadarData() {
        try {
            // TODO: 调用后端API获取雷达数据
            // const response = await api.getRadarData();
            // radarData.value = {
            //     longitude: response.longitude,
            //     latitude: response.latitude
            // };
            console.log('更新雷达数据');
        } catch (error) {
            console.error('获取雷达数据失败:', error);
        }
    }

    function confirmDefenseDelay() {
        // TODO: 调用后端 API 确认防御延迟
        console.log('确认防御延迟:', defenseDelay.value);
    }

    function confirmDefenseDuration() {
        // TODO: 调用后端 API 确认防御持续时间
        console.log('确认防御持续时间:', defenseDuration.value);
    }

    function showSensorDetails(sensorId) {
        // TODO: 显示传感器详细信息
        console.log('显示传感器详细信息:', sensorId);
    }
</script>

<style scoped>
    .control-panel {
        background-color: rgba(0, 31, 63, 0.9);
        border: 1px solid #00ffff;
        border-radius: 10px;
        color: #ffffff;
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        padding: 10px;
    }
    
    .tabs {
        display: flex;
        border-bottom: 1px solid #00ffff;
        margin-bottom: 5px;
    }
    
    .tabs button {
        flex: 1;
        background-color: transparent;
        color: #ffffff;
        border: none;
        padding: 8px;
        cursor: pointer;
        transition: background-color 0.3s, color 0.3s;
        font-size: 14px;
    }
    
    .tabs button.active {
        background-color: rgba(0, 255, 255, 0.3);
        color: #00ffff;
        border-bottom: 2px solid #00ffff;
    }
    
    .tab-content {
        flex: 1;
        display: flex;
        overflow: hidden;
        padding: 5px;
        min-height: 500px;
    }
    
    .control-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .status-section, .control-section {
        margin-bottom: 15px;
    }
    
    h4 {
        color: #00ffff;
        margin: 4px 0;
        font-size: 14px;
    }
    
    .button-group {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }
    
    button {
        background-color: #005a8c;
        color: #ffffff;
        border: 1px solid #00ffff;
        border-radius: 5px;
        padding: 6px 10px;
        cursor: pointer;
        transition: background-color 0.3s, box-shadow 0.3s;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    button:hover, button.active {
        background-color: #007acc;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
    
    .sensor-info-table, .target-info-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 5px;
    }
    
    .sensor-info-table th, .target-info-table th,
    .sensor-info-table td, .target-info-table td {
        border: 1px solid #00ffff;
        padding: 6px;
        text-align: center;
    }
    
    .sensor-info-table th, .target-info-table th {
        background-color: rgba(0, 255, 255, 0.1);
        font-weight: bold;
    }
    
    .status-row {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
    }
    
    .status-item {
        display: flex;
        align-items: center;
    }
    
    .status-indicator, .status-badge {
        margin-left: 4px;
        padding: 3px 5px;
        border-radius: 3px;
        font-weight: bold;
    }
    
    .status-indicator.online {
        color: #00ff00;
    }
    
    .status-indicator.offline {
        color: #ff0000;
    }
    
    .status-badge.normal {
        background-color: #00ff00;
        color: #000000;
    }
    
    .status-badge.abnormal {
        background-color: #ff0000;
        color: #ffffff;
    }
    
    .switch {
        position: relative;
        display: inline-block;
        width: 34px;
        height: 20px;
    }

    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
        border-radius: 20px;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
    }

    input:checked + .slider {
        background-color: #00ffff;
    }

    input:checked + .slider:before {
        transform: translateX(14px);
    }

    .focus-wheel {
        width: 70px;
        height: 70px;
        margin: 5px auto;
    }

    .focus-wheel svg {
        width: 100%;
        height: 100%;
    }

    .focus-wheel polygon {
        cursor: pointer;
        transition: fill 0.3s;
    }

    .focus-wheel polygon:hover {
        fill: #007acc;
    }

    .button-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        align-items: center;
        justify-items: center;
    }

    .action-buttons {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        margin-top: 15px;
    }

    .action-btn {
        flex: 1;
        padding: 8px;
        background: #003366;
        color: #00ffff;
        border: 1px solid #00ffff;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .action-btn:hover {
        background: #004080;
    }

    .drive-away-section {
        margin-top: 15px;
        border-top: 1px solid rgba(0, 255, 255, 0.3);
        padding-top: 15px;
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background-color: #1a1a1a;
        border: 1px solid #00ffff;
        border-radius: 8px;
        padding: 20px;
        width: 80%;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
    }

    .modal-content h2 {
        color: #00ffff;
        margin-bottom: 20px;
        text-align: center;
    }

    .settings-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        margin-bottom: 20px;
    }

    .setting-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .setting-item label {
        color: #00ffff;
        font-size: 14px;
    }

    .setting-item input[type="range"] {
        width: 100%;
        background-color: #333;
    }

    .setting-item select {
        padding: 5px;
        background-color: #333;
        color: #fff;
        border: 1px solid #00ffff;
        border-radius: 4px;
    }

    .setting-item span {
        color: #00ffff;
        font-size: 12px;
        text-align: right;
    }

    .settings-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
    }

    .settings-footer button {
        padding: 8px 20px;
        font-size: 14px;
    }
</style>

