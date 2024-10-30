<template>
    <div class="radar-view">
        <div class="radar-content">
            <div class="screen-header">
                <div class="device-selector">
                    <select v-model="selectedDeviceId" @change="loadDeviceData">
                        <option v-for="device in radarDevices" :key="device.id" :value="device.id">
                            {{ device.name }}
                        </option>
                    </select>
                </div>
                <div class="screen-controls">
                    <button @click="refresh">刷新</button>
                </div>
            </div>
            <div class="device-display">
                <div class="image-container">
                    <img src="@/assets/radar.gif" alt="Radar Display" class="device-image"/>
                    <div class="device-label">
                        雷达设备 {{ selectedDeviceName }}
                    </div>
                </div>
            </div>
            <div class="device-controls">
                <div class="controls-container">
                    <!-- 雷控制 -->
                    <div class="control-group">
                        <h3>雷达控制</h3>
                        <div class="control-row">
                            <button @click="handleStandby">待机</button>
                            <button @click="handleSearch">搜索</button>
                            <button @click="handleTrack">跟踪</button>
                            <button @click="handleTest">调试</button>
                        </div>
                    </div>
                    
                    <!-- 电源控制 -->
                    <div class="control-group">
                        <h3>电源控制</h3>
                        <div class="control-row">
                            <button @click="handlePowerAll">一体机上电</button>
                            <button @click="handlePowerFront">前端上电</button>
                            <button @click="handlePowerSystem">系统上电</button>
                        </div>
                    </div>

                    <!-- 详细设置按钮 -->
                    <div class="control-group settings-group">
                        <button @click="openSettings" class="settings-btn">详细设置</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="illegal-aircraft-list">
            <h2>非法飞行物列表</h2>
            <table>
                <thead>
                <tr>
                    <th>编号</th>
                    <th>类型</th>
                    <th>距离 (km)</th>
                    <th>方位角 (°)</th>
                    <th>俯仰角 (°)</th>
                    <th>速度 (m/h)</th>
                    <th>高度 (m)</th>
                    <th>幅度 (dB)</th>
                    <th>信杂比 (dB)</th>
                    <th>丢失计数</th>
                </tr>
                </thead>
                <tbody>
                <tr
                    v-for="aircraft in illegalAircraft"
                    :key="aircraft.id"
                    :class="{ 'highlighted': aircraft.id === activeTarget?.id }"
                    @mouseover="highlightAircraft(aircraft.id)"
                    @mouseout="unhighlightAircraft"
                >
                    <td>{{ aircraft.id }}</td>
                    <td>{{ aircraft.type }}</td>
                    <td>{{ aircraft.distance.toFixed(2) }}</td>
                    <td>{{ aircraft.angle.toFixed(2) }}</td>
                    <td>{{ aircraft.elevation.toFixed(2) }}</td>
                    <td>{{ aircraft.speed }}</td>
                    <td>{{ aircraft.altitude }}</td>
                    <td>{{ aircraft.amplitude }}</td>
                    <td>{{ aircraft.signalLossRatio }}</td>
                    <td>{{ aircraft.lossCount }}</td>
                </tr>
                </tbody>
            </table>
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

                <!-- 当前状态 -->
                <div class="settings-section">
                    <h3>当前状态</h3>
                    <div class="settings-group">
                        <div class="input-group">
                            <label>伺服角度</label>
                            <input type="text" v-model="settings.status.servoAngle" disabled>
                            <span class="unit">°</span>
                        </div>
                        <div class="input-group">
                            <label>信处温度</label>
                            <input type="text" v-model="settings.status.temperature" disabled>
                            <span class="unit">°C</span>
                        </div>
                        <div class="input-group">
                            <label>量程范围</label>
                            <input type="text" v-model="settings.status.range" disabled>
                            <span class="unit">km</span>
                        </div>
                    </div>
                </div>

                <!-- 杂波图设置 -->
                <div class="settings-section">
                    <h3>杂波图设置</h3>
                    <div class="settings-group">
                        <label class="checkbox-label">
                            <input type="checkbox" v-model="settings.clutterMap.save"> 保存杂波图
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" v-model="settings.clutterMap.load"> 加载杂波图
                        </label>
                    </div>
                </div>

                <!-- 雷达位置 -->
                <div class="settings-section">
                    <h3>雷达位置</h3>
                    <div class="settings-group">
                        <div class="input-group">
                            <label>纬度</label>
                            <input type="text" v-model="settings.position.latitude">
                            <span class="unit">UTC</span>
                        </div>
                        <div class="input-group">
                            <label>经度</label>
                            <input type="text" v-model="settings.position.longitude">
                            <span class="unit">卫星数量</span>
                        </div>
                        <div class="input-group">
                            <label>海拔</label>
                            <input type="text" v-model="settings.position.altitude">
                            <span class="unit">校北角度</span>
                        </div>
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" v-model="settings.position.autoRefresh"> 自动刷新
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" v-model="settings.position.northReturn"> 北回归
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" v-model="settings.position.effective"> 有效
                            </label>
                        </div>
                    </div>
                </div>

                <!-- 伺服待机模式 -->
                <div class="settings-section">
                    <h3>伺服待机模式</h3>
                    <div class="settings-group">
                        <div class="input-group">
                            <select v-model="settings.servoMode.mode">
                                <option value="idle">空闲</option>
                                <option value="standby">待机</option>
                                <option value="active">工作</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label>指向角度</label>
                            <input type="number" v-model="settings.servoMode.angle">
                        </div>
                    </div>
                </div>

                <div class="button-group">
                    <button @click="saveSettings" class="confirm-btn">确定</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { computed, onMounted, ref } from 'vue';
    
    const selectedDeviceId = ref(null);
    const radarDevices = ref([]);
    const activeTarget = ref(null);
    const illegalAircraft = ref([
        {
            id: 1,
            type: 'UAV',
            distance: 5.20,
            angle: 45.00,
            elevation: 15.00,
            speed: 80,
            altitude: 150,
            amplitude: -65,
            signalLossRatio: -12,
            lossCount: 3
        },
        {id: 2, type: 'Drone', distance: 3.7, angle: 120, elevation: 20, speed: 60},
        {id: 3, type: 'UAV', distance: 7.1, angle: 210, elevation: 10, speed: 90},
    ]);
    
    const selectedDeviceName = computed(() => {
        const device = radarDevices.value.find(d => d.id === selectedDeviceId.value);
        return device ? device.name : '';
    });
    
    onMounted(async () => {
        // 模拟从API获取雷达设备列表
        radarDevices.value = [
            {id: 1, name: '雷达设备1'},
            {id: 2, name: '雷达设备2'},
            {id: 3, name: '雷达设备3'},
        ];
        selectedDeviceId.value = radarDevices.value[0].id;
        
        // 模拟每 10 秒更新一次设备状态
        setInterval(() => {
            isOnline.value = Math.random() > 0.2; // 80% 概率在线
            hasFault.value = Math.random() > 0.8; // 20% 概率故障
        }, 10000);
    });
    
    const loadDeviceData = (deviceId) => {
        // 实现加载选定雷达设备数据的逻辑
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
    

    
    // 新增控制方法
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

    // 添加角度调整方法
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
    
    h2 {
        color: #00ffff;
        text-align: center;
        margin: 0 0 5px 0;
        font-size: 1em;
        padding: 2px 0;
    }
    
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 0;
    }
    
    th, td {
        padding: 4px 8px;
        text-align: left;
        border-bottom: 1px solid rgba(0, 255, 255, 0.3);
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
        justify-content: center;
        margin-top: 20px;
    }
    
    .confirm-btn {
        background-color: transparent;
        border: 1px solid #00ffff;
        color: #00ffff;
        padding: 5px 20px;
        cursor: pointer;
        transition: background-color 0.3s;
    }
    
    .confirm-btn:hover {
        background-color: rgba(0, 255, 255, 0.1);
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
</style>
