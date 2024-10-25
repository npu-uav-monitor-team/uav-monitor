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
                <div class="control-section">
                    <h4>Control Bands</h4>
                    <div class="button-group full-width">
                        <button @click="toggleBand('2.4GHz')" :class="{ active: activeBands.includes('2.4GHz') }">2.4GHz</button>
                        <button @click="toggleBand('5.8GHz')" :class="{ active: activeBands.includes('5.8GHz') }">5.8GHz</button>
                        <button @click="toggleBand('433MHz')" :class="{ active: activeBands.includes('433MHz') }">433MHz</button>
                        <button @click="toggleBand('915MHz')" :class="{ active: activeBands.includes('915MHz') }">915MHz</button>
                    </div>
                </div>
                <div class="control-section">
                    <h4>GNSS Bands</h4>
                    <div class="button-group full-width">
                        <button @click="toggleBand('1.2GHz')" :class="{ active: activeBands.includes('1.2GHz') }">1.2GHz</button>
                        <button @click="toggleBand('1.5GHz')" :class="{ active: activeBands.includes('1.5GHz') }">1.5GHz</button>
                    </div>
                </div>
                <div class="control-section defense-settings">
                    <h4>Defense Settings</h4>
                    <div class="input-group-container">
                        <div class="input-group">
                            <label>Defense delay (sec)</label>
                            <input type="number" v-model="defenseDelay" @change="updateDefenseDelay">
                        </div>
                        <div class="input-group">
                            <label>Defense duration (min)</label>
                            <input type="number" v-model="defenseDuration" @change="updateDefenseDuration">
                        </div>
                    </div>
                </div>
                <div class="control-section">
                    <h4>Sensors</h4>
                    <div class="sensor-group">
                        <span>SF7000012719</span>
                        <button @click="defend">Defend</button>
                    </div>
                </div>
                <div class="auto-defense">
                    <span>Auto Defense</span>
                    <label class="switch">
                        <input type="checkbox" v-model="autoDefense" @change="toggleAutoDefense">
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
            
            <div v-else class="control-content">
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
                        <tr>
                            <td>目标ID:</td>
                            <td>{{ currentTarget.id || 'N/A' }}</td>
                            <td>类型:</td>
                            <td>{{ currentTarget.type || 'N/A' }}</td>
                        </tr>
                        <tr>
                            <td>速度:</td>
                            <td>{{ currentTarget.speed || 'N/A' }} km/h</td>
                            <td>高度:</td>
                            <td>{{ currentTarget.altitude || 'N/A' }} m</td>
                        </tr>
                        <tr>
                            <td>距离:</td>
                            <td>{{ currentTarget.distance || 'N/A' }} km</td>
                            <td></td>
                            <td></td>
                        </tr>
                    </table>
                </div>
                <div class="control-section">
                    <h4>光电设备控制</h4>
                    <div class="button-group full-width">
                        <button @click="adjustFocus('+')">调焦+</button>
                        <button @click="adjustFocus('-')">调焦-</button>
                        <button @click="adjustBrightness('+')">亮度+</button>
                        <button @click="adjustBrightness('-')">亮度-</button>
                    </div>
                </div>
                <div class="control-section">
                    <h4>模式切换</h4>
                    <div class="button-group full-width">
                        <button @click="switchMode('visible')" :class="{ active: currentMode === 'visible' }">可见光</button>
                        <button @click="switchMode('infrared')" :class="{ active: currentMode === 'infrared' }">红外</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

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

const currentTarget = ref({});
const currentMode = ref('visible');

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
}

// 切换自动防御
function toggleAutoDefense() {
    // TODO: 调用后端 API 切换自动防御状态
}

function adjustFocus(direction) {
    // TODO: 实现调焦功能
    console.log(`Adjusting focus: ${direction}`);
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
</script>

<style scoped>
.control-panel {
    background-color: rgba(0, 31, 63, 0.8);
    border: 1px solid #00ffff;
    border-radius: 10px;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

.tabs {
    display: flex;
    border-bottom: 1px solid #00ffff;
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
    background-color: rgba(0, 255, 255, 0.2);
    color: #00ffff;
    border-bottom: 2px solid #00ffff;
}

.tab-content {
    flex: 1;
    display: flex;
    overflow: hidden;
}

.control-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 10px;
}

.status-section, .control-section {
    margin-bottom: 8px;
}

h4 {
    color: #00ffff;
    margin: 4px 0;
    font-size: 14px;
}

.button-group {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

button {
    background-color: #005a8c;
    color: #ffffff;
    border: 1px solid #00ffff;
    padding: 4px 8px;
    border-radius: 3px;
    cursor: pointer;
    transition: background-color 0.3s;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

button:hover, button.active {
    background-color: #007acc;
}

.target-info-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
}

.target-info-table td {
    padding: 2px 4px;
    border: 1px solid rgba(0, 255, 255, 0.3);
}

.target-info-table td:nth-child(odd) {
    font-weight: bold;
    width: 25%;
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
    padding: 2px 4px;
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

/* 移除滚动条样式 */
::-webkit-scrollbar {
    display: none;
}

/* 其他样式保持不变 */

.button-group.full-width {
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
}

.button-group.full-width button {
  flex: 1;
  min-width: 0;
}
</style>
