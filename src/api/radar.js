import axios from './index.js'

export const getRadarUavList = async () => {
    try {
        const {data} = await axios.get('/api/v0/radar/targetList')
        if (data.code !== null && data.code === 0 && data.data !== null) {
            return data
        } else if (data.code !== null) {
            return null
        }
        return null
    } catch (e) {
        console.log(e)
    }
    return null
}

export const getElectronicUavList = async () => {
    try {
        const {data} = await axios.get('/api/v0/uavs')
        if (data.code !== null && data.code === 0 && data.data !== null) {
            return data
        } else if (data.code !== null) {
            return null
        }
        return null
    } catch (e) {
        console.log(e)
    }
    return null
}

// 雷达引导
export const useRadarGuide = async (targetDistance, targetAzimuth, targetElevation) => {
    try {
        const {data} = await axios.post('/api/v0/photoelectrics/radarAndElectric', {
            targetDistance: targetDistance,
            targetAzimuth: targetAzimuth,
            targetElevation: targetElevation
        })
        if (data.code !== null && data.code === 0 && data.data !== null) {
            return data.data
        } else if (data.code !== null) {
            return null
        }
    } catch (e) {
        console.log(e)
    }
    return null
}
