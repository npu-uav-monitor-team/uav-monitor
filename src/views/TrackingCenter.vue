<template>
    <div class="tracking-view">
        <div class="title-container">
            <h1 class="main-title">态势监控中心-深圳坪山测试场</h1>
            <button @click="goToControlCenter()" class="main-button">
                指挥控制中心
            </button>
        </div>
        <div class="map-container">
            <l-map 
                ref="map" 
                v-model:zoom="zoom" 
                :center="center" 
                :options="mapOptions"
                @ready="onMapReady"
            >
                <!-- 基础瓦片图层 -->
                <l-tile-layer 
                    :url="url" 
                    :attribution="attribution" 
                    :opacity="0.7"
                    @error="handleTileError"
                    v-bind="tileLayerOptions"
                    :zIndex="0"
                />
                
                <!-- 其他图层保持不变，但添加zIndex -->
                <l-circle
                    :lat-lng="noFlyZone.center"
                    :radius="noFlyZone.radius"
                    color="red"
                    fillColor="#f03"
                    :fillOpacity="0.2"
                    :zIndex="10"
                />
                
                <l-polyline
                    v-for="(path, index) in flightPaths"
                    :key="index"
                    :lat-lngs="path.points"
                    :color="path.color"
                    :weight="4"
                    :opacity="0.8"
                    :zIndex="20"
                />
                
                <l-circle-marker
                    v-for="aircraft in allAircraft"
                    :key="aircraft.id"
                    :lat-lng="[aircraft.lat, aircraft.lng]"
                    :radius="6"
                    :color="aircraft.color"
                    :fillColor="aircraft.color"
                    :fillOpacity="0.8"
                    :zIndex="30"
                    @mouseover="showAircraftInfo(aircraft, $event)"
                    @mouseout="closeAircraftInfo"
                >
                    <l-tooltip :options="{ permanent: false, direction: 'right', offset: [10, 0] }">
                        <div class="aircraft-tooltip">
                            <h4>{{ aircraft.name }}</h4>
                            <p>类型: {{ aircraft.type }}</p>
                            <p>速度: {{ aircraft.speed }} km/h</p>
                            <p>高度: {{ aircraft.altitude }} m</p>
                            <p>距离: {{ aircraft.distance }} km</p>
                        </div>
                    </l-tooltip>
                </l-circle-marker>
                <l-marker
                    v-for="aircraft in allAircraft"
                    :key="'arrow-' + aircraft.id"
                    :lat-lng="[aircraft.lat, aircraft.lng]"
                    :icon="getArrowIcon(aircraft)"
                    :z-index-offset="-1000"
                    @mouseover="showAircraftInfo(aircraft, $event)"
                    @mouseout="closeAircraftInfo"
                />
            </l-map>
        </div>
        
        <div class="floating-panel threat-list" :class="{ 'panel-hidden': !showThreatList }">
            <h2>威胁列表
                <button @click="toggleThreatList" class="toggle-btn">{{ showThreatList ? '隐藏' : '显示' }}</button>
            </h2>
            <div v-if="showThreatList" class="table-container">
                <table>
                    <thead>
                    <tr>
                        <th>排序</th>
                        <th>图标</th>
                        <th>飞行器</th>
                        <th>类型</th>
                        <th>威胁等级</th>
                        <th>速度(km/h)</th>
                        <th>高度(m)</th>
                        <th>距离(km)</th>
                        <th>更新时间</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(threat, index) in threats" :key="threat.id">
                        <td>{{ index + 1 }}</td>
                        <td>
                            <span class="color-indicator" :style="{ backgroundColor: threat.color }"></span>
                            <i :class="getIconClass(threat.type)"></i>
                        </td>
                        <td>{{ threat.name }}</td>
                        <td>{{ threat.type }}</td>
                        <td :class="'threat-level-' + threat.level">{{ threat.level }}</td>
                        <td>{{ threat.speed }}</td>
                        <td>{{ threat.altitude }}</td>
                        <td>{{ threat.distance }}</td>
                        <td>{{ threat.updateTime }}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="floating-panel all-aircraft-list" :class="{ 'panel-hidden': !showAllAircraftList }">
            <h2>飞行物列表
                <button @click="toggleAllAircraftList" class="toggle-btn">{{
                        showAllAircraftList ? '隐藏' : '显示'
                    }}
                </button>
            </h2>
            <div v-if="showAllAircraftList" class="table-container">
                <table>
                    <thead>
                    <tr>
                        <th>排序</th>
                        <th>图标</th>
                        <th>飞行器</th>
                        <th>类型</th>
                        <th>速度(km/h)</th>
                        <th>高度(m)</th>
                        <th>距离(km)</th>
                        <th>更新时间</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(aircraft, index) in allAircraft" :key="aircraft.id">
                        <td>{{ index + 1 }}</td>
                        <td>
                            <span class="color-indicator" :style="{ backgroundColor: aircraft.color }"></span>
                            <i :class="getIconClass(aircraft.type)"></i>
                        </td>
                        <td>{{ aircraft.name }}</td>
                        <td>{{ aircraft.type }}</td>
                        <td>{{ aircraft.speed }}</td>
                        <td>{{ aircraft.altitude }}</td>
                        <td>{{ aircraft.distance }}</td>
                        <td>{{ aircraft.updateTime }}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- 注释掉或删除左侧按钮组 -->
        <!--
        <div class="left-buttons">
            <button @click="showModal('zoomControl')" class="control-btn"><i class="fas fa-search"></i></button>
            <button @click="showModal('layerControl')" class="control-btn"><i class="fas fa-layer-group"></i></button>
            <button @click="showModal('measureTool')" class="control-btn"><i class="fas fa-ruler"></i></button>
            <button @click="showModal('drawTool')" class="control-btn"><i class="fas fa-pencil-alt"></i></button>
            <button @click="showModal('commandCenter')" class="control-btn"><i class="fas fa-satellite-dish"></i>
            </button>
        </div>
        -->
        
        <!-- 注释掉或删除模态框 -->
        <!--
        <div v-if="activeModal" class="modal">
            <div class="modal-content">
                <span class="close" @click="closeModal">&times;</span>
                <h2>{{ modalTitle }}</h2>
                <div v-if="activeModal === 'zoomControl'">
                    <button @click="zoomIn">放大</button>
                    <button @click="zoomOut">缩小</button>
                </div>
                <div v-else-if="activeModal === 'layerControl'">
                    <label><input type="checkbox" v-model="showSatelliteLayer"> 卫星图层</label>
                    <label><input type="checkbox" v-model="showTerrainLayer"> 地形图层</label>
                </div>
                <div v-else-if="activeModal === 'measureTool'">
                    <button @click="startMeasure">开始测量</button>
                    <button @click="endMeasure">结束测量</button>
                </div>
                <div v-else-if="activeModal === 'drawTool'">
                    <button @click="startDrawing('polygon')">绘制多边形</button>
                    <button @click="startDrawing('line')">绘制线段</button>
                </div>
                <div v-else-if="activeModal === 'commandCenter'">
                    <button @click="sendCommand('intercept')">拦截目标</button>
                    <button @click="sendCommand('patrol')">巡逻任务</button>
                </div>
            </div>
        </div>
        -->
        
        <!-- Add this new element for the tooltip -->
        <div v-if="selectedAircraft" class="aircraft-tooltip" :style="infoPosition">
            <h4>{{ selectedAircraft.name }}</h4>
            <p>类型: {{ selectedAircraft.type }}</p>
            <p>速度: {{ selectedAircraft.speed }} km/h</p>
            <p>高度: {{ selectedAircraft.altitude }} m</p>
            <p>距离: {{ selectedAircraft.distance }} km</p>
        </div>
    </div>
</template>

<script setup>
    import 'leaflet/dist/leaflet.css'
    import { LCircle, LCircleMarker, LMap, LMarker, LPolyline, LTileLayer, LTooltip, LImageOverlay } from '@vue-leaflet/vue-leaflet'
    import L from 'leaflet'
    
    import { onMounted, ref, onUnmounted, watch } from "vue";
    import { useRouter } from "vue-router";
    
    const router = useRouter()
    
    const map = ref()
    
    const zoom = ref(15) // 保持不变
    const center = ref([22.695519, 114.437709]) // 更新为深圳市坪山区的坐标
    const url = ref('/public/tiles/{z}/{x}/{y}/tile.png')  // 修改为相对路径
    const fallbackUrl = ref('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    const attribution = ref('&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors')
    const mapOptions = ref({
        zoomControl: false,
        minZoom: 0,  // 限制最小缩放级别
        maxZoom: 17,  // 限制最大缩放级别
        preferCanvas: true
    })
    const flightPaths = ref([])
    const allAircraft = ref([
        {
            id: 1,
            type: 'uav',
            name: 'UAV-001',
            speed: 120,
            altitude: 500,
            distance: 2.5,
            updateTime: '2023/4/10 10:30:00',
            lat: 22.695519,
            lng: 114.437709,
            color: 'red'
        },
        {
            id: 2,
            type: 'aircraft',
            name: 'AC-002',
            speed: 200,
            altitude: 1000,
            distance: 5,
            updateTime: '2023/4/10 10:35:00',
            lat: 22.695515,
            lng: 114.437708,
            color: 'blue'
        },
        {
            id: 3,
            type: 'helicopter',
            name: 'HC-003',
            speed: 180,
            altitude: 800,
            distance: 4.5,
            updateTime: '2023/4/10 10:50:00',
            lat: 22.695519,
            lng: 114.437708,
            color: 'green'
        },
        {
            id: 4,
            type: 'uav',
            name: 'UAV-004',
            speed: 130,
            altitude: 550,
            distance: 3.0,
            updateTime: '2023/4/10 11:00:00',
            lat: 22.6900,
            lng: 144.4300,
            color: 'yellow'
        },
        {
            id: 5,
            type: 'aircraft',
            name: 'AC-005',
            speed: 220,
            altitude: 1100,
            distance: 5.5,
            updateTime: '2023/4/10 11:05:00',
            lat: 22.2400,
            lng: 108.9400,
            color: 'purple'
        },
        {
            id: 6,
            type: 'helicopter',
            name: 'HC-006',
            speed: 170,
            altitude: 750,
            distance: 4.0,
            updateTime: '2023/4/10 11:10:00',
            lat: 22.6900,
            lng: 144.4300,
            color: 'orange'
        },
        {
            id: 7,
            type: 'uav',
            name: 'UAV-007',
            speed: 110,
            altitude: 480,
            distance: 2.8,
            updateTime: '2023/4/10 11:15:00',
            lat: 22.6990,
            lng: 144.4395,
            color: 'pink'
        },
        {
            id: 8,
            type: 'aircraft',
            name: 'AC-008',
            speed: 210,
            altitude: 1050,
            distance: 5.2,
            updateTime: '2023/4/10 11:20:00',
            lat: 22.6990,
            lng: 144.4395,
            color: 'cyan'
        },
        {
            id: 9,
            type: 'helicopter',
            name: 'HC-009',
            speed: 175,
            altitude: 820,
            distance: 4.7,
            updateTime: '2023/4/10 11:25:00',
            lat: 34.2190,
            lng: 108.9195,
            color: 'magenta'
        },
        {
            id: 10,
            type: 'uav',
            name: 'UAV-010',
            speed: 125,
            altitude: 520,
            distance: 2.7,
            updateTime: '2023/4/10 11:30:00',
            lat: 22.6995,
            lng: 144.4398,
            color: 'lime'
        }
    ])
    const threats = ref([
        {
            id: 1,
            type: 'uav',
            name: 'UAV-001',
            level: '高',
            speed: 120,
            altitude: 500,
            distance: 2.5,
            updateTime: '2023/4/10 10:30:00',
            color: 'red'
        },
        {
            id: 2,
            type: 'uav',
            name: 'UAV-004',
            level: '高',
            speed: 150,
            altitude: 600,
            distance: 3.2,
            updateTime: '2023/4/10 10:45:00',
            color: 'blue'
        },
        {
            id: 3,
            type: 'aircraft',
            name: 'AC-002',
            level: '中',
            speed: 200,
            altitude: 1000,
            distance: 5,
            updateTime: '2023/4/10 10:35:00',
            color: 'green'
        },
    ])
    const selectedAircraft = ref(null);
    const infoPosition = ref({ left: '0px', top: '0px' });
    const noFlyZone = ref({
        center: [22.695519, 114.437709], // 禁飞区中心坐标
        radius: 1000 // 禁飞区半径（米）
    })
    const showThreatList = ref(true)
    const showAllAircraftList = ref(true)
    
    const goToControlCenter = async () => {
        await router.push('/control-center')
    }
    function getIconClass(type) {
        switch (type) {
            case 'uav':
                return 'fas fa-drone-alt';
            case 'aircraft':
                return 'fas fa-plane';
            case 'helicopter':
                return 'fas fa-helicopter';
            default:
                return 'fas fa-question';
        }
    }
    function showAircraftInfo(aircraft, event) {
        selectedAircraft.value = aircraft;
        // 计算tooltip的位置
        const map = event.target._map;
        const latLng = [aircraft.lat, aircraft.lng];
        const point = map.latLngToContainerPoint(latLng);
        
        // 添加一些偏移，使tooltip显示在目标旁边
        infoPosition.value = {
            left: `${point.x + 15}px`,
            top: `${point.y - 30}px`
        };
    }
    function closeAircraftInfo() {
        selectedAircraft.value = null;
    }
    
    function generateRandomPath(startPoint, numPoints = 20) {  // 增加点的数量
        const path = [startPoint];
        let prevPoint = startPoint;
        let prevAngle = Math.random() * Math.PI * 2;
        
        for (let i = 1; i < numPoints; i++) {
            const angleChange = (Math.random() - 0.5) * Math.PI / 6; // 减小角度变化，使路径更平滑
            const newAngle = prevAngle + angleChange;
            
            // 增加距离以创建更长的路径
            const distance = 0.00001 + Math.random() * 0.0003; // 约200-600米的范围
            const newLat = prevPoint[0] + distance * Math.cos(newAngle);
            const newLng = prevPoint[1] + distance * Math.sin(newAngle);
            
            path.push([newLat, newLng]);
            prevPoint = [newLat, newLng];
            prevAngle = newAngle;
        }
        
        console.log(path)
        return path;
    }
    function getArrowIcon(aircraft) {
        const lastTwoPoints = flightPaths.value.find(path => path.id === aircraft.id).points.slice(-2);
        const angle = calculateAngle(lastTwoPoints[0], lastTwoPoints[1]);
        const svgIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${aircraft.color}" width="36px" height="36px" style="transform: rotate(${angle}deg);">
          <path d="M0 0h24v24H0z" fill="none"/>
          <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
        </svg>
      `;
        return L.divIcon({
            html: svgIcon,
            className: 'arrow-icon',
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            popupAnchor: [0, -18]
        });
    }
    function calculateAngle(point1, point2) {
        const dx = point2[1] - point1[1];
        const dy = point2[0] - point1[0];
        return Math.atan2(dy, dx) * 180 / Math.PI;
    }
    function toggleThreatList() {
        showThreatList.value = !showThreatList.value
    }
    function toggleAllAircraftList() {
        showAllAircraftList.value = !showAllAircraftList.value
    }
    
    // 添加调试信息
    const handleTileError = (error) => {
  console.error('Tile loading error:', error);
  const tileUrl = error.target.src;
  console.log('Failed tile URL:', tileUrl);

  // 使用 fallbackUrl
  error.target.src = fallbackUrl.value.replace('{z}', error.tile.z).replace('{x}', error.tile.x).replace('{y}', error.tile.y).replace('{s}', 'a'); //  使用fallbackUrl
};
    
    // 修改瓦片图层配置
    const tileLayerOptions = ref({
        tileSize: 256,
        crossOrigin: true,
        detectRetina: true,
        maxNativeZoom: 15,
        maxZoom: 19,
        minZoom: 0,
        bounds: [
            [22.67, 114.32],  // 南西角
            [22.73, 114.42]   // 北东角
        ]
    })

    // 添加地图就绪事件处理
    const onMapReady = (mapInstance) => {
        console.log('Map is ready');
        // 测试瓦片加载
        const z = 15;
        const x = Math.floor((center.value[1] + 180) * Math.pow(2, z) / 360);
        const y = Math.floor((1 - Math.log(Math.tan(center.value[0] * Math.PI / 180) + 1 / Math.cos(center.value[0] * Math.PI / 180)) / Math.PI) * Math.pow(2, z-1));
        
        const testTileUrl = `/public/tiles/{z}/{x}/{y}/tile.png`;
        console.log('Testing tile URL:', testTileUrl);
        
        fetch(testTileUrl)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.blob();
            })
            .then(() => console.log('Test tile loaded successfully'))
            .catch(error => console.error('Test tile loading failed:', error));
    }
    
    onMounted(() => {
        allAircraft.value.forEach((aircraft) => {
            const startPoint = [
                22.695519 + (Math.random() - 0.5) * 0.02,
                114.437709 + (Math.random() - 0.5) * 0.02
            ];
            const path = generateRandomPath(startPoint, 30);
            flightPaths.value.push({
                id: aircraft.id,
                points: path,
                color: aircraft.color
            });
            const lastPoint = path[path.length - 1];
            aircraft.lat = lastPoint[0];
            aircraft.lng = lastPoint[1];
        });
        
        noFlyZone.value = {
            center: [22.695519, 114.437709],
            radius: 500
        };
        
        center.value = [22.7087, 114.3671];
        
        // 添加调试信息
        console.log('Map center:', center.value);
        console.log('Initial zoom:', zoom.value);
        
        // 测试瓦片加载
        const testTileUrl = `/public/tiles/15/${Math.floor((center.value[1] + 180) * Math.pow(2, 15) / 360)}/${Math.floor((1 - Math.log(Math.tan(center.value[0] * Math.PI / 180) + 1 / Math.cos(center.value[0] * Math.PI / 180)) / Math.PI) * Math.pow(2, 15-1))}/tile.png`;
        fetch(testTileUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                console.log('Test tile loaded successfully');
            })
            .catch(error => {
                console.error('Test tile loading failed:', error);
            });
    })
    
    onUnmounted(() => {
        // 删除离线相关的事件监听
        // window.removeEventListener('online', updateOnlineStatus);
        // window.removeEventListener('offline', updateOnlineStatus);
    })
</script>

<style scoped>
    .tracking-view {
        height: 100vh;
        width: 100vw;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative; /* 添加相对定位 */
    }
    
    .title-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .main-title {
        flex: 1;
        text-align: center;
    }
    
    .main-button {
        background-color: #004080; /* Change to a more suitable background color */
        color: #ffffff;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
    }
    
    .main-button:hover {
        background-color: #0059b3; /* Slightly darker shade on hover */
    }
    
    .main-title {
        text-align: center;
        color: #ffffff; /* 将颜色从 #00ffff 改为 #ffffff */
        margin: 0;
        padding: 10px 0;
        font-size: 28px;
        font-weight: bold;
    }
    
    .map-container {
        flex: 1;
        position: relative;
        z-index: 1;
        width: 100%;
        height: 100%;
    }
    
    .floating-panel {
        position: absolute;
        background: rgba(0, 20, 40, 0.95);
        border: 2px solid #00ffff;
        border-radius: 8px;
        padding: 15px;
        overflow-y: auto;
        transition: all 0.3s ease;
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
        color: #ffffff;
        z-index: 1000;
        width: calc(30% - 40px);
        max-width: 500px;
    }
    
    .threat-list {
        top: 70px;
        right: 20px;
        height: calc(45% - 70px); /* 调整高度 */
    }
    
    .all-aircraft-list {
        bottom: 20px;
        right: 20px;
        height: calc(45% - 20px); /* 调整高度 */
    }
    
    .panel-hidden {
        width: auto;
        height: auto !important; /* 使用 !important 确保隐藏时高度正确 */
        padding: 5px;
    }
    
    .toggle-btn {
        float: right;
        background: #005a8c; /* 调整按钮背景色 */
        color: #ffffff;
        border: 1px solid #00ffff;
        padding: 4px 8px; /* 增加按钮内边距 */
        cursor: pointer;
        font-size: 12px;
        border-radius: 4px; /* 添加圆角 */
        transition: background-color 0.3s ease;
    }
    
    .toggle-btn:hover {
        background: #007acc; /* 添加悬停效果 */
    }
    
    .map-section, .threat-list, .all-aircraft-list {
        background: rgba(0, 31, 63, 0.8);
        border: 1px solid #00ffff;
        border-radius: 8px; /* 稍微减小圆角 */
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    
    .map-section {
        flex: 1;
    }
    
    .map-container {
        flex: 1;
        position: relative;
        overflow: hidden;
    }
    
    h2 {
        color: #00ffff;
        text-align: center;
        margin: 0 0 15px 0; /* 增加底部边距 */
        font-size: 20px; /* 增大字体大小 */
        text-shadow: 0 0 5px rgba(0, 255, 255, 0.5); /* 添加文字阴影 */
    }
    
    .threat-list, .all-aircraft-list {
        flex: 1;
        margin-bottom: 5px; /* 减小下边距 */
    }
    
    .table-container {
        height: calc(100% - 50px); /* 调整表格容器高度 */
        overflow-y: auto;
    }
    
    table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0 2px; /* 增加行间距 */
        font-size: 13px; /* 增加字体大小 */
    }
    
    th, td {
        padding: 8px 10px; /* 增加单元格内边距 */
        text-align: left;
        border-bottom: 1px solid rgba(0, 255, 255, 0.3);
        height: 32px;
        line-height: 32px;
    }
    
    th {
        background-color: rgba(0, 51, 102, 0.9); /* 调整表头背景色 */
        color: #00ffff;
        position: sticky;
        top: 0;
        z-index: 10;
        font-weight: bold; /* 加粗表头文字 */
    }
    
    tbody tr {
        background-color: rgba(0, 31, 63, 0.6); /* 调整行背景色 */
        transition: background-color 0.3s ease;
    }
    
    tbody tr:nth-child(even) {
        background-color: rgba(0, 41, 83, 0.6); /* 调整偶数行背景色 */
    }
    
    tbody tr:hover {
        background-color: rgba(0, 61, 123, 0.8); /* 添加悬停效果 */
    }
    
    .color-indicator {
        display: inline-block;
        width: 12px; /* 稍微增加颜色指示器的大小 */
        height: 12px;
        border-radius: 50%;
        margin-right: 8px; /* 增加右边距 */
        vertical-align: middle;
    }
    
    /* 美化滚动条 */
    ::-webkit-scrollbar {
        width: 8px;
    }
    
    ::-webkit-scrollbar-track {
        background: rgba(0, 31, 63, 0.8);
    }
    
    ::-webkit-scrollbar-thumb {
        background: rgba(0, 255, 255, 0.5);
        border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 255, 255, 0.7);
    }
    
    .threat-level-高 {
        color: #ff4500;
    }
    
    .threat-level-中 {
        color: #ffa500;
    }
    
    .threat-level-低 {
        color: #00ff00;
    }
    
    /* 添加 Font Awesome 样式 */
    @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css');
    
    .aircraft-tooltip {
        position: absolute; /* 改为absolute定位 */
        background: rgba(0, 31, 63, 0.85);
        border: 1px solid #00ffff;
        border-radius: 4px;
        padding: 5px;
        font-size: 12px;
        color: #ffffff;
        max-width: 150px;
        z-index: 1000;
        pointer-events: none; /* 防止tooltip影响鼠标事件 */
    }
    
    .aircraft-tooltip h4 {
        margin: 0 0 5px 0;
        font-size: 14px;
        color: #00ffff;
    }
    
    .aircraft-tooltip p {
        margin: 2px 0;
    }
    
    /* 修改 l-polyline 的样式 */
    ::v-deep .leaflet-interactive {
        stroke-width: 4px !important; /* 加粗线条 */
        opacity: 0.8 !important; /* 增不透明度 */
    }
    
    .arrow-icon {
        background: none;
        border: none;
        pointer-events: none; /* 使箭头图标不响应鼠标事件 */
    }
    
    /* 增加箭头图标的可见性 */
    ::v-deep .arrow-icon svg {
        filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.5));
    }
    
    /* 移除最大高度限制 */
    .threat-list, .all-aircraft-list {
        max-height: none;
    }
    
    /* 确保内容不会溢出视口 */
    body, html {
        margin: 0;
        padding: 0;
        overflow: hidden;
    }
    
    /* 注释掉或删除左侧按钮组 */
    /*
    .left-buttons {
        position: absolute;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        z-index: 1000;
    }
    
    .control-btn {
        width: 40px;
        height: 40px;
        margin-bottom: 10px;
        background-color: rgba(0, 31, 63, 0.8);
        border: 1px solid #00ffff;
        color: #00ffff;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .control-btn:hover {
        background-color: rgba(0, 61, 123, 0.8);
    }
    
    .modal {
        position: fixed;
        z-index: 2000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .modal-content {
        background-color: rgba(0, 31, 63, 0.95);
        padding: 20px;
        border: 2px solid #00ffff;
        border-radius: 8px;
        width: 300px;
        color: #ffffff;
    }
    
    .close {
        color: #00ffff;
        float: right;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
    }
    
    .close:hover {
        color: #007acc;
    }
    
    .modal-content h2 {
        margin-top: 0;
    }
    
    .modal-content button {
        background-color: #005a8c;
        color: #ffffff;
        border: 1px solid #00ffff;
        padding: 5px 10px;
        margin: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }
    
    .modal-content button:hover {
        background-color: #007acc;
    }
    
    .modal-content label {
        display: block;
        margin: 10px 0;
    }
    */
    
    .offline-map {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #f0f0f0;
        overflow: hidden; /* 防止图片溢出容器 */
    }
    
    .offline-map-image {
        width: 100%;
        height: 100%;
        object-fit: cover; /* 改为 cover 以填充整个容器 */
    }
    
    .threat-list table th:nth-child(5),
    .threat-list table td:nth-child(5) {
        width: 60px; /* 调整这个值以适应两个字的宽度 */
        min-width: 60px;
        max-width: 60px;
        text-align: center;
    }
    
    .threat-list table th,
    .threat-list table td {
        padding: 8px 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .threat-list table th:nth-child(1),
    .threat-list table td:nth-child(1) {
        width: 40px;
        min-width: 40px;
        max-width: 40px;
        text-align: center;
    }
    
    .threat-list table th:nth-child(2),
    .threat-list table td:nth-child(2) {
        width: 50px;
        min-width: 50px;
        max-width: 50px;
        text-align: center;
    }
    
    /* ... 为其他列添加类似的规则 ... */
</style>






















