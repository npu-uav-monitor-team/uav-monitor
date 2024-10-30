import axios from 'axios'

// 创建一个axios实例
const _axios = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_API
})

export default _axios
