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
                导航诱骗
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
                            <label>主动防御延迟 (秒)</label>
                            <input type="number" v-model="defenseDelay">
                            <button @click="confirmDefenseDelay">确认</button>
                        </div>
                        <div class="input-group">
                            <label>主动防御间隔 (分钟)</label>
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
                    <span>电侦主动防御</span>
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
                            <th>仰角 (°)</th>
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
                        <button @click="resetOptoelectronic">归零</button>
                        <button @click="toggleTargetColor">{{ targetColor ? '目标白' : '目标黑' }}</button>
                        <button @click="toggleTrackingMode">{{ trackingMode ? '自动' : '人工' }}</button>
                        <button @click="toggleInfrared">{{ infraredStatus ? '红外关机' : '红外开机' }}</button>
                        <button @click="toggleInfraredColor">{{ infraredColor ? '红外热黑' : '红外热白' }}</button>
                        <button @click="toggleLaser">{{ laserStatus ? '激光关' : '激光开' }}</button>
                        <button @click="toggleFrequency">{{ frequency ? '5Hz' : '12.5Hz' }}</button>
                        <button @click="handleCapture">{{ captureStatus === 2 ? '待机' : '捕获' }}</button>
                        <button @click="handleTracking">{{ trackingStatus === 2 ? '停止跟踪' : '跟踪' }}</button>
                        <button @click="handleLaserEmission">{{
                                laserEmissionStatus ? '激光停止' : '激光发射'
                            }}
                        </button>
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
                    <h4>待诱骗目标GPS位置</h4>
                    <table class="gps-table">
                        <thead>
                        <tr>
                            <th>经度</th>
                            <th>纬度</th>
                            <th>高度</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>{{ gpsData.longitude.toFixed(6) }}°</td>
                            <td>{{ gpsData.latitude.toFixed(6) }}°</td>
                            <td>{{ gpsData.altitude.toFixed(6) || 0 }}m</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="power-slider-section">
                    <span>手动功率设置</span>
                    <input type="range" class="power-slider" v-model="powerValue" min="-90" :max="maxPower" step="1">
                    <span>{{ powerValue }}</span>
                    <button @click="sendCommand(4101)" class="power-confirm-btn">确定</button>
                </div>
                
                <div class="small-tabs-content">
                    <div class="small-tabs">
                        <div class="small-tabs-container">
                            <button
                                @click="activeSmallTab = 'driveAway'"
                                :class="{ active: activeSmallTab === 'driveAway' }"
                                class="small-tab"
                            >
                                驱离
                            </button>
                            <button
                                @click="activeSmallTab = 'capture'"
                                :class="{ active: activeSmallTab === 'capture' }"
                                class="small-tab"
                            >
                                捕获
                            </button>
                        </div>
                    </div>
                    <div class="small-tab-content">
                        <div v-if="activeSmallTab === 'driveAway'" class="centered-content">
                            <div class="drive-away-content">
                                <label>角度</label>
                                <input type="number" v-model="driveAwayAngle" placeholder="度">
                                <button @click="sendDriveAwayCommand">保存</button>
                            </div>
                        </div>
                        <div v-else-if="activeSmallTab === 'interference'" class="centered-content">
                            <div class="interference-content">
                                <div class="switch-container">
                                    <span>无效</span>
                                    <label class="switch">
                                        <input type="checkbox" v-model="interferenceEnabled">
                                        <span class="slider round"></span>
                                    </label>
                                    <span>使能</span>
                                </div>
                            </div>
                        </div>
                        <div v-else-if="activeSmallTab === 'noFly'" class="centered-content">
                            <button @click="sendNoFlyCommand">发送</button>
                        </div>
                        <div v-else-if="activeSmallTab === 'defense'" class="centered-content">
                            <div class="defense-content">
                                <div class="switch-container">
                                    <span>无效</span>
                                    <label class="switch">
                                        <input type="checkbox" v-model="defenseEnabled">
                                        <span class="slider round"></span>
                                    </label>
                                    <span>使能</span>
                                </div>
                            </div>
                        </div>
                        <div v-else-if="activeSmallTab === 'capture'">
                            <div class="capture-content">
                                <div class="coordinate-inputs">
                                    <label>诱降位置经纬度</label>
                                    <input type="text" v-model="capturePositionData.latitude" placeholder="纬度">
                                    <input type="text" v-model="capturePositionData.longitude" placeholder="经度">
                                    <button class="icon-button"><i class="icon-target"></i></button>
                                </div>
                                <div class="ambiguity-input">
                                    <label>模糊度</label>
                                    <input
                                        type="number"
                                        v-model="simulationLevel"
                                        @blur="validateSimulationLevel"
                                        placeholder="米"
                                        min="50"
                                    >
                                </div>
                                <div class="operation-buttons">
                                    <button
                                        @click="emissionStatus = '停止'"
                                        :class="{ active: emissionStatus === '停止' }"
                                        class="operation-button"
                                    >
                                        停止发射
                                    </button>
                                    <button
                                        @click="emissionStatus = '就近'"
                                        :class="{ active: emissionStatus === '就近' }"
                                        class="operation-button"
                                    >
                                        就近发射
                                    </button>
                                </div>
                                <button class="send-button">保存</button>
                            </div>
                        </div>
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
                        <label>度</label>
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
    import { computed, onMounted, onUnmounted, ref } from "vue";
    import axios from "@/api/index.js";
    import { deceptionService } from "../service/deceptionService";
    
    const activeTab = ref('control');
    const activeSmallTab = ref('driveAway');
    const interferenceEnabled = ref(false);
    const defenseEnabled = ref(false);
    const emissionStatus = ref('停止');
    
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
    
    const bootStrapTimerId = ref(null);
    
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
    }
    
    async function updateOptoelectronicDeviceStatus() {
        try {
            const response = await axios.get(`/api/v0/photoelectrics/info`);
            if (response.data.code === 0) {
                const device = response.data.data;
                
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
    onMounted(async () => {
        updateWirelessDeviceStatus();
        updateOptoelectronicDeviceStatus();
        
        // 添加定时器，定期新状态
        const statusInterval = setInterval(() => {
            updateWirelessDeviceStatus();
            updateOptoelectronicDeviceStatus();
        }, 5000); // 每秒更新一次
        
        // 这里该是从实际数据源获取目标信息
        currentTarget.value = {
            id: 'UAV-001',
            type: '无人机',
            speed: 120,
            altitude: 500,
            distance: 2.5
        };
        
        // updateRadarData();
        // // 定期更雷达数据
        // const updateInterval = setInterval(updateRadarData, 5000); // 每5秒更新一次
        
        // 添加发射状态更新
        updateEmissionStatus();
        const emissionStatusInterval = setInterval(updateEmissionStatus, 1000);
        
        // 添加键盘事件监听
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        
        await sendCommand(4101)
        
        // 每3秒发送一次这个指令，捕获指令发送前需要这个发送这个指令
        if (bootStrapTimerId.value) clearInterval(bootStrapTimerId.value);
        bootStrapTimerId.value = setInterval(() => {
            if (activeTab.value === 'deception') sendCommand(8192)
        }, 30000);
        
        // todo 设置开启四个定位系统
        
    });
    
    // 组件卸载时清除定时器
    onUnmounted(() => {
        clearInterval(statusInterval);
        clearInterval(updateInterval);
        clearInterval(emissionStatusInterval);
        // clearInterval(bootStrapTimerId.value);
        
        // 移除键盘事件监听
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        
        // 清除可能存在的移动定时器
        if (moveInterval.value) {
            clearInterval(moveInterval.value);
        }
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
    
    // 切换自动防御
    function toggleAutoDefense() {
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
    
    // 添加切函数
    function toggleServo() {
        // 检查是否有可用的设备ID
        
        
        const apiEndpoint = servoStatus.value ?
            `/api/v0/photoelectrics/servo/poweroff` :
            `/api/v0/photoelectrics/servo/poweron`;
        
        axios.post(apiEndpoint)
            .then(response => {
                if (response.data.code === 0) {
                    servoStatus.value = !servoStatus.value;
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
        
        const apiEndpoint = channelType.value ?
            `/api/v0/photoelectrics/channel/tv` :
            `/api/v0/photoelectrics/channel/ir`;
        
        try {
            const response = await axios.post(apiEndpoint);
            if (response.data.code === 0) {
                channelType.value = !channelType.value;
            } else {
                alert(response.data.msg || '通道切换失败');
            }
        } catch (error) {
            console.error('通道切换请求失败:', error);
            alert('通道切换失败，检查网络连接');
        }
    }
    
    // 修改归零函数
    async function resetOptoelectronic() {
        try {
            const response = await axios.post(`/api/v0/photoelectrics/zero`);
            if (response.data.code === 0) {
            } else {
                alert(response.data.msg || '归零失败');
            }
        } catch (error) {
            console.error('归零请求失败:', error);
            alert('归零失败，请检查网络连接');
        }
    }
    
    // 修改目标颜色切换函数
    async function toggleTargetColor() {
        const apiEndpoint = targetColor.value ?
            `/api/v0/photoelectrics/polarity/black` :
            `/api/v0/photoelectrics/polarity/white`;
        
        try {
            const response = await axios.post(apiEndpoint);
            if (response.data.code === 0) {
                targetColor.value = !targetColor.value;
            } else {
                alert(response.data.msg || '目标颜色切换失败');
            }
        } catch (error) {
            console.error('目标颜色切换请失败:', error);
            alert('目标颜色切换失败，请检查网络连接');
        }
    }
    
    // 修改跟踪模式切换函数
    async function toggleTrackingMode() {
        const apiEndpoint = `/api/v0/photoelectrics/workWay`;
        const type = trackingMode.value ? '2' : '1'; // 1自动, 2人工
        try {
            const response = await axios.post(apiEndpoint, null, {
                params: {type}
            });
            if (response.data.code === 0) {
                trackingMode.value = !trackingMode.value;
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
        const apiEndpoint = infraredColor.value ?
            `/api/v0/photoelectrics/polarityir/black` :
            `/api/v0/photoelectrics/polarityir/white`;
        
        try {
            const response = await axios.post(apiEndpoint);
            if (response.data.code === 0) {
                infraredColor.value = !infraredColor.value;
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
        const apiEndpoint = laserStatus.value ?
            `/api/v0/photoelectrics/lazar/poweroff` :
            `/api/v0/photoelectrics/lazar/poweron`;
        
        try {
            const response = await axios.post(apiEndpoint);
            if (response.data.code === 0) {
                laserStatus.value = !laserStatus.value;
            } else {
                alert(response.data.msg || '激光控制失败');
            }
        } catch (error) {
            console.error('激光控制请求失败:', error);
            alert('激光控制失败，请检查网络连接');
        }
    }
    
    async function toggleFrequency() {
        try {
            const frequencyType = frequency.value ? 2 : 3; // 5Hz对应2，12.5Hz对应3
            
            const response = await axios.put(`/api/v0/photoelectrics/laserenergy`, {
                type: frequencyType
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.code === 0) {
                frequency.value = !frequency.value;
            } else {
                alert(response.data.msg || '频率切换失败');
            }
        } catch (error) {
            console.error('频率切换请求失败:', error);
            alert('频率切换失败，请检查网络连接');
        }
    }
    
    const captureStatus = ref(0)
    
    async function handleCapture() {
        try {
            // 捕获0x02 待机0x00
            const status = captureStatus.value;
            
            const response = await axios.put(`/api/v0/photoelectrics/capture`, {
                status: status
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.code === 0) {
                if (captureStatus.value === 2) {
                    captureStatus.value = 0;
                } else {
                    captureStatus.value = 2;
                }
            } else {
                alert(response.data.msg || '频率切换失败');
            }
        } catch (error) {
            console.error('频率切换请求失败:', error);
            alert('频率切换失败，请检查网络连接');
        }
    }
    
    const trackingStatus = ref(0)
    
    async function handleTracking() {
        try {
            // 捕获0x02 待机0x00
            const status = trackingStatus.value
            
            const response = await axios.put(`/api/v0/photoelectrics/capture`, {
                status: status
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.code === 0) {
                if (trackingStatus.value === 2) {
                    trackingStatus.value = 0;
                } else {
                    trackingStatus.value = 2;
                }
            } else {
                alert(response.data.msg || '跟踪切换失败');
            }
        } catch (error) {
            console.error('频率切换请求失败:', error);
            alert('频率切换失败，请检查网络连接');
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
            // TODO: 调用后端API获取雷达数
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
            if (connectRes.data?.data?.maxRadPower) maxPower.value = connectRes.data.data.maxRadPower;
        }
    }
    
    
    // 添加状态更新函数预留口）
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
    const laserEmissionStatus = ref(false);
    
    
    // 添加跟踪处理函数
    // async function handleTracking() {
    
    
    //     try {
    //         const response = await axios.post(`/api/v0/photoelectrics/track`);
    //         if (response.data.code === 0) {
    //             alert('跟踪开始成功');
    //         } else {
    //             alert(response.data.msg || '跟踪开始失败');
    //         }
    //     } catch (error) {
    //         console.error('跟踪请求失败:', error);
    //         alert('跟踪失败，请检查网络连接');
    //     }
    // }
    
    // 添加激光发射处理函数
    async function handleLaserEmission() {
        
        const apiEndpoint = `/api/v0/photoelectrics/laser/launchOrStop?status=${laserEmissionStatus.value ? 1 : 2}`;
        
        try {
            const response = await axios.get(apiEndpoint);
            if (response.data.code === 0) {
                laserEmissionStatus.value = !laserEmissionStatus.value;
            } else {
                alert(response.data.msg || '激光发射控制失败');
            }
        } catch (error) {
            console.error('激光发射控制请求失败:', error);
            alert('激光发射控制失败，请检查网络连接');
        }
    }
    
    // 修改移动控制相关的状态变量
    const isMoving = ref(false);
    const moveDirection = ref(null);
    const moveInterval = ref(null);
    const LONG_PRESS_DELAY = 300; // 长按判定延时（毫秒）
    let pressTimer = null; // 用于判断长按的定时器
    
    // 修改键盘按下事件处理
    async function handleKeyDown(event) {
        // 只在光电设备控制标签页激活时处理键盘事件
        if (activeTab.value !== 'optoelectronic') return;
        
        // 防止重复触发
        if (isMoving.value && moveDirection.value === event.key) return;
        
        switch (event.key) {
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
                event.preventDefault(); // 阻止默认滚动行为
                
                // 清除之前的定时器（如果存在）
                if (pressTimer) {
                    clearTimeout(pressTimer);
                }
                
                // 先发送点击指令
                await sendMoveCommand(event.key, false);
                isMoving.value = true;
                moveDirection.value = event.key;
                
                // 设置长按检测定时器
                pressTimer = setTimeout(async () => {
                    // 到达长按时间阈值，发送长按指令
                    if (isMoving.value && moveDirection.value === event.key) {
                        await sendMoveCommand(event.key, true);
                    }
                }, LONG_PRESS_DELAY);
                
                break;
        }
    }
    
    // 修改键盘松开事件处理
    async function handleKeyUp(event) {
        if (activeTab.value !== 'optoelectronic') return;
        
        switch (event.key) {
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
                // 清除长按检测定时器
                if (pressTimer) {
                    clearTimeout(pressTimer);
                    pressTimer = null;
                }
                
                if (moveDirection.value === event.key) {
                    // 发送停止移动指令
                    await sendMoveCommand(event.key, false);
                    isMoving.value = false;
                    moveDirection.value = null;
                }
                break;
        }
    }
    
    // 修改发送移动指令的函数
    async function sendMoveCommand(direction, isLongPress = false) {
        try {
            let type;
            switch (direction) {
                case 'ArrowLeft':
                    type = 1; // 方位量左
                    break;
                case 'ArrowRight':
                    type = 2; // 方位量右
                    break;
                case 'ArrowUp':
                    type = 3; // 俯仰量上
                    break;
                case 'ArrowDown':
                    type = 4; // 俯仰量下
                    break;
                default:
                    return false;
            }
            
            const response = await axios.post(
                '/api/v0/photoelectrics/manipulate',
                null,
                {
                    params: {
                        type: type,
                        longPressStatus: isLongPress ? 2 : 1
                    },
                    timeout: 0
                }
            );
            
            if (response.status === 200) {
                const data = response.data;
                if (data.code === 0) {
                    return true;
                } else {
                    console.error('API错误:', data.msg);
                    return false;
                }
            } else {
                throw new Error(`HTTP错误: ${response.status}`);
            }
        } catch (error) {
            console.error('移动指令请求失败:', error);
            return false;
        }
    }
    
    // 光电设备移动控制函数（预留接口）
    function moveOptoelectronic(direction) {
        // TODO: 实现光电设备移动控制
        // 这里预留与后端API的接口
        // const apiEndpoint = `/api/v0/photoelectrics/move/${currentPhotoelectricId.value}/${direction}`;
        console.log(`光电设备${getDirectionText(direction)}移动`);
    }
    
    // 添加状态控制变量
    const isEmitting = ref(false); // 是否正在发射
    const emissionType = ref(null); // 'deception' 或 'capture' 或 null
    
    // 计算属性控制按钮状态
    const isDeceptionDisabled = computed(() => isEmitting.value && emissionType.value !== 'deception');
    const isCaptureDisabled = computed(() => isEmitting.value && emissionType.value !== 'capture');
    
    function sendDriveAwayCommand() {
        // TODO: 调用后端 API 发送驱离命令
        console.log('保存驱离角度完成');
    }
    
    function sendNoFlyCommand() {
        // TODO: 调用后端 API 发送禁飞命令
        console.log('发送禁飞命令');
    }
    
    const maxPower = ref(40)
    
    async function toggleInfrared() {
        try {
            const apiEndpoint = `/api/v0/photoelectrics/polarityir/powerOnOrOff?status=${infraredStatus.value ? 1 : 2}`;
            
            const response = await axios.post(apiEndpoint);
            if (response.data.code === 0) {
                infraredStatus.value = !infraredStatus.value;
                alert(infraredStatus.value ? '红外开机成功' : '红外关机成功');
            } else {
                alert(response.data.msg || '红外开关操作失败');
            }
        } catch (error) {
            console.error('红外开关请求失败:', error);
            alert('红外开关操作失败，请检查网络连接');
        }
    }
</script>

<script>
    import { deceptionService } from "../service/deceptionService";
    import { computed, ref } from "vue";
    
    import { useAircraftData } from '@/composables/useAircraftData'
    
    const launchCaptureFlag = ref(false)
    const driveAwayAngle = ref(0);
    const capturePositionData = ref({
        longitude: import.meta.env.VITE_DECEPTION_CAPTURE_LONGITUDE,
        latitude: import.meta.env.VITE_DECEPTION_CAPTURE_LATITUDE,
        altitude: 0.0000
    })
    
    const {cachedSelectedAircraft} = useAircraftData()
    
    const gpsData = computed(() => {
        return {
            longitude: cachedSelectedAircraft.value.fusionData.longitude || '0',
            latitude: cachedSelectedAircraft.value.fusionData.latitude || '0',
            altitude: cachedSelectedAircraft.value.radarData.altitude || '0'
        }
    })
    const simulationLevel = ref(100);
    const powerValue = ref(30);
    
    // 添加验证函数
    const validateSimulationLevel = () => {
        if (simulationLevel.value < 50) {
            simulationLevel.value = 50;
        }
    };
    
    async function sendCommand(cmdWord) {
        let updateCommandRequestDto
        if (cmdWord === 4352) {
            if (!launchCaptureFlag.value) {
                sendCommand(8192)
            }
            // todu: 注意更改position绑定的数据
            updateCommandRequestDto = {
                CmdWord: cmdWord,
                CommandDto: {
                    Capture: {
                        Position: {
                            Latitude: capturePositionData.value.latitude,
                            Longitude: capturePositionData.value.longitude,
                            Altitude: capturePositionData.value.altitude
                        },
                        CaptureAmbiguity: simulationLevel.value,
                        Operate: true
                    }
                }
            }
        } else if (cmdWord === 4097) {
            updateCommandRequestDto = {
                cmdWord: 4097,
                commandDto: {
                    driveAngle: driveAwayAngle.value
                }
            }
        } else if (cmdWord === 8192) {
            // 目标位置引导，在捕获之前需要发送一条这个
            updateCommandRequestDto = {
                CmdWord: cmdWord,
                CommandDto: {
                    bootstrapPosition: {
                        targetType: 0,
                        Position: {
                            Latitude: gpsData.value.latitude,
                            Longitude: gpsData.value.longitude,
                            Altitude: gpsData.value.altitude
                        },
                    }
                }
            }
        } else if (cmdWord === 4100) {
            // 防御
            updateCommandRequestDto = {
                CmdWord: cmdWord,
                CommandDto: {
                    defense: true
                }
            }
        } else if (cmdWord === 4098) {
            // 干扰
            updateCommandRequestDto = {
                CmdWord: cmdWord,
                CommandDto: {
                    IsInterferenceEmitted: true
                }
            }
        } else if (cmdWord === 4099) {
            // 禁飞
            updateCommandRequestDto = {
                CmdWord: cmdWord,
                CommandDto: {
                    nofly: {
                        state: true,
                        Position: {
                            Latitude: 0,
                            Longitude: 0,
                            Altitude: 0
                        },
                    }
                }
            }
        } else if (cmdWord === 4101) {
            // 手动功率设置
            updateCommandRequestDto = {
                CmdWord: cmdWord,
                CommandDto: {
                    transmitPower: {
                        state: 1,
                        power: powerValue.value,
                        sinr: 10,
                    }
                }
            }
        }
        const res = await deceptionService.updateCommand(updateCommandRequestDto)
        if (res) {
            // 要求捕获命令前发送一条8192命令，通过flag判断捕获发送前有发送8192
            // 如果发送了别的命令，先硬把flag置false
            if (res.isSuccess) launchCaptureFlag.value = cmdWord == 8192
            return res.isSuccess
        }
        
        // // 更新数据
        // await clickDeception()
    }
    
    async function stopLaunch_1() {
        let updateCommandRequestDto = {
            cmdWord: 4096,
            commandDto: {
                category: 0
            }
        }
        const res = await deceptionService.updateCommand(updateCommandRequestDto)
        if (res) {
            return true
        }
    }
    
    // 在这里导出需要的函数
    export { sendCommand, stopLaunch_1 }
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
        margin-bottom: 10px;
    }
    
    .gps-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 10px;
    }
    
    .gps-table th, .gps-table td {
        border: 1px solid #00ffff;
        padding: 5px;
        text-align: center;
        color: #00ffff;
    }
    
    .power-slider-section {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
    }
    
    .power-slider {
        flex: 1;
        background-color: #333;
    }
    
    .power-confirm-btn {
        background-color: #007acc;
        color: #ffffff;
        border: none;
        border-radius: 4px;
        padding: 6px 12px;
        cursor: pointer;
        transition: background-color 0.3s;
    }
    
    .power-confirm-btn:hover {
        background-color: #0090ea;
    }
    
    .small-tabs-content {
        border: 1px solid #00ffff;
        border-radius: 5px;
        padding: 10px;
        margin-top: 10px;
        flex: 1;
        display: flex;
        flex-direction: column;
    }
    
    .small-tabs {
        margin-bottom: 10px;
    }
    
    .small-tabs-container {
        display: flex;
        justify-content: space-between;
        gap: 5px;
    }
    
    .small-tab {
        flex: 1;
        background-color: transparent;
        color: #ffffff;
        border: none;
        padding: 8px;
        cursor: pointer;
        transition: background-color 0.3s, color 0.3s;
        font-size: 14px;
    }
    
    .small-tab.active {
        background-color: rgba(0, 255, 255, 0.3);
        color: #00ffff;
    }
    
    .small-tab-content {
        flex: 1;
        background-color: rgba(0, 31, 63, 0.8);
        border-radius: 5px;
        padding: 10px;
        color: #ffffff;
    }
    
    .drive-away-content, .interference-content, .defense-content, .capture-content {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .coordinate-inputs {
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .coordinate-inputs input {
        flex: 1;
        padding: 5px;
        border: 1px solid #00ffff;
        border-radius: 3px;
        background-color: #333;
        color: #ffffff;
    }
    
    .icon-button {
        background-color: #007acc;
        border: none;
        border-radius: 3px;
        padding: 5px;
        cursor: pointer;
        color: #ffffff;
    }
    
    .ambiguity-input {
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .ambiguity-input input {
        width: 100px;
        padding: 5px;
        border: 1px solid #00ffff;
        border-radius: 3px;
        background-color: #333;
        color: #ffffff;
    }
    
    .operation-buttons {
        display: flex;
        gap: 5px;
    }
    
    .operation-button {
        flex: 1;
        background-color: #003856;
        color: #ffffff;
        border: 1px solid #00ffff;
        border-radius: 5px;
        padding: 6px;
        cursor: pointer;
        transition: background-color 0.3s;
    }
    
    .operation-button.active {
        background-color: #007acc;
    }
    
    .operation-button:hover {
        background-color: #007acc;
    }
    
    .send-button {
        background-color: #007acc;
        color: #ffffff;
        border: none;
        border-radius: 5px;
        padding: 10px;
        cursor: pointer;
        transition: background-color 0.3s;
    }
    
    .send-button:hover {
        background-color: #0090ea;
    }
    
    .switch-container {
        display: flex;
        align-items: center;
        gap: 10px;
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
    
    .centered-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        font-size: 18px;
    }
</style>

