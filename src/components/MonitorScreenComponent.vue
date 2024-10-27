<template>
    <div :class="['screen', { 'large-screen': isLarge }]">
        <div class="screen-header">
            <div class="device-selector">
                <select v-model="selectedDeviceType" @change="loadDevices">
                    <option value="optical">雷达设备</option>
                    <option value="video">视频设备（全景摄像头）</option>
                </select>
                <select v-model="selectedDeviceId" @change="loadDeviceData">
                    <option v-for="device in devices" :key="device.id" :value="device.id">
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
                <img v-if="currentContent.deviceType === 'radar'"
                     src="@/assets/radar.gif"
                     alt="雷达数据"
                     :class="['device-image', { 'large-image': isLarge }]"/>
                <img v-else-if="currentContent.deviceType === 'video'"
                     src="@/assets/UAV.gif"
                     alt="视频数据"
                     :class="['device-image', { 'large-image': isLarge }]"/>
                <img v-else-if="currentContent.deviceType === 'optical'"
                     src="@/assets/dianzhen.gif"
                     alt="光电数据"
                     :class="['device-image', { 'large-image': isLarge }]"/>
                <img v-else
                     :src="picUrl"
                     alt="设备数据"
                     :class="['device-image', { 'large-image': isLarge }]"/>
                <div v-if="isLarge" class="device-label">
                    {{
                        currentContent.deviceType === 'optical' ? '雷达设备' :
                            currentContent.deviceType === 'video' ? '视频设备' :
                                currentContent.deviceType === 'radar' ? '雷达设备' : ''
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

<script>
    export default {
        name: 'ScreenComponent',
        props: {
            id: String,
            isLarge: {
                type: Boolean,
                default: false
            },
            picUrl: {
                type: String,
                default: null
            }
        },
        data() {
            return {
                selectedDeviceType: 'optical',
                selectedDeviceId: null,
                devices: [],
                deviceData: null,
                showDeviceInfo: false,
                deviceActions: []
            }
        },
        computed: {
            currentContent() {
                return this.content || {
                    deviceType: this.selectedDeviceType,
                    deviceId: this.selectedDeviceId,
                    deviceData: this.deviceData,
                    deviceActions: this.deviceActions
                }
            }
        },
        methods: {
            loadDevices() {
                // 这里应该是从API加载特定类型的设备列表
                // 现在我们使用模拟数据
                this.devices = [
                    {id: 1, name: '设备1'},
                    {id: 2, name: '设备2'},
                    {id: 3, name: '设备3'},
                ];
                this.selectedDeviceId = this.devices[0].id;
                this.loadDeviceData();
                this.updateDeviceActions();
            },
            loadDeviceData() {
                // 这里应该是从API加载特定设备的数据
                // 现在我们使用模拟数据
                this.deviceData = {
                    name: `${this.selectedDeviceType}设备${this.selectedDeviceId}`,
                    status: '正常',
                    model: 'XYZ-123',
                    imageUrl: 'path/to/image.jpg'
                }
                this.emitContentUpdate();
            },
            updateDeviceActions() {
                // 根据设备类型更新操作按钮
                switch (this.selectedDeviceType) {
                    case 'optical':
                        this.deviceActions = ['启动', '停止', '调焦', '变倍'];
                        break;
                    case 'video':
                        this.deviceActions = ['开始录像', '停止录像', '截图', '调整角度'];
                        break;
                    case 'radar':
                        this.deviceActions = ['开始扫描', '停止扫描', '调整范围', '切换模式'];
                        break;
                    default:
                        this.deviceActions = [];
                }
                this.emitContentUpdate();
            },
            refresh() {
                this.loadDeviceData()
            },
            performAction(action) {
                // 这里应该是执行设备操作的逻辑
                console.log(`执行操作: ${action}，设备类型：${this.selectedDeviceType}，设备ID：${this.selectedDeviceId}`)
            },
            emitContentUpdate() {
                this.$emit('update-content', {
                    id: this.id,
                    content: {
                        deviceType: this.selectedDeviceType,
                        deviceId: this.selectedDeviceId,
                        deviceData: this.deviceData,
                        deviceActions: this.deviceActions
                    }
                })
            }
        },
        mounted() {
            this.loadDevices()
        },
        watch: {
            selectedDeviceType() {
                this.updateDeviceActions();
            },
            content: {
                handler(newContent) {
                    if (newContent) {
                        this.selectedDeviceType = newContent.deviceType;
                        this.selectedDeviceId = newContent.deviceId;
                        this.deviceData = newContent.deviceData;
                        this.deviceActions = newContent.deviceActions;
                    }
                },
                deep: true
            }
        }
    }
</script>

<style scoped>
    .screen {
        border: 1px solid #1e3a8a;
        border-radius: 10px;
        padding: 15px;
        height: calc(100% - 30px); /* 调整高度以适应父容器 */
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
        object-fit: cover; /* 默认填满小屏幕 */
    }
    
    .large-image {
        object-fit: contain; /* 大屏幕使用contain以保持比例 */
    }
    
    .device-info {
        position: absolute;
        bottom: 10px;
        left: 10px;
        background: rgba(15, 23, 42, 0.8);
        color: #00ffff; /* 修改文字颜色 */
        padding: 10px;
        border-radius: 5px;
    }
    
    .device-controls {
        display: flex;
        justify-content: space-around;
        margin-top: 15px;
        flex-wrap: wrap; /* 允许按钮换行 */
        gap: 8px; /* 按钮之间的间距 */
    }
    
    .device-controls button {
        flex: 0 0 auto; /* 允许按钮根据内容自适应宽度 */
    }
    
    .device-label {
        position: absolute;
        top: 10px;
        left: 10px;
        background: rgba(15, 23, 42, 0.8);
        color: #00ffff; /* 修改文字颜色 */
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 0.9em;
        z-index: 10;
    }
</style>
