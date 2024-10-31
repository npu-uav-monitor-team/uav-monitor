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
                @click="clickDeception"
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
                            <span>故障状态：</span>
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
                        <tr v-for="deviceItem in devices" :key="deviceItem.id">
                            <td>{{ deviceItem.id }}</td>
                            <td>
                                <button @click="showSensorDetails(deviceItem.id)">详细信息</button>
                            </td>
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
                            <span>故障状态：</span>
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
                            <span>故障状态：</span>
                            <span :class="['status-badge', deviceNormal ? 'normal' : 'abnormal']">
                                {{ deviceNormal ? '正常' : '异常' }}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="coordinates-section">
                    <div class="coordinate-container">
                        <div class="control-section">
                            <h4>GPS接收器</h4>
                            <div class="coordinates-display">
                                <div class="coordinate-row">
                                    <div class="coordinate">{{ gpsData.longitude }}°</div>
                                    <div class="coordinate">{{ gpsData.latitude }}°</div>
                                </div>
                                <div class="coordinate-row">
                                    <div class="coordinate">{{ gpsData.altitude || 0 }}m</div>
                                </div>
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
                                <button @click="sendCommand(4097)" class="drive-away-btn">驱离</button>
                            </div>
                        </div>
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
                    <span class="slider-value">{{ simulationLevel }}</span>
                </div>
                
                <div class="control-section">
                    <div class="status-display">
                        <div class="status-item emission-status">
                            <span class="status-label">当前发射状态：</span>
                            <span class="status-value" :class="{ 'active': emissionStatus === '就近' }">
                                {{ emissionStatus }}
                            </span>
                        </div>
                    </div>
                    <div class="action-buttons">
                        <button @click="sendCommand(4352)" class="action-btn primary">捕获</button>
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
    import { onMounted, onUnmounted, ref } from "vue";
    import axios from "axios";
    import { deceptionService } from "../service/deceptionService";
    
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
    const devices = ref([])
    const device = ref({});
    
    // 添加设置关的状态变量
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
    
    const gpsData = ref({
        longitude: 0.0000,
        latitude: 0.0000,
        altitude: 0.0000
    })
    const simulationLevel = ref(100);
    const driveAwayAngle = ref(10);
    
    // 预留的控制接口
    function updateWirelessDeviceStatus() {
        // TODO: 调用后端 API 获取无线设备状态
        axios.get('/api/v0/getDeviceList')
            .then(response => {
                if (response.data.code === 0 && response.data.data) {
                    // 无线设备数据
                    devices.value = response.data.data
                    device.value = response.data.data[0]
                    // 防御状态
                    autoDefense.value = device.value.attackAuto !== 1
                    // defenseDelay.value = data.attackDelay
                    // defenseDuration.value = data.attackDuration
                } else {
                    console.error('接口返回数据格式错误或出现错误:', response.data.msg);
                }
            })
            .catch(error => {
                console.error('获取飞行器数据失败:', error);
            });
        // 获取无线系统配置
        axios.get('/api/v0/getSystemConfig')
            .then(response => {
                if (response.data.code === 0 && response.data.data) {
                    // 无线设备数据
                    const data = response.data.data;
                    defenseDelay.value = data.DefenseDelay
                    defenseDuration.value = data.DefenseDuration
                    // 设备是否在线
                    wirelessDeviceOnline.value = true
                    wirelessDeviceNormal.value = true
                } else {
                    console.error('接口返回数据格式错误或出现错误:', response.data.msg);
                    wirelessDeviceOnline.value = false
                    wirelessDeviceNormal.value = false
                }
            })
            .catch(error => {
                console.error('获取飞行器数据失败:', error);
                wirelessDeviceOnline.value = false
                wirelessDeviceNormal.value = false
            });
        // wirelessDeviceOnline.value = response.online;
        // wirelessDeviceNormal.value = response.normal;
    }
    
    async function updateOptoelectronicDeviceStatus() {
        // 检查是否有设备ID
        if (!currentPhotoelectricId.value) {
            console.warn('未找到光电设备ID');
            optoelectronicDeviceOnline.value = false;
            optoelectronicDeviceNormal.value = false;
            return;
        }
        
        try {
            const response = await axios.get(`/api/v0/photoelectrics/${currentPhotoelectricId.value}`);
            if (response.data.code === 0 && response.data.result?.photoelectrics?.[0]) {
                const device = response.data.result.photoelectrics[0];
                
                // 更新设备在线状态（这里假设如果能获取到数据就是在线的）
                optoelectronicDeviceOnline.value = true;
                optoelectronicDeviceNormal.value = true;
                
                // 更新各个状态
                servoStatus.value = device.isServerPowerOn;
                channelType.value = !device.isChannelTv; // true为红外通道，false为电视通道
                targetColor.value = !device.isPolarityBlack; // true为目标白，false为目标黑
                trackingMode.value = !device.isCorrelation; // true为质心，false为相关
                infraredStatus.value = device.isIrPowerOn;
                infraredColor.value = !device.isPolarityIrBlack; // true为热白，false为热黑
                laserStatus.value = device.isLaserOn;
                
                console.log('光电设备状态更新成功');
            } else {
                console.error('获取光电设备状态失败:', response.data.msg);
                optoelectronicDeviceOnline.value = false;
                optoelectronicDeviceNormal.value = false;
            }
        } catch (error) {
            console.error('获取光电设备状态请求失败:', error);
            optoelectronicDeviceOnline.value = false;
            optoelectronicDeviceNormal.value = false;
        }
    }
    
    // 在组件挂载时获取设备状态
    onMounted(() => {
        updateWirelessDeviceStatus();
        updateOptoelectronicDeviceStatus();
        initPhotoelectrics();
        
        // 添加定时器，定期新状态
        const statusInterval = setInterval(() => {
            updateWirelessDeviceStatus();
            updateOptoelectronicDeviceStatus();
        }, 100000000); // 每秒更新一次
        
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
        
        // 添加发射状态更新
        updateEmissionStatus();
        const emissionStatusInterval = setInterval(updateEmissionStatus, 1000);
        
        // 组件卸载时清除定时器
        onUnmounted(() => {
            clearInterval(statusInterval);
            clearInterval(updateInterval);
            clearInterval(emissionStatusInterval);
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
    function confirmDefenseDelay() {
        // TODO: 调用后端 API 更新防御延迟
        axios.post('/api/v0/setDefenseConfig?defenseDuration=' + defenseDuration.value + '&defenseDelay=' + defenseDelay.value)
            .then(response => {
                if (response.data.code === 0) {
                    alert('设置防御延迟时间成功')
                } else {
                    console.error('接口返回数据格式错误或出现错误:', response.data.msg);
                    
                }
            })
            .catch(error => {
                console.error('获取飞行器数据失败:', error);
                
            });
    }
    
    // 更新防御持续时间
    function confirmDefenseDuration() {
        // TODO: 调用后端 API 更新防御持续时间
        axios.post('/api/v0/setDefenseConfig?defenseDuration=' + defenseDuration.value + '&defenseDelay=' + defenseDelay.value)
            .then(response => {
                if (response.data.code === 0) {
                    alert('设置防御持续时间成功')
                } else {
                    console.error('接口返回数据格式错误或出现错误:', response.data.msg);
                    
                }
            })
            .catch(error => {
                console.error('获取飞行器数据失败:', error);
                
            });
    }
    
    // 执行防御
    function defend() {
        // TODO: 调用后端 API 执行防御
        window.location.href = 'http://192.168.10.188:8081/#/Index'
    }
    
    // 切换自动防御
    function toggleAutoDefense() {
        // TODO: 调用后端 API 切换自动防御状态
        axios.post('/api/v0/setAttackAuto?did=' + device.value.id + '&isCancel=' + autoDefense.value)
            .then(response => {
                if (response.data.code === 0) {
                    console.log('自动防御设置成功')
                } else {
                    console.error('接口返回数据格式错误或出现错误:', response.data.msg);
                }
            })
            .catch(error => {
                console.error('获取飞行器数据失:', error);
            });
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
        // 检查是否有可用的设备ID
        if (!currentPhotoelectricId.value) {
            alert('未找到可用的光电设备');
            return;
        }
        
        const apiEndpoint = servoStatus.value ?
            `/api/v0/photoelectrics/servo/${currentPhotoelectricId.value}/poweroff` :
            `/api/v0/photoelectrics/servo/${currentPhotoelectricId.value}/poweron`;
        
        axios.post(apiEndpoint)
            .then(response => {
                if (response.data.code === 0) {
                    servoStatus.value = !servoStatus.value;
                    alert(servoStatus.value ? '伺服关机成功' : '伺服开机成功');
                } else {
                    alert(response.data.msg || (servoStatus.value ? '伺服关机失败' : '伺服开机失败'));
                }
            })
            .catch(error => {
                console.error('伺服控制请求失败:', error);
                alert('伺服控制请求失败，请检查网络连接');
            });
    }
    
    // 修改通道切换函数
    async function toggleChannel() {
        if (!currentPhotoelectricId.value) {
            alert('未找到可用的光电设备');
            return;
        }
        
        const apiEndpoint = channelType.value ?
            `/api/v0/photoelectrics/channel/${currentPhotoelectricId.value}/tv` :
            `/api/v0/photoelectrics/channel/${currentPhotoelectricId.value}/ir`;
        
        try {
            const response = await axios.post(apiEndpoint);
            if (response.data.code === 0) {
                channelType.value = !channelType.value;
                alert(channelType.value ? '切换到红外通道成功' : '切换到电视通道成功');
            } else {
                alert(response.data.msg || '通道切换失败');
            }
        } catch (error) {
            console.error('通道切换请求失败:', error);
            alert('通道切换失败，请检查网络连接');
        }
    }
    
    // 修改电归零函数
    async function resetOptoelectronic() {
        if (!currentPhotoelectricId.value) {
            alert('未找到可用的光电设备');
            return;
        }
        
        try {
            const response = await axios.post(`/api/v0/photoelectrics/zero/${currentPhotoelectricId.value}`);
            if (response.data.code === 0) {
                alert('电归零成功');
            } else {
                alert(response.data.msg || '电归零失败');
            }
        } catch (error) {
            console.error('电归零请求失败:', error);
            alert('电归零失败，请检查网络连接');
        }
    }
    
    // 修改目标颜色切换函数
    async function toggleTargetColor() {
        if (!currentPhotoelectricId.value) {
            alert('未找到可用的光电设备');
            return;
        }
        
        const apiEndpoint = targetColor.value ?
            `/api/v0/photoelectrics/polarity/${currentPhotoelectricId.value}/black` :
            `/api/v0/photoelectrics/polarity/${currentPhotoelectricId.value}/white`;
        
        try {
            const response = await axios.post(apiEndpoint);
            if (response.data.code === 0) {
                targetColor.value = !targetColor.value;
                alert(targetColor.value ? '切换到目标白成功' : '切换到目标黑成功');
            } else {
                alert(response.data.msg || '目标颜色切换失败');
            }
        } catch (error) {
            console.error('目标颜色切换请求失败:', error);
            alert('目标颜色切换失败，请检查网络连接');
        }
    }
    
    // 修改跟踪模式切换函数
    async function toggleTrackingMode() {
        if (!currentPhotoelectricId.value) {
            alert('未找到可用的光电设备');
            return;
        }
        
        const apiEndpoint = trackingMode.value ?
            `/api/v0/photoelectrics/algorithm/${currentPhotoelectricId.value}/correlation` :
            `/api/v0/photoelectrics/algorithm/${currentPhotoelectricId.value}/centroid`;
        
        try {
            const response = await axios.post(apiEndpoint);
            if (response.data.code === 0) {
                trackingMode.value = !trackingMode.value;
                alert(trackingMode.value ? '切换到质心跟踪成功' : '切换到相关跟踪成功');
            } else {
                alert(response.data.msg || '跟踪模式切换失败');
            }
        } catch (error) {
            console.error('跟踪模式切换请求失败:', error);
            alert('跟踪模式切换失败，请检查网络连接');
        }
    }
    
    // 修改红外颜色切换函数
    async function toggleInfraredColor() {
        if (!currentPhotoelectricId.value) {
            alert('未找到可用的光电设备');
            return;
        }
        
        const apiEndpoint = infraredColor.value ?
            `/api/v0/photoelectrics/polarityir/${currentPhotoelectricId.value}/black` :
            `/api/v0/photoelectrics/polarityir/${currentPhotoelectricId.value}/white`;
        
        try {
            const response = await axios.post(apiEndpoint);
            if (response.data.code === 0) {
                infraredColor.value = !infraredColor.value;
                alert(infraredColor.value ? '切换到红外热黑成功' : '切换到红外热白成功');
            } else {
                alert(response.data.msg || '红外颜色切换失败');
            }
        } catch (error) {
            console.error('红外颜色切换请求失败:', error);
            alert('红外颜色切换失败，请检查网络连接');
        }
    }
    
    // 修改激光开关函数
    async function toggleLaser() {
        if (!currentPhotoelectricId.value) {
            alert('未找到可用的光电设备');
            return;
        }
        
        const apiEndpoint = laserStatus.value ?
            `/api/v0/photoelectrics/lazar/${currentPhotoelectricId.value}/poweroff` :
            `/api/v0/photoelectrics/lazar/${currentPhotoelectricId.value}/poweron`;
        
        try {
            const response = await axios.post(apiEndpoint);
            if (response.data.code === 0) {
                laserStatus.value = !laserStatus.value;
                alert(laserStatus.value ? '激光关闭成功' : '激光开启成功');
            } else {
                alert(response.data.msg || '激光控制失败');
            }
        } catch (error) {
            console.error('激光控制请求失败:', error);
            alert('激光控制失败，请检查网络连接');
        }
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
    
    async function sendCommand(cmdWord) {
        let updateCommandRequestDto
        if (cmdWord === 4352) {
             updateCommandRequestDto = {
                cmdWord: cmdWord,
                commandDto: {
                    capture: {
                        position: {
                            latitude: gpsData.value.latitude,
                            longitude: gpsData.value.longitude,
                            altitude: gpsData.value.altitude
                        },
                        captureAmbiguity: simulationLevel.value,
                        operate: true
                    }
                }
            }
        } else if (cmdWord === 4097) {
            updateCommandRequestDto = {
                cmdWord: cmdWord,
                commandDto: {
                    driveAngle: driveAwayAngle.value
                }
            }
        }
        const res = await deceptionService.updateCommand(updateCommandRequestDto)
        if (res) {
            return true
        }
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
    
    function showSensorDetails(sensorId) {
        // TODO: 显示传感器详细信息
        console.log('显示传感器详细信息:', sensorId);
        window.location.href = 'http://192.168.10.188:8081/#/Index'
    }
    
    async function clickDeception() {
        activeTab.value = 'deception'
        const udpSettingsDto = {
            deviceAddress: import.meta.env.VITE_UAV_CONTROL_DEVICE_ADDR,
            devicePort: import.meta.env.VITE_UAV_CONTROL_DEVICE_PORT,
        }
        const connectRes = await deceptionService.updateConnectSetting(udpSettingsDto)
        console.log(connectRes)
        if (connectRes.isSuccess) {
            // 经纬度都截取到小数点后六位
            gpsData.value.altitude = connectRes.data.data.locatedPosition.altitude.toFixed(5)
            gpsData.value.latitude = connectRes.data.data.locatedPosition.latitude.toFixed(5)
            gpsData.value.longitude = connectRes.data.data.locatedPosition.longitude.toFixed(5)
        }
    }
    
    // 在 script setup 部分添加新的响应式变量
    const photoelectricDevices = ref([]);
    const currentPhotoelectricId = ref(''); // 存储当前选中的设备ID
    
    // 添加初始化光电设备的函数
    async function initPhotoelectrics() {
        try {
            const response = await axios.get('/api/v0/photoelectrics');
            if (response.data.code === 0 && response.data.result?.photoelectrics) {
                photoelectricDevices.value = response.data.result.photoelectrics;
                // 如果有设备，默认选择第一个设备的ID
                if (photoelectricDevices.value.length > 0) {
                    currentPhotoelectricId.value = photoelectricDevices.value[0].id;
                }
                console.log('光电设备初始化成功:', photoelectricDevices.value);
            } else {
                console.error('获取光电设备数据失败:', response.data.msg);
            }
        } catch (error) {
            console.error('获取光电设备信息请求失败:', error);
        }
    }
    
    // 添加状态更新函数（预留接口）
    async function updateEmissionStatus() {
        try {
            // TODO: 调用后端 API 获取当前发射状态
            // const response = await axios.get('/api/v0/emission/status');
            // if (response.data.code === 0) {
            //     emissionStatus.value = response.data.status;
            // }
        } catch (error) {
            console.error('获取发射状态失败:', error);
        }
    }
    
    // 在 script setup 部分添加新的响应式变量
    const emissionStatus = ref('停止'); // 可能的值：'停止' 或 '就近'
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
        gap: 5px;
        overflow-y: auto;
        padding-right: 5px;
    }
    
    .status-section, .control-section {
        margin-bottom: 5px;
    }
    
    h4 {
        color: #00ffff;
        margin: 2px 0;
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
        padding: 5px 0;
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
        margin-top: 10px;
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
        margin-top: 10px;
        border-top: 1px solid rgba(0, 255, 255, 0.3);
        padding-top: 10px;
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
    
    .status-display {
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 5px;
        padding: 8px;
        margin-bottom: 10px;
    }
    
    .emission-status {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }
    
    .status-label {
        color: #00ffff;
        font-size: 14px;
    }
    
    .status-value {
        color: #ff4444;
        font-weight: bold;
        font-size: 16px;
        padding: 5px 15px;
        border-radius: 4px;
        background-color: rgba(255, 68, 68, 0.1);
    }
    
    .status-value.active {
        color: #00ff00;
        background-color: rgba(0, 255, 0, 0.1);
    }
    
    .action-buttons {
        display: flex;
        justify-content: center;
        margin-top: 20px;
    }
    
    .action-btn.primary {
        background-color: #007acc;
        color: white;
        padding: 12px 40px;
        font-size: 16px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s, transform 0.2s;
    }
    
    .action-btn.primary:hover {
        background-color: #0090ea;
        transform: translateY(-2px);
    }
    
    .action-btn.primary:active {
        transform: translateY(0);
    }
    
    .coordinates-display {
        display: flex;
        flex-direction: column;
        gap: 5px;
        background: rgba(0, 0, 0, 0.3);
        padding: 5px;
        border-radius: 4px;
    }

    .coordinate-row {
        display: flex;
        gap: 10px;
        justify-content: center;
    }

    .coordinate {
        flex: 1;
        text-align: center;
        color: #00ffff;
        font-family: monospace;
        font-size: 14px;
    }
    
    .control-content::-webkit-scrollbar {
        width: 4px;
    }
    
    .control-content::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
    }
    
    .control-content::-webkit-scrollbar-thumb {
        background: rgba(0, 255, 255, 0.3);
        border-radius: 2px;
    }
    
    .control-content::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 255, 255, 0.5);
    }
    
    .coordinates-section {
        margin-bottom: 5px;
    }
    
    .coordinate-container {
        display: flex;
        gap: 20px;
        justify-content: space-between;
    }
    
    .coordinate-container .control-section {
        flex: 1;
    }
    
    .drive-away-section {
        margin-top: 0 !important;
        border-top: none !important;
        padding-top: 0 !important;
    }
    
    .angle-input-container {
        display: flex;
        gap: 10px;
        align-items: center;
    }
    
    .angle-input {
        flex: 1;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid #00ffff;
        border-radius: 4px;
        color: #ffffff;
        padding: 5px;
    }
    
    .drive-away-btn {
        padding: 5px 15px;
        background: #005a8c;
        color: #ffffff;
        border: 1px solid #00ffff;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
    }
    
    .drive-away-btn:hover {
        background: #007acc;
    }
    
    .coordinates-display {
        display: flex;
        gap: 10px;
        background: rgba(0, 0, 0, 0.3);
        padding: 8px;
        border-radius: 4px;
    }
    
    .coordinate {
        flex: 1;
        text-align: center;
        color: #00ffff;
        font-family: monospace;
        font-size: 14px;
    }
</style>

