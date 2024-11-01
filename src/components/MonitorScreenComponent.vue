<template>
    <div :class="['screen', { 'large-screen': isLarge }]">
        <div class="screen-header">
            <div class="device-selector">
                <select v-model="selectedDeviceType" @change="loadDevices">
                    <option value="optical">雷达设备</option>
                    <option value="video">视频设备（全景摄像头）</option>
                </select>
                <select v-model="selectedDeviceId">
                    <option v-for="device in devices"
                            :key="device.id"
                            :value="device.id"
                            @click="loadDeviceData(device)"
                    >
                        {{ device.name }}
                    </option>
                </select>
            </div>
            <div class="screen-controls">
                <button @click="refresh">刷新</button>
            </div>
        </div>
        <div class="device-display" @mouseover="showDeviceInfo = true" @mouseleave="showDeviceInfo = false">
            <div v-if="currentContent.deviceData" class="image-container">
                <!-- 雷达设备显示 -->
                <template v-if="currentContent.deviceType === 'optical'">
                    <img src="@/assets/dianzhen.gif" alt="光电数据"
                         :class="['device-image', { 'large-image': isLarge }]"/>
                </template>
                
                <!-- 视频设备显示 -->
                <template v-else-if="currentContent.deviceType === 'video'">
                    <video ref="videoElement" :class="['device-image', { 'large-image': isLarge }]" autoplay playsinline
                           muted>
                    </video>
                </template>
                
                <!-- 设备标签和信息显示 -->
                <div v-if="isLarge" class="device-label">
                    {{
                        currentContent.deviceType === 'optical' ? '雷达设备' : '视频设备'
                    }}
                    {{ currentContent.deviceData.name }}
                </div>
                <div v-if="showDeviceInfo" class="device-info">
                    <p>名称: {{ currentContent.deviceData.name }}</p>
                    <p>状态: {{ currentContent.deviceData.status }}</p>
                    <p>型号: {{ currentContent.deviceData.model }}</p>
                </div>
            </div>
        </div>
        <div class="device-controls">
            <button v-for="action in currentContent.deviceActions" :key="action" @click="performAction(action)">
                {{ action }}
            </button>
        </div>
    </div>
</template>

<script setup>
    import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
    
    // Props 定义
    const props = defineProps({
        id: String,
        isLarge: {
            type: Boolean,
            default: false
        }
    });
    
    // Emits 定义
    const emit = defineEmits(['update-content']);
    
    // 响应式状态
    const videoElement = ref(null);
    const webRtcServer = ref(null);
    const selectedDeviceType = ref('optical');
    const selectedDeviceId = ref(null);
    const devices = ref([])
    const deviceData = ref(null);
    const showDeviceInfo = ref(false);
    const deviceActions = ref([]);
    
    // 从环境变量获取 WebRTC URL
    const WEBRTC_URL = import.meta.env.VITE_WEBRTC_URL;
    
    // 计算属性
    const currentContent = computed(() => ({
        deviceType: selectedDeviceType.value,
        deviceId: selectedDeviceId.value,
        deviceData: deviceData.value,
        deviceActions: deviceActions.value
    }));
    
    // WebRTC 相关方法
    const initWebRTC = async (streamUrl) => {
        try {
            if (webRtcServer.value) {
                webRtcServer.value.disconnect();
            }
            
            // 获取设备对应的流地址
            if (!streamUrl) return;
            
            // eslint-disable-next-line no-undef
            webRtcServer.value = new WebRtcStreamer(videoElement.value, WEBRTC_URL);
            webRtcServer.value.connect(streamUrl, null, `rtptransport=tcp&timeout=60`);
        } catch (error) {
            console.error('WebRTC 初始化失败:', error);
        }
    };
    
    const selectDeviceStreamUrl = ref('')
    
    // 设备相关方法
    const loadDevices = async () => {
        
        // 这个过程要转向从后端请求
        devices.value = [
            {id: 1, name: '设备1', streamUrl: 'rtsp://192.168.10.80:8554/easy.live'},
            {id: 2, name: '设备2', streamUrl: 'rtsp://camera2/stream'},
            {id: 3, name: '设备3', streamUrl: 'rtsp://camera3/stream'}
        ]
        
        selectedDeviceId.value = devices.value[0]?.id;
        selectDeviceStreamUrl.value = devices.value[0]?.streamUrl;
        loadDeviceData(devices.value[0]);
        updateDeviceActions();
    };
    
    const loadDeviceData = async (device) => {
        // 如果是视频设备，初始化WebRTC
        if (selectedDeviceType.value === 'video') {
            await initWebRTC(device.streamUrl.value);
        }
        
        emitContentUpdate();
    };
    
    const updateDeviceActions = () => {
        switch (selectedDeviceType.value) {
            case 'optical':
                deviceActions.value = ['启动', '停止', '调焦', '变倍'];
                break;
            case 'video':
                deviceActions.value = ['开始录像', '停止录像', '截图', '调整角度'];
                break;
            case 'radar':
                deviceActions.value = ['开始扫描', '停止扫描', '调整范围', '切换模式'];
                break;
            default:
                deviceActions.value = [];
        }
        emitContentUpdate();
    };
    
    const refresh = () => {
        loadDeviceData();
    };
    
    const performAction = (action) => {
        console.log(`执行操作: ${action}，设备类型：${selectedDeviceType.value}，设备ID：${selectedDeviceId.value}`);
    };
    
    const emitContentUpdate = () => {
        emit('update-content', {
            id: props.id,
            content: currentContent.value
        });
    };
    
    // 监听器
    watch(selectedDeviceType, () => {
        updateDeviceActions();
    });
    
    // 生命周期钩子
    onMounted(() => {
        loadDevices();
    });
    
    onUnmounted(() => {
        if (webRtcServer.value) {
            webRtcServer.value.disconnect();
        }
    });
</script>

<style scoped>
    .screen {
        border: 1px solid #1e3a8a;
        border-radius: 10px;
        padding: 15px;
        height: calc(100% - 30px);
        /* 调整高度以适应父容器 */
        display: flex;
        flex-direction: column;
        background-color: #001f3f;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        color: #00ffff;
    }
    
    .large-screen {
        /* 大屏幕的特殊样式 */
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
        object-fit: cover;
        /* 默认填满小屏幕 */
    }
    
    .large-image {
        object-fit: contain;
        /* 大屏幕使用contain以保持比例 */
    }
    
    .device-info {
        position: absolute;
        bottom: 10px;
        left: 10px;
        background: rgba(15, 23, 42, 0.8);
        color: #00ffff;
        /* 修改文字颜色 */
        padding: 10px;
        border-radius: 5px;
    }
    
    .device-controls {
        display: flex;
        justify-content: space-around;
        margin-top: 15px;
        flex-wrap: wrap;
        /* 允许按钮换行 */
        gap: 8px;
        /* 按钮之间的间距 */
    }
    
    .device-controls button {
        flex: 0 0 auto;
        /* 允许按钮根据内容自适应宽度 */
    }
    
    .device-label {
        position: absolute;
        top: 10px;
        left: 10px;
        background: rgba(15, 23, 42, 0.8);
        color: #00ffff;
        /* 修改文字颜色 */
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 0.9em;
        z-index: 10;
    }
    
    video.device-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    video.large-image {
        object-fit: contain;
    }
</style>
