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
                
                <!-- 其他图层保持不变，但添加zIndex -->
                <l-circle
                    :lat-lng="warningZone.center"
                    :radius="warningZone.radius"
                    color="orange"
                    fillColor="#FFA500"
                    :fillOpacity="0.2"
                    :zIndex="10"
                />
                
                <!-- 其他图层保持不变，但添加zIndex -->
                <l-circle
                    :lat-lng="normalZone.center"
                    :radius="normalZone.radius"
                    color="blue"
                    fillColor="#87CEFA"
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
                            <p>: {{ aircraft.speed }} km/h</p>
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
            <h2>
                电侦飞行物列表
                <button @click="toggleThreatList" class="toggle-btn">{{ showThreatList ? '隐藏' : '显示' }}</button>
            </h2>
            <div v-if="showThreatList" class="table-container">
                <table>
                    <thead>
                    <tr>
                        <th>目标ID</th>
                        <th>型号</th>
                        <th>来源</th>
                        <th>告类型</th>
                        <th>链接目标ID</th>
                        <th>探测</th>
                        <th>停留时长（分:秒）</th>
                        <th>最近一次定向</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(edUav, index) in EDUavs" :key="edUav.id">
                        <td>{{ index + 1 }}</td>
                        <td>
                            <span class="color-indicator" :style="{ backgroundColor: edUav.color }"></span>
                            <i :class="getIconClass(edUav.type)"></i>
                        </td>
                        <td>{{ edUav.name }}</td>
                        <td>{{ edUav.type }}</td>
                        <td :class="'threat-level-' + edUav.level">{{ edUav.level }}</td>
                        <td>{{ edUav.speed }}</td>
                        <td>{{ edUav.altitude }}</td>
                        <td>{{ edUav.distance }}</td>
                        <td>{{ edUav.updateTime }}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="floating-panel all-aircraft-list" :class="{ 'panel-hidden': !showAllAircraftList }">
            <h2>融合飞行物列表
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
                        <th>方位角</th>
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
                        <td>{{ aircraft.pitch }}</td>
                        <td>{{ aircraft.updateTime }}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
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
    import { LCircle, LCircleMarker, LMap, LMarker, LPolyline, LTileLayer, LTooltip } from '@vue-leaflet/vue-leaflet'
    import L from 'leaflet'
    import { onMounted, ref, computed } from "vue";
    import { useRouter } from "vue-router";
    import { useAircraftData } from "@/composables/useAircraftData";
    
    const router = useRouter()
    
    const map = ref()
    
    const zoom = ref(15) // 保持不变
    const center = ref([22.702891, 114.438705]) // 更新为深圳的坐
    const url = ref('/tiles/{z}/{x}/{y}/tile.png')  // 修改为相对路径
    const fallbackUrl = ref('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    const attribution = ref('&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors')
    const mapOptions = ref({
        zoomControl: false,
        minZoom: 0,  // 限制最小缩放级别
        maxZoom: 19,  // 限制最大缩放级别
        preferCanvas: true,
        attributionControl: false,
    })
    
    const {aircraftData} = useAircraftData();
    
    // 造一个aircraft 从22.68384 114.373296到22.702891 114.438705 每隔一秒新增一个路径上的随机path 最终10秒时到达终点 起定时任务 十秒结束
    const sampleAircraft = ref({
        id: 'sample',
        electronicData: {
            electronicId: 'sample',
            threatLevel: 'LOW',
            type: 'UAV',
            name: 'Test Flight',
            speed: 10,
            altitude: 100,
            distance: 0,
            updateTime: new Date().toLocaleString(),
            latitude: 22.68384,
            longitude: 114.373296,
            pitch: 0,
            azimuth: 0,
            color: 'green',
            path: [[22.68384, 114.373296]]
        },
        radarData: {
            distance: 0,
            azimuth2: 0,
            pitch: 0,
            speed: 0,
            longitude: 0,
            latitude: 0,
            altitude: 0
        }
    })
    
    const addSamplePath = () => {
        // 生成随机路径点
        const lat = sampleAircraft.value.electronicData.latitude
        const lng = sampleAircraft.value.electronicData.longitude
        // 随机正负
        const latDelta = Math.random() * 0.002 + Math.random() > 0.2 ? 0.001 : -0.001
        const lngDelta = Math.random() * 0.002 + Math.random() > 0.2 ? 0.001 : -0.001
        sampleAircraft.value.electronicData.latitude = lat + latDelta
        sampleAircraft.value.electronicData.longitude = lng + lngDelta
        sampleAircraft.value.electronicData.path.push([sampleAircraft.value.electronicData.latitude, sampleAircraft.value.electronicData.longitude])
    }
    
    const addSamplePathTimer = setInterval(() => {
        addSamplePath()
    }, 1000)
    
    // 十秒之后到达目标点兵结束
    setTimeout(() => {
        // 设置最终位置
        sampleAircraft.value.electronicData.latitude = 22.699232
        sampleAircraft.value.electronicData.longitude = 114.420453
        sampleAircraft.value.electronicData.path.push([22.699232, 114.420453])
        clearInterval(addSamplePathTimer)
    }, 60000)
    
    
    const allAircraft = computed(() => {
        console.log('All aircraft:', aircraftData.value);
        return aircraftData.value.map(aircraft => ({
            id: aircraft.id,
            type: aircraft.electronicData.type,
            name: aircraft.electronicData.name,
            speed: parseFloat(aircraft.fusionData.speed),
            altitude: parseFloat(aircraft.fusionData.altitude),
            distance: aircraft.fusionData.distance,
            updateTime: aircraft.electronicData.updateTime,
            lat: parseFloat(aircraft.electronicData.latitude) === 0 ? parseFloat(aircraft.fusionData.latitude) : parseFloat(aircraft.electronicData.latitude),
            lng: parseFloat(aircraft.electronicData.longitude) === 0 ? parseFloat(aircraft.fusionData.longitude) : parseFloat(aircraft.electronicData.longitude),
            pitch: parseFloat(aircraft.fusionData.pitch),
            color: aircraft.electronicData.color,
            path: aircraft.electronicData.path
        }));
    });
    
    // 电侦UAV列表
    const EDUavs = computed(() => {
        return aircraftData.value
            .filter(aircraft => aircraft.electronicData.name !== 'Unknown')
            .map(aircraft => ({
                id: aircraft.id,
                type: aircraft.electronicData.type,
                name: aircraft.electronicData.name,
                level: aircraft.electronicData.threatLevel,
                speed: aircraft.fusionData.speed,
                altitude: parseFloat(aircraft.electronicData).toFixed(4),
                distance: parseFloat(aircraft.fusionData.distance).toFixed(4),
                updateTime: aircraft.electronicData.updateTime,
                color: aircraft.electronicData.color
            }));
    });
    
    const selectedAircraft = ref(null);
    const infoPosition = ref({left: '0px', top: '0px'});
    const noFlyZone = ref({
        center: [22.70027800, 114.42769963], // 禁飞区中心坐标
        radius: 1000 // 禁飞区半径（米）
    })
    
    const warningZone = ref({
        center: [22.70027800, 114.42769963], // 禁飞区中心坐标
        radius: 3000 // 禁飞区半径（米）
    })
    
    const normalZone = ref({
        center: [22.70027800, 114.42769963], // 禁飞区中心坐标
        radius: 5000 // 禁飞区半径（米）
    })
    const showThreatList = ref(true)
    const showAllAircraftList = ref(true)
    
    const goToControlCenter = () => {
        router.push('/control-center');
    };
    
    function getIconClass(type) {
        switch (type) {
            case 'UAV':
                return 'fas fa-plane';
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
        const map = event.target._map;
        const latLng = [aircraft.lat, aircraft.lng];
        const point = map.latLngToContainerPoint(latLng);
        
        infoPosition.value = {
            left: `${point.x + 15}px`,
            top: `${point.y - 30}px`
        };
    }
    
    function closeAircraftInfo() {
        selectedAircraft.value = null;
    }
    
    const flightPaths = computed(() => {
        return allAircraft.value.map(aircraft => ({
            id: aircraft.id,
            points: aircraft.path || [], // 交换经纬度顺序
            color: aircraft.color
        })).filter(path => path.points && path.points.length > 1); // 只返回有效的路径
    });
    
    function getArrowIcon(aircraft) {
        const path = flightPaths.value.find(p => p.id === aircraft.id);
        if (!path || !path.points || path.points.length < 2) {
            return L.divIcon({
                html: '', // 如果没有路径点，返回空图标
                className: 'arrow-icon',
                iconSize: [36, 36],
                iconAnchor: [18, 18]
            });
        }
        
        const lastTwoPoints = path.points.slice(-2);
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
        const dx = point2[0] - point1[0];
        const dy = point2[1] - point1[1];
        return (Math.atan2(dx, dy) * 180 / Math.PI + 180);
    }
    
    function toggleThreatList() {
        showThreatList.value = !showThreatList.value;
    }
    
    function toggleAllAircraftList() {
        showAllAircraftList.value = !showAllAircraftList.value;
    }
    
    // 添加调试信息
    const handleTileError = (error) => {
        console.error('Tile loading error:', error);
        const tileUrl = error.target.src;
        console.log('Failed tile URL:', tileUrl);
        
        // 使用 fallbackUrl
        error.target.src = fallbackUrl.value.replace('{z}', error.tile.z).replace('{x}', error.tile.x).replace('{y}', error.tile.y).replace('{s}', 'a'); //  使用fallbackUrl
    };
    
    // 修改瓦图层配置
    const tileLayerOptions = ref({
        tileSize: 256,
        crossOrigin: true,
        detectRetina: true,
        maxNativeZoom: 17,
        maxZoom: 19,
        minZoom: 0,
        bounds: [
            [22.67, 114.32],  // 南西角
            [22.73, 114.42]   // 北东角
        ]
    })
    
    // 添加地图就事件处理
    const onMapReady = () => {
        console.log('Map is ready');
        // 测试瓦片加载
        const z = 15;
        const x = Math.floor((center.value[1] + 180) * Math.pow(2, z) / 360);
        const y = Math.floor((1 - Math.log(Math.tan(center.value[0] * Math.PI / 180) + 1 / Math.cos(center.value[0] * Math.PI / 180)) / Math.PI) * Math.pow(2, z - 1));
        
        const testTileUrl = `/tiles/${z}/${x}/${y}/tile.png`;
        console.log('Testing tile URL:', testTileUrl);
        
        fetch(testTileUrl)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.blob();
            })
            .then(() => console.log('Test tile loaded successfully'))
            .catch(error => console.error('Test tile loading failed:', error));
    }
    
    const checkInternetConnection = async () => {
        try {
            // 尝试访问在线地图的一个瓦片来测试是否能访问互联网
            await fetch('https://a.tile.openstreetmap.org/1/1/1.png', {
                method: 'HEAD',
                mode: 'no-cors',
                // 设置较短的超时时间
                signal: AbortSignal.timeout(3000)
            });
            return true;
        } catch (error) {
            console.log('Internet connection test failed:', error);
            return false;
        }
    };
    
    const ONLINE_MAP_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const OFFLINE_MAP_URL = '/tiles/{z}/{x}/{y}/tile.png';
    
    const updateMapUrl = async () => {
        const hasInternet = await checkInternetConnection();
        console.log('Internet connection status:', hasInternet);
        url.value = hasInternet ? ONLINE_MAP_URL : OFFLINE_MAP_URL;
    };
    
    // 修改网络状态监听逻辑
    window.addEventListener('online', () => {
        console.log('Network status changed to online');
        updateMapUrl();
    });
    
    window.addEventListener('offline', () => {
        console.log('Network status changed to offline');
        url.value = OFFLINE_MAP_URL;
    });
    
    onMounted(async () => {
        aircraftData.value.push(sampleAircraft.value);
        
        console.log('All aircraft:', aircraftData.value);
        
        noFlyZone.value = {
            center: [22.70027800, 114.42769963],
            radius: 500
        };
        
        center.value = [22.7087, 114.3671];
        
        // 添加调试信息
        console.log('Map center:', center.value);
        console.log('Initial zoom:', zoom.value);
        
        // 测试瓦片加载
        const testTileUrl = `/tiles/15/${Math.floor((center.value[1] + 180) * Math.pow(2, 15) / 360)}/${Math.floor((1 - Math.log(Math.tan(center.value[0] * Math.PI / 180) + 1 / Math.cos(center.value[0] * Math.PI / 180)) / Math.PI) * Math.pow(2, 15 - 1))}/tile.png`;
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
        
        await updateMapUrl();
    });
</script>

<style scoped>
    .tracking-view {
        height: calc(100vh - 10px); /* 适当减少上下的空白边框 */
        width: calc(100vw - 20px); /* 适当减少右的空白宽度 */
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;
        padding: 5px; /* 保持一些内边距 */
        box-sizing: border-box; /* 确保内边距不会影响整体宽高 */
        margin: 5px 10px; /* 调整外边距以实现裁剪效果 */
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
        width: 98%; /* 减少地图宽度 */
        height: 98%; /* 减少地图高度 */
        margin: auto; /* 居中地图 */
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
        width: 48%; /* 调整宽度以适应新布局 */
        max-width: 580px; /* 调整最大宽度 */
    }
    
    .threat-list {
        top: 70px;
        right: 10px; /* 调整位置 */
        height: calc(45% - 70px); /* 调整高度 */
    }
    
    .all-aircraft-list {
        bottom: 10px; /* 调整位置 */
        right: 10px; /* 调整位置 */
        height: calc(45% - 20px); /* 调整高度 */
    }
    
    .panel-hidden {
        width: auto;
        height: auto !important; /* 使用 !important 确保隐藏时高度正确 */
        padding: 5px;
    }
    
    .toggle-btn {
        float: right;
        background: #005a8c;
        color: #ffffff;
        border: 1px solid #00ffff;
        padding: 4px 8px;
        cursor: pointer;
        font-size: 12px;
        border-radius: 4px;
        transition: background-color 0.3s ease;
    }
    
    .toggle-btn:hover {
        background: #007acc;
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
        stroke-width: 4px !important; /* 加粗条 */
        opacity: 0.8 !important; /* 增不透明度 */
    }
    
    .arrow-icon {
        background: none;
        border: none;
        pointer-events: none; /* 使箭图标不响应鼠标事件 */
    }
    
    /* 增加箭头图标的可见性 */
    ::v-deep .arrow-icon svg {
        filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.5));
    }
    
    /* 移除最高度限制 */
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
        object-fit: cover; /* 改为 cover 以填充个容器 */
    }
    
    .threat-list table th:nth-child(5),
    .threat-list table td:nth-child(5) {
        width: 60px; /* 调整这个值以适应两字的宽度 */
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























