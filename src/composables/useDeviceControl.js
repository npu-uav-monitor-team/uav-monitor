import { ref } from 'vue'
import axios from "@/api/index.js"

const device = ref({})
const devices = ref([])
const autoDefense = ref(false)
const isInterferenceEnabled = ref(false)

export function useDeviceControl() {
    // 更新设备状态的函数
    const updateDeviceStatus = () => {
        axios.get('/api/v0/getDeviceList')
            .then(response => {
                if (response.data.code === 0 && response.data.data) {
                    devices.value = response.data.data
                    device.value = response.data.data[0]
                    autoDefense.value = device.value.attackAuto !== 1
                    isInterferenceEnabled.value = device.value.attackAuto !== 1
                } else {
                    console.error('接口返回数据格式错误或出现错误:', response.data.msg)
                }
            })
            .catch(error => {
                console.error('获取设备数据失败:', error)
            })
    }

    // 切换自动防御的函数
    const toggleAutoDefense = () => {
        axios.post('/api/v0/setAttackAuto?did=' + device.value.id + '&isCancel=' + autoDefense.value)
            .then(response => {
                if (response.data.code === 0) {
                    console.log('自动防御设置成功')
                    // autoDefense.value = !autoDefense.value
                    // isInterferenceEnabled.value = autoDefense.value
                } else {
                    console.error('接口返回数据格式错误或出现错误:', response.data.msg)
                }
            })
            .catch(error => {
                console.error('获取设备数据失败:', error)
            })
    }

    return {
        device,
        devices,
        autoDefense,
        isInterferenceEnabled,
        updateDeviceStatus,
        toggleAutoDefense
    }
}
