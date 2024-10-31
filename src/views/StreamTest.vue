<template>
    <div class="ev-player">
        <video :id="`video-1`" autoplay width="100%" height="98%"></video>
    </div>
</template>

<script setup>
    import { nextTick, onMounted } from 'vue'
    
    let webRtcServer = null
    onMounted(async () => {
        const rtspStr = 'rtsp://localhost/live'
        if (rtspStr) {
            await nextTick() // 待dom加载完毕
            let videoDocument = document.getElementById('video-1')
            // eslint-disable-next-line no-undef
            webRtcServer = new WebRtcStreamer(videoDocument, `http://127.0.0.1:9998`)
            webRtcServer.connect(rtspStr, null, `rtptransport=tcp&timeout=60`)
        }
    })
</script>

<style scoped>
    .ev-player video {
        width: 100%;
        height: calc(100% - 5px);
    }
</style>
