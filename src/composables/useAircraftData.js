import { onUnmounted, ref } from 'vue'
import axios from '@/api/index.js'

// 初始化模拟数据
const initialAircraftData = [
    {
        id: 1,
        radarData: {
            radarId: 1,
            distance: 1000,
            azimuth: '50°',  //以转台0度为基准
            azimuth2: '140°',  //以正北0度为基准
            pitch: '30°',
            speed: '300',
            longitude: '113.2456',
            latitude: '25.4562'
        },
        electronicData: {
            electronicId: 1,
            type: 'UAV',
            name: 'Mavic3',
            speed: '280',
            altitude: 1200,
            distance: '1100',
            updateTime: '2024-03-21 14:30:00',
            threadLevel: 'high',
            latitude: '25.4564',
            longitude: '113.2458',
            pitch: '32°',
            azimuth: '52°',
            color: '#FF0000',
            path: [[113.2458, 25.4564], [113.2459, 25.4565]]
        },
        fusionData: {
            longitude: '113.2457',
            latitude: '25.4563',
            pitch: '31°',
            azimuth: '51°',
            distance: 1050,
            speed: 290
        }
    },
    {
        id: 2,
        radarData: {
            radarId: 2,
            distance: 2000,
            azimuth: '60°',
            azimuth2: '150°',
            pitch: '25°',
            speed: '250',
            longitude: '113.3456',
            latitude: '25.5562'
        },
        electronicData: {
            electronicId: 2,
            type: 'UAV',
            name: 'Phantom4',
            speed: '240',
            altitude: 800,
            distance: '2100',
            updateTime: '2024-03-21 14:30:00',
            threadLevel: 'medium',
            latitude: '25.5564',
            longitude: '113.3458',
            pitch: '27°',
            azimuth: '62°',
            color: '#00FF00',
            path: [[113.3458, 25.5564], [113.3459, 25.5565]]
        },
        fusionData: {
            longitude: '113.3457',
            latitude: '25.5563',
            pitch: '26°',
            azimuth: '61°',
            distance: 2050,
            speed: 245
        }
    }
]

const aircraftData = ref(initialAircraftData)

// 维护一个自增的原子int
let idCounter = 0;

// 计算融合数据的辅助函数
const calculateFusionData = (radarData, electronicData) => {
    // 将角度字符串转换为数值进行计算
    const parseAngle = (angleStr) => parseFloat(angleStr?.replace('°', '') || '0')
    // 将字符串数值转换为数字进行计算
    const parseNumber = (str) => parseFloat(str?.toString() || '0')

    // 如果其中一个空，则直接返回另一个
    if (radarData.longitude === '0' && radarData.latitude === '0') {
        return {
            longitude: electronicData.longitude,
            latitude: electronicData.latitude,
            pitch: electronicData.pitch,
            azimuth: electronicData.azimuth,
            distance: electronicData.distance,
            speed: electronicData.speed
        }
    } else if (electronicData.longitude === '0' && electronicData.latitude === '0') {
        return {
            longitude: radarData.longitude,
            latitude: radarData.latitude,
            pitch: radarData.pitch,
            azimuth: radarData.azimuth,
            distance: radarData.distance,
            speed: radarData.speed
        }
    } else {
        return {
            longitude: ((parseNumber(radarData.longitude) + parseNumber(electronicData.longitude)) / 2).toFixed(4),
            latitude: ((parseNumber(radarData.latitude) + parseNumber(electronicData.latitude)) / 2).toFixed(4),
            pitch: `${((parseAngle(radarData.pitch) + parseAngle(electronicData.pitch)) / 2).toFixed(1)}°`,
            azimuth: `${((parseAngle(radarData.azimuth) + parseAngle(electronicData.azimuth)) / 2).toFixed(1)}°`,
            distance: ((parseNumber(radarData.distance) + parseNumber(electronicData.distance)) / 2).toFixed(0),
            speed: ((parseNumber(radarData.speed) + parseNumber(electronicData.speed)) / 2).toFixed(0)
        }
    }
}

// 创建一个单例来追踪是否已经启动了更新
let isUpdateStarted = false;
let updateTimer = null;
let radarTimer = null;

export function useAircraftData() {

    // 采用 Haversine 公式计算两个经纬度之间的距离
    function haversine(lat1, lon1, lat2, lon2) {
        const toRadians = (degree) => degree * (Math.PI / 180);
        lat1 = toRadians(lat1);
        lon1 = toRadians(lon1);
        lat2 = toRadians(lat2);
        lon2 = toRadians(lon2);

        const dlon = lon2 - lon1;
        const dlat = lat2 - lat1;
        const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
        const c = 2 * Math.asin(Math.sqrt(a));
        const r = 6371; // 地球半径 (单位: 千米)
        return c * r;
    }

    function parseNumber(value) {
        return parseFloat(value);
    }

    function matchAircraftAndRadar(aircraftData, radarResponse) {
        const radarData = radarResponse.data;
        const n = aircraftData.length;
        const m = radarData.length;

        // 构建距离矩阵
        const dist = Array.from({length: n}, () => Array(m).fill(0));
        for (let i = 0; i < n; i++) {
            const electronicData = aircraftData[i];
            const lat1 = parseNumber(electronicData.latitude);
            const lon1 = parseNumber(electronicData.longitude);

            for (let j = 0; j < m; j++) {
                const radarTarget = radarData[j];
                const lat2 = parseNumber(radarTarget.targetLat);
                const lon2 = parseNumber(radarTarget.targetLon);
                dist[i][j] = haversine(lat1, lon1, lat2, lon2);
            }
        }

        // 动态规划表
        const dp = Array.from({length: n + 1}, () => Array(m + 1).fill(Infinity));
        dp[0][0] = 0; // 基本情况

        for (let i = 1; i <= n; i++) {
            for (let j = 1; j <= m; j++) {
                // 匹配 i 和 j
                dp[i][j] = Math.min(dp[i][j], dp[i - 1][j - 1] + dist[i - 1][j - 1]);
                // 不匹配
                dp[i][j] = Math.min(dp[i][j], dp[i - 1][j], dp[i][j - 1]);
            }
        }

        // 恢复匹配结果并计算融合数据
        let i = n, j = m;
        while (i > 0 && j > 0) {
            if (dp[i][j] === dp[i - 1][j - 1] + dist[i - 1][j - 1]) {
                const singleData = aircraftData[i - 1];
                // 将雷达数据添加到对应的 aircraftData
                singleData.radarData = radarData[j - 1];
                i--;
                j--;
            } else if (dp[i][j] === dp[i - 1][j]) {
                i--;
            } else {
                j--;
            }
        }
    }

    /*const updateElectronicData = async () => {
        try {
            const response = await axios.get('/api/v0/uavs')

            response.data.forEach(uavTarget => {
                const existingIndex = aircraftData.value.findIndex(aircraft =>
                    aircraft.electronicData.electronicId === uavTarget.id
                )

                const newElectronicData = {
                    electronicId: uavTarget.id,
                    type: uavTarget.type || 'UAV',
                    name: uavTarget.name || 'Unknown',
                    speed: uavTarget.speed?.toString() || '0',
                    altitude: uavTarget.altitude || 0,
                    distance: uavTarget.distance?.toString() || '0',
                    updateTime: new Date().toLocaleString(),
                    threadLevel: uavTarget.threadLevel || 'low',
                    latitude: uavTarget.lat?.toString() || '0',
                    longitude: uavTarget.lng?.toString() || '0',
                    pitch: `${uavTarget.pitchAngle || 0}°`,
                    azimuth: `${uavTarget.azimuth || 0}°`,
                    color: uavTarget.color || '#FF0000',
                    path: uavTarget.path || []
                }

                if (existingIndex !== -1) {
                    aircraftData.value[existingIndex].electronicData = newElectronicData
                    aircraftData.value[existingIndex].fusionData = calculateFusionData(
                        aircraftData.value[existingIndex].radarData,
                        newElectronicData
                    )
                } else {
                    aircraftData.value.push({
                        id: idCounter++,
                        radarData: {
                            distance: '0',
                            azimuth: '0°',
                            azimuth2: '0°',
                            pitch: '0°',
                            speed: '0',
                            longitude: '0',
                            latitude: '0'
                        },
                        electronicData: newElectronicData,
                        fusionData: {
                            longitude: uavTarget.lng?.toString() || '0',
                            latitude: uavTarget.lat?.toString() || '0',
                            pitch: `${uavTarget.pitchAngle || 0}°`,
                            azimuth: `${uavTarget.azimuth || 0}°`,
                            distance: uavTarget.distance?.toString() || '0',
                            speed: uavTarget.speed?.toString() || '0'
                        }
                    })
                }
            })

            aircraftData.value = aircraftData.value.filter(aircraft =>
                response.data.some(uavTarget => uavTarget.id === aircraft.id) ||
                aircraft.radarData.distance !== '0'
            )
        } catch (error) {
            console.error('获取UAV数据失败:', error)
        }
    }

    const updateRadarData = async () => {
        try {
            const response = await axios.get('/api/v0/radar/targetList')

            response.data.forEach(radarTarget => {
                const existingIndex = aircraftData.value.findIndex(aircraft =>
                    aircraft.radarData.radarId === radarTarget.targetId
                )

                const newRadarData = {
                    radarId: radarTarget.targetId,
                    distance: radarTarget.range.toFixed(0),
                    azimuth: `${radarTarget.azimuth1.toFixed(1)}°`,
                    azimuth2: `${radarTarget.azimuth2.toFixed(1)}°`,
                    pitch: `${radarTarget.pitch.toFixed(1)}°`,
                    speed: radarTarget.speed.toFixed(0),
                    longitude: radarTarget.targetLon.toFixed(4),
                    latitude: radarTarget.targetLat.toFixed(4)
                }

                if (existingIndex !== -1) {
                    aircraftData.value[existingIndex].radarData = newRadarData
                    aircraftData.value[existingIndex].fusionData = calculateFusionData(
                        newRadarData,
                        aircraftData.value[existingIndex].electronicData
                    )
                } else {
                    aircraftData.value.push({
                        id: idCounter++,
                        radarData: newRadarData,
                        electronicData: {
                            type: 'Unknown',
                            name: 'Unknown',
                            speed: '0',
                            altitude: 0,
                            distance: '0',
                            updateTime: new Date().toLocaleString(),
                            threadLevel: 'unknown',
                            latitude: '0',
                            longitude: '0',
                            pitch: '0°',
                            azimuth: '0°',
                            color: '#808080',
                            path: []
                        },
                        fusionData: {
                            longitude: radarTarget.targetLon.toFixed(4),
                            latitude: radarTarget.targetLat.toFixed(4),
                            pitch: `${radarTarget.pitch.toFixed(1)}°`,
                            azimuth: `${radarTarget.azimuth1.toFixed(1)}°`,
                            distance: radarTarget.range.toFixed(0),
                            speed: radarTarget.speed.toFixed(0)
                        }
                    })
                }
            })

            aircraftData.value = aircraftData.value.filter(aircraft =>
                response.data.some(radarTarget => radarTarget.targetId === aircraft.id)
            )
        } catch (error) {
            console.error('获取雷达数据失败:', error)
        }
    }
*/

    // 1. 获取电侦数据 根据targetId塞进去
    // 2. 获取雷达数据 根据经纬度进行匹配 轮询每个电侦数据对象 取经纬度平方和取最相近的雷达数据放到radarData里
    async function updateFusionData() {
        const electricResponse = await axios.get('/api/v0/uavs')
        if (electricResponse.data != null && aircraftData.value[0].electronicData.updateTime === '2024-03-21 14:30:00') {
            // 清空
            aircraftData.value = []
        }
        electricResponse.data.data.forEach(uavTarget => {
            const existingIndex = aircraftData.value.findIndex(aircraft =>
                aircraft.electronicData.electronicId === uavTarget.id
            )

            const newElectronicData = {
                electronicId: uavTarget.id,
                threatLevel: uavTarget.threadLevel || 'low', // 修正拼写错误
                type: uavTarget.type || 'UAV',
                name: uavTarget.name || 'Unknown',
                speed: uavTarget.speed?.toString() || '0',
                altitude: uavTarget.altitude || 0,
                distance: uavTarget.distance?.toString() || '0',
                updateTime: new Date().toLocaleString(),
                threadLevel: uavTarget.threadLevel || 'low',
                latitude: uavTarget.lat?.toString() || '0',
                longitude: uavTarget.lng?.toString() || '0',
                pitch: `${uavTarget.pitchAngle || 0}°`,
                azimuth: `${uavTarget.azimuth || 0}°`,
                color: uavTarget.color || '#FF0000',
                path: uavTarget.path || []
            }

            if (existingIndex !== -1) {
                aircraftData.value[existingIndex].electronicData = newElectronicData
            } else {
                aircraftData.value.push({
                    id: idCounter++,
                    radarData: {
                        distance: '0',
                        azimuth: '0°',
                        azimuth2: '0°',
                        pitch: '0°',
                        speed: '0',
                        longitude: '0',
                        latitude: '0'
                    },
                    electronicData: newElectronicData,
                    fusionData: {
                        longitude: uavTarget.lng?.toString() || '0',
                        latitude: uavTarget.lat?.toString() || '0',
                        pitch: `${uavTarget.pitchAngle || 0}°`,
                        azimuth: `${uavTarget.azimuth || 0}°`,
                        distance: uavTarget.distance?.toString() || '0',
                        speed: uavTarget.speed?.toString() || '0'
                    }
                })
            }
        })
        const radarResponse = await axios.get('/api/v0/radar/targetList')
        radarResponse.data.data.forEach(radarTarget => {
            const newRadarData = {
                radarId: radarTarget.targetId,
                distance: radarTarget.range.toFixed(0),
                azimuth: `${radarTarget.azimuth1.toFixed(1)}°`,
                azimuth2: `${radarTarget.azimuth2.toFixed(1)}°`,
                pitch: `${radarTarget.pitch.toFixed(1)}°`,
                speed: radarTarget.speed.toFixed(0),
                longitude: radarTarget.targetLon.toFixed(4),
                latitude: radarTarget.targetLat.toFixed(4)
            }

            // 平方和找最接近的
            if (aircraftData.value.length !== 0) {
                matchAircraftAndRadar(aircraftData.value, radarResponse)
            } else {
                // 完全没有电侦数据 那就不匹配
                aircraftData.value.push({
                    id: idCounter++,
                    radarData: newRadarData,
                    electronicData: {
                        type: 'Unknown',
                        name: 'Unknown',
                        speed: '0',
                        altitude: 0,
                        distance: '0',
                        updateTime: new Date().toLocaleString(),
                        threadLevel: 'unknown',
                        latitude: '0',
                        longitude: '0',
                        pitch: '0°',
                        azimuth: '0°',
                        color: '#808080',
                        path: []
                    },
                    fusionData: {
                        longitude: radarTarget.targetLon.toFixed(4),
                        latitude: radarTarget.targetLat.toFixed(4),
                        pitch: `${radarTarget.pitch.toFixed(1)}°`,
                        azimuth: `${radarTarget.azimuth1.toFixed(1)}°`,
                        distance: radarTarget.range.toFixed(0),
                        speed: radarTarget.speed.toFixed(0)
                    }
                })
            }
        })

        for (let i = 0; i < aircraftData.value.length; i++) {
            const aircraft = aircraftData.value[i]
            aircraft.fusionData = calculateFusionData(aircraft.radarData, aircraft.electronicData)
        }
    }

    // 添加启动和停止更新的方法
    const startUpdating = () => {
        if (isUpdateStarted) return;

        isUpdateStarted = true;
        // 立即执行一次更新
        updateFusionData()

        // 设置定时器
        updateTimer = setInterval(updateFusionData, 5000);
        // radarTimer = setInterval(updateRadarData, 5000);

        console.log('Started aircraft data updates');
    };

    const stopUpdating = () => {
        if (updateTimer) {
            clearInterval(updateTimer);
            updateTimer = null;
        }
        if (radarTimer) {
            clearInterval(radarTimer);
            radarTimer = null;
        }
        isUpdateStarted = false;
        console.log('Stopped aircraft data updates');
    };

    // 在组件卸载时检查是否需要停止更新
    onUnmounted(() => {
        // 这里可以添加一些逻辑来决定是否要停止更新
        // 比如可以维护一个计数器，只有当所有使用该 composable 的组件都卸载时才停止
    });

    return {
        aircraftData,
        updateFusionData,
        startUpdating,
        stopUpdating
    }
}
