import axios from './index.js'

// 获取雷达探测到的无人机列表
export const getRadarUavList = async () => {
    try {
        // 向后端发送GET请求获取雷达目标列表
        const {data} = await axios.get('/api/v0/radar/targetList')
        // 检查返回数据的有效性：
        // 1. code不为null
        // 2. code等于0（表示成功）
        // 3. data不为null
        if (data.code !== null && data.code === 0 && data.data !== null) {
            return data
        } else if (data.code !== null) {
            // 如果code不为null但不等于0，返回null表示请求失败
            return null
        }
        return null
    } catch (e) {
        // 捕获并打印任何请求过程中的错误
        console.log(e)
    }
    return null
}

// 获取电子侦察探测到的无人机列表
// export const getElectronicUavList = async () => {
//     try {
//         // 向后端发送GET请求获取电子侦察目标列表
//         const {data} = await axios.get('/api/v0/uavs')
//         // 检查返回数据的有效性
//         if (data.code !== null && data.code === 0 && data.data !== null) {
//             return data
//         } else if (data.code !== null) {
//             return null
//         }
//         return null
//     } catch (e) {
//         console.log(e)
//     }
//     return null
// }

// 雷达引导功能
// @param targetDistance: 目标距离
// @param targetAzimuth: 目标方位角
// @param targetElevation: 目标俯仰角
export const useRGuide = async (type, targetDistance, targetAzimuth, targetElevation) => {
    try {
        // 向后端发送POST请求，传递目标的三维坐标信息
        const {data} = await axios.post('/api/v0/photoelectrics/radarAndElectric', {
            type: type,
            targetDistance: targetDistance,    // 目标距离
            targetAzimuth: targetAzimuth,     // 目标方位角
            targetElevation: targetElevation  // 目标俯仰角
        })
        // 检查返回数据的有效性
        if (data.code !== null && data.code === 0 && data.data !== null) {
            // 如果请求成功，返回数据
            return data.data
        } else if (data.code !== null) {
            // 如果请求失败，返回null
            return null
        }
    } catch (e) {
        // 捕获并打印任何请求过程中的错误
        console.log(e)
    }
    return null
}
