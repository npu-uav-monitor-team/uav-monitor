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
            threatLevel: 'high',
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
            threatLevel: 'medium',
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
    },
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
            threatLevel: 'high',
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
            threatLevel: 'medium',
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
    },
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
            threatLevel: 'high',
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
            threatLevel: 'medium',
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
    },
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
            threatLevel: 'high',
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
            threatLevel: 'medium',
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
    },
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
            threatLevel: 'high',
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
            threatLevel: 'medium',
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
    },
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
            threatLevel: 'high',
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
            threatLevel: 'medium',
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
    },
]

const aircraftData = ref(initialAircraftData)
const cachedSelectedAircraft = ref({
    longitude: 0,
    latitude: 0,
    altitude: 0
})

// 维护一个自增的原子int
let idCounter = 1;

export function useAircraftData() {
    // 计算融合数据的辅助函数
    const calculateFusionData = (radarData, electronicData) => {
        // 将字符串数值转换为数字进行计算
        const parseNumber = (str) => parseFloat(str || 0)

        // 如果其中一个空，则直接返回另一个
        if (radarData.longitude === 0 && radarData.latitude === 0) {
            return {
                longitude: electronicData.longitude,
                latitude: electronicData.latitude,
                pitch: electronicData.pitch,
                azimuth: electronicData.azimuth,
                distance: electronicData.distance,
                speed: electronicData.speed,
                altitude: electronicData.altitude
            }
        } else if (electronicData.longitude === 0 && electronicData.latitude === 0) {
            return {
                longitude: radarData.longitude,
                latitude: radarData.latitude,
                pitch: radarData.pitch,
                azimuth: radarData.azimuth2,
                distance: radarData.distance,
                speed: radarData.speed,
                altitude: radarData.altitude
            }
        } else {
            return {
                longitude: (parseNumber(radarData.longitude) + parseNumber(electronicData.longitude)) / 2,
                latitude: (parseNumber(radarData.latitude) + parseNumber(electronicData.latitude)) / 2,
                pitch: (parseNumber(radarData.pitch) + parseNumber(electronicData.pitch)) / 2,
                azimuth: (parseNumber(radarData.azimuth) + parseNumber(electronicData.azimuth)) / 2,
                distance: (parseNumber(radarData.distance) + parseNumber(electronicData.distance)) / 2,
                speed: (parseNumber(radarData.speed) + parseNumber(electronicData.speed)) / 2,
                altitude: parseNumber(electronicData.altitude)
            }
        }
    }

// 创建一个单例来追踪是否已经启动了更新
    let isUpdateStarted = false;
    let updateTimer = null;
    let radarTimer = null;


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

    function matchAircraftAndElectronic(aircraftData, uavTarget) {
        let minDistance = Number.MAX_VALUE
        let minIndex = -1
        for (let i = 0; i < aircraftData.length; i++) {
            if ((aircraftData[i].radarData.longitude === 0 && aircraftData[i].radarData.latitude === 0) ||
                (aircraftData[i].electronicData.latitude !== 0 && aircraftData[i].electronicData.longitude !== 0)
            ) {
                // 无雷达数据或者已有电侦数据
                continue
            }
            const distance = haversine(parseNumber(aircraftData[i].radarData.latitude), parseNumber(aircraftData[i].radarData.longitude),
                uavTarget.lat, uavTarget.lng)
            if (distance < minDistance) {
                minDistance = distance
                minIndex = i
            }
            if (minIndex !== -1) {
                aircraftData[minIndex].electronicData = {
                    electronicId: uavTarget.id,
                    threatLevel: uavTarget.threadLevel || 'low', // 修正拼写错误
                    type: uavTarget.type || 'UAV',
                    name: uavTarget.name || 'Unknown',
                    speed: uavTarget.speed || 0,
                    altitude: uavTarget.altitude || 0,
                    distance: uavTarget.distance || 0,
                    updateTime: new Date().toLocaleString(),
                    latitude: uavTarget.lat || 0,
                    longitude: uavTarget.lng || 0,
                    pitch: uavTarget.pitchAngle || 0,
                    azimuth: uavTarget.azimuth || 0,
                    color: convertToHex(uavTarget.color) || '#FF0000',
                    path: uavTarget.path || []
                }
                aircraftData[minIndex].fusionData = calculateFusionData(aircraftData[minIndex].radarData, aircraftData[minIndex].electronicData)
            }
        }
    }

    function matchAircraftAndRadar(aircraftData, radarData) {
        let minDistance = Number.MAX_VALUE
        let minIndex = -1

        for (let i = 0; i < aircraftData.length; i++) {
            if ((aircraftData[i].electronicData.latitude === 0 && aircraftData[i].electronicData.longitude === 0) ||
                (aircraftData[i].radarData.longitude !== 0 && aircraftData[i].radarData.latitude !== 0)) {
                // 无电侦或者已有雷达数据
                continue
            }
            const distance = haversine(parseNumber(aircraftData[i].electronicData.latitude), parseNumber(aircraftData[i].electronicData.longitude),
                radarData.targetLat, radarData.targetLon)
            if (distance < minDistance) {
                minDistance = distance
                minIndex = i
            }
        }

        if (minIndex !== -1) {
            aircraftData[minIndex].radarData = {
                radarId: radarData.targetId,
                distance: parseFloat(radarData.range),
                azimuth2: parseFloat(radarData.azimuth2),
                pitch: parseFloat(radarData.pitch),
                speed: parseFloat(radarData.speed),
                longitude: parseFloat(radarData.targetLon),
                latitude: parseFloat(radarData.targetLat),
                altitude: parseFloat(radarData.altitude),
                updateTime: new Date()
            }
            aircraftData[minIndex].fusionData = calculateFusionData(aircraftData[minIndex].radarData, aircraftData[minIndex].electronicData)
        }
    }

    function convertToHex(colorStr) {
        // 正则表达式提取 r, g, b 的值
        const regex = /r=(\d+),g=(\d+),b=(\d+)/;
        const match = colorStr.match(regex);

        if (match) {
            // 提取 r, g, b 的值
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);

            // 转换为十六进制并返回以 '#' 开头的颜色代码
            return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
        }

        return null; // 如果格式不符合预期，返回 null
    }

    const hasExtraRadarData = () => {
        for (let i = 0; i < aircraftData.value.length; i++) {
            if (parseInt(aircraftData.value[i].radarData.longitude) !== 0 && parseInt(aircraftData.value[i].radarData.latitude) !== 0 &&
                parseInt(aircraftData.value[i].electronicData.longitude) === 0 && parseInt(aircraftData.value[i].electronicData.latitude) === 0
            ) {
                return true
            }
        }
        return false
    }

    const hasExtraElectronicData = () => {
        for (let i = 0; i < aircraftData.value.length; i++) {
            if (parseInt(aircraftData.value[i].electronicData.longitude) !== 0 && parseInt(aircraftData.value[i].electronicData.latitude) !== 0 &&
                parseInt(aircraftData.value[i].radarData.longitude) === 0 && parseInt(aircraftData.value[i].radarData.latitude) === 0) {
                return true
            }
        }
        return false
    }

    // 1. 获取电侦数据 根据targetId塞进去
    async function updateElectricData() {
        const electricResponse = await axios.get('/api/v0/uavs')
        if (electricResponse.data != null && aircraftData.value[0].electronicData.updateTime === '2024-03-21 14:30:00') {
            // 清空
            aircraftData.value.splice(0, aircraftData.value.length)
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
                speed: uavTarget.speed || 0,
                altitude: uavTarget.altitude || 0,
                distance: uavTarget.distance || 0,
                updateTime: new Date().toLocaleString(),
                latitude: uavTarget.lat || 0,
                longitude: uavTarget.lng || 0,
                pitch: uavTarget.pitchAngle || 0,
                azimuth: uavTarget.azimuth || 0,
                color: convertToHex(uavTarget.color) || '#FF0000',
                path: uavTarget.path || []
            }

            if (existingIndex !== -1) {
                // 如果数据已经存在 直接更新
                aircraftData.value[existingIndex].electronicData = newElectronicData
            } else if (aircraftData.value.length !== 0 && hasExtraRadarData(aircraftData.value)) {
                // 如果 则匹配 匹配的条件是有多余的未匹配的雷达数据
                matchAircraftAndElectronic(aircraftData.value, uavTarget)
            } else {
                // 新推数据
                aircraftData.value.push({
                    id: idCounter++,
                    radarData: {
                        distance: 0,
                        azimuth2: 0,
                        pitch: 0,
                        speed: 0,
                        longitude: 0,
                        latitude: 0,
                        altitude: 0,
                        updateTime: new Date()
                    },
                    electronicData: newElectronicData,
                    fusionData: {
                        altitude: uavTarget.altitude || 0,
                        longitude: uavTarget.lng || 0,
                        latitude: uavTarget.lat || 0,
                        pitch: uavTarget.pitchAngle || 0,
                        azimuth: uavTarget.azimuth || 0,
                        distance: uavTarget.distance || 0,
                        speed: uavTarget.speed || 0
                    }
                })
            }
        })
    }

    async function updateRadarData() {
        const radarResponse = await axios.get('/api/v0/radar/targetList')
        radarResponse.data.data.forEach(radarTarget => {
            const newRadarData = {
                altitude: radarTarget.altitude,
                radarId: radarTarget.targetId,
                distance: parseFloat(radarTarget.range),
                azimuth2: parseFloat(radarTarget.azimuth2),
                pitch: parseFloat(radarTarget.pitch),
                speed: parseFloat(radarTarget.speed),
                longitude: parseFloat(radarTarget.targetLon),
                latitude: parseFloat(radarTarget.targetLat),
                updateTime: new Date()
            }

            // 找id
            const existingIndex = aircraftData.value.findIndex(aircraft => {
                return aircraft.radarData.radarId === radarTarget.targetId
            })

            if (existingIndex !== -1) {
                aircraftData.value[existingIndex].radarData = newRadarData
            } else if (aircraftData.value.length !== 0 && hasExtraElectronicData(aircraftData.value)) {
                // 新数据 匹配 如果有空的未匹配的电侦数据
                matchAircraftAndRadar(aircraftData.value, radarTarget)
            } else {
                // 完全没有电侦数据 那就不匹配
                aircraftData.value.push({
                    id: idCounter++,
                    radarData: newRadarData,
                    electronicData: {
                        type: 'Unknown',
                        name: 'Unknown',
                        speed: 0,
                        altitude: 0,
                        distance: 0,
                        updateTime: new Date().toLocaleString(),
                        threatLevel: 'unknown',
                        latitude: 0,
                        longitude: 0,
                        pitch: 0,
                        azimuth: 0,
                        color: '#808080',
                        path: []
                    },
                    fusionData: {
                        altitude: radarTarget.altitude,
                        longitude: parseFloat(radarTarget.targetLon),
                        latitude: parseFloat(radarTarget.targetLat),
                        pitch: radarTarget.pitch,
                        azimuth: radarTarget.azimuth2,
                        distance: radarTarget.range,
                        speed: radarTarget.speed
                    }
                })
            }
        })
    }

// 2. 获取雷达数据 根据经纬度进行匹配 轮询每个电侦数据对象 取经纬度平方和取最相近的雷达数据放到radarData里
    async function updateFusionData() {
        await updateElectricData();
        await updateRadarData();

        // 重新计算融合数据
        for (let i = 0; i < aircraftData.value.length; i++) {
            const aircraft = aircraftData.value[i]
            aircraft.fusionData = calculateFusionData(aircraft.radarData, aircraft.electronicData)
        }

        // 按照融合数据对aircraftData重拍
        aircraftData.value = aircraftData.value
            .sort(
                (a, b) => {
                    return a.fusionData.distance - b.fusionData.distance
                })
            .filter(aircraft => {
                return aircraft.radarData.updateTime >= Date.now() - 5000
            })
    }

    // 添加启动和停止更新的方法
    const startUpdating = () => {
        console.log('Started aircraft data updates');
        if (isUpdateStarted) return;

        isUpdateStarted = true;
        // 立即执行一次更新
        updateFusionData()

        // 设置定时器
        updateTimer = setInterval(updateFusionData, import.meta.env.VITE_REQUEST_REFRESH_DURATION);

        console.log('Started aircraft data updates');
    };

    const stopUpdating = () => {
        console.log('Stopped aircraft data updates');
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
        cachedSelectedAircraft,
        aircraftData,
        updateFusionData,
        startUpdating,
        stopUpdating
    }
}
