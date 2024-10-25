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
          <img src="@/assets/radar.gif" alt="Radar Display" class="device-image" />
          <div class="device-label">
            雷达设备 {{ selectedDeviceName }}
          </div>
          <!-- 修改设备状态指示器 -->
          <div class="device-status">
            <div class="status-group">
              <span class="status-label">在线状态:</span>
              <span :class="['status-indicator', { 'status-normal': isOnline, 'status-error': !isOnline }]">
                {{ isOnline ? '在线' : '离线' }}
              </span>
            </div>
            <div class="status-group">
              <span class="status-label">故障状态:</span>
              <span :class="['status-indicator', { 'status-normal': !hasFault, 'status-error': hasFault }]">
                {{ hasFault ? '故障' : '正常' }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="device-controls">
        <button @click="togglePower">开关机</button>
        <button @click="toggleRadarWave">雷达波发射</button>
        <button @click="resetToZero">归零</button>
        <button @click="clearCurrent">清当前</button>
        <button @click="track">跟踪</button>
        <button @click="openSettings">详细设置</button>
      </div>
    </div>
    <div class="illegal-aircraft-list">
      <h2>非法飞行物列表</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>类型</th>
            <th>距离 (km)</th>
            <th>方位角 (°)</th>
            <th>俯仰角 (°)</th>
            <th>速度 (km/h)</th>
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
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 添加设置弹窗 -->
    <div v-if="showSettings" class="settings-modal">
      <div class="settings-content">
        <h2>详细设置</h2>
        <!-- 在这里添加设置选项 -->
        <div class="setting-item">
          <label for="range">扫描范围:</label>
          <input type="range" id="range" v-model="scanRange" min="0" max="100">
        </div>
        <div class="setting-item">
          <label for="mode">扫描模式:</label>
          <select id="mode" v-model="scanMode">
            <option value="normal">普通</option>
            <option value="detailed">详细</option>
            <option value="fast">快速</option>
          </select>
        </div>
        <!-- 添加更多设置选项 -->
        <button @click="closeSettings">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const selectedDeviceId = ref(null);
const radarDevices = ref([]);
const activeTarget = ref(null);
const illegalAircraft = ref([
  { id: 1, type: 'UAV', distance: 5.2, angle: 45, elevation: 15, speed: 80 },
  { id: 2, type: 'Drone', distance: 3.7, angle: 120, elevation: 20, speed: 60 },
  { id: 3, type: 'UAV', distance: 7.1, angle: 210, elevation: 10, speed: 90 },
]);

const selectedDeviceName = computed(() => {
  const device = radarDevices.value.find(d => d.id === selectedDeviceId.value);
  return device ? device.name : '';
});

// 添加设备状态相关的响应式变量
const isOnline = ref(true);
const hasFault = ref(false);

onMounted(async () => {
  // 模拟从API获取雷达设备列表
  radarDevices.value = [
    { id: 1, name: '雷达设备1' },
    { id: 2, name: '雷达设备2' },
    { id: 3, name: '雷达设备3' },
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

const startScan = () => {
  console.log('开始扫描');
};

const stopScan = () => {
  console.log('停止扫描');
};

const adjustRange = () => {
  console.log('调整范围');
};

const switchMode = () => {
  console.log('切换模式');
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

const togglePower = () => {
  console.log('切换雷达电源');
};

const toggleRadarWave = () => {
  console.log('切换雷达波发射');
};

const resetToZero = () => {
  console.log('雷达归零');
};

const clearCurrent = () => {
  console.log('清除当前数据');
};

const track = () => {
  console.log('开始跟踪');
};

const openSettings = () => {
  showSettings.value = true;
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
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  flex-wrap: nowrap;
  gap: 8px;
}

.device-controls button {
  flex: 1;
  white-space: nowrap;
}

.illegal-aircraft-list {
  flex: 1;
  padding: 10px;
  background-color: rgba(0, 31, 63, 0.8);
  border-radius: 0 0 10px 10px;
  overflow-y: auto;
}

h2 {
  color: #00ffff;
  text-align: center;
  margin-bottom: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 8px;
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
  background-color: #0f172a;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #00ffff;
  width: 300px;
}

.setting-item {
  margin-bottom: 15px;
}

.setting-item label {
  display: block;
  margin-bottom: 5px;
  color: #00ffff;
}

.setting-item input,
.setting-item select {
  width: 100%;
  padding: 5px;
  background-color: #1e293b;
  color: #00ffff;
  border: 1px solid #00ffff;
  border-radius: 5px;
}

.settings-content button {
  background-color: #003366;
  color: #00ffff;
  border: 1px solid #00ffff;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 15px;
}

.settings-content button:hover {
  background-color: #004080;
}

.device-status {
  position: absolute;
  bottom: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.status-group {
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-label {
  color: #00ffff;
  font-size: 0.9em;
}

.status-indicator {
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 0.9em;
  font-weight: bold;
}

.status-normal {
  background-color: #00ff00;
  color: #000000;
}

.status-error {
  background-color: #ff0000;
  color: #ffffff;
}
</style>
