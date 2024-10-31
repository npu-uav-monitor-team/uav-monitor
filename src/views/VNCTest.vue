// NoVNCViewer.vue
<template>
    <div ref="vncContainer" style="width: 100%; height: 100%;"></div>
</template>

<script setup>
    import { onMounted, ref } from 'vue';
    import RFB from '@novnc/novnc'
    
    const vncContainer = ref(null);
    let rfb;
    
    onMounted(() => {
        // VNC服务器的URL，格式是ws或wss协议
        const url = 'ws://127.0.0.1:6080';
        
        // 初始化RFB对象
        rfb = new RFB(vncContainer.value,
            url, {
                credentials: {
                    password: '123456'
                },
            });
        // 设置一些选项，例如屏幕比例
        rfb.scaleViewport = true;
        rfb.resizeSession = true;
        
        // 可以注册事件处理
        rfb.addEventListener('connect', () => console.log('Connected to VNC server'));
        rfb.addEventListener('disconnect', () => console.log('Disconnected from VNC server'));
        rfb.addEventListener('credentialsrequired', () => console.log('Credentials are required'));
    });
</script>

<style scoped>
    /* 你可以根据需要调整样式 */
</style>
