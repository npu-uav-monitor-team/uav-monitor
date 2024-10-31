<template>
    <div class="monitoring-center">
        <div class="title-container">
            <h1 class="main-title">设备监控中心</h1>
            
            <button @click="goToControlCenter()" class="main-button">
                指挥控制中心
            </button>
        </div>
        <div class="content">
            <div class="left-screen">
                <MonitorScreenComponent
                    id="A"
                    :isLarge="true"
                    @update-content="handleContentUpdate"
                />
            </div>
            <div class="right-screens">
                <MonitorScreenComponent
                    class="screen-top-right"
                    id="B"
                    :isLarge="false"
                    @update-content="handleContentUpdate"
                />
                <MonitorScreenComponent
                    class="screen-bottom-right"
                    id="C"
                    :isLarge="false"
                    @update-content="handleContentUpdate"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
    import MonitorScreenComponent from "@/components/MonitorScreenComponent.vue";
    import { ref } from "vue";
    import { useRouter } from "vue-router";
    
    const router = useRouter()
    
    const screenContents= ref({
        A: null,
        B: null,
        C: null
    })
    
    function handleContentUpdate({ id, content }) {
        screenContents.value[id] = content
    }
    
    const goToControlCenter = async () => {
        await router.push("/control-center");
    }
</script>

<style scoped>
    .monitoring-center {
        display: flex;
        flex-direction: column;
        height: 90vh; /* 进一步缩小高度 */
        background-color: #001f3f;
        color: #00ffff;
        padding: 20px;
        box-sizing: border-box;
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
    
    .content {
        display: flex;
        flex: 1;
        margin-top: 20px; /* 添加一些顶部边距,与新标题样式搭配 */
    }
    
    .left-screen {
        flex: 2;
        margin-right: 20px;
    }
    
    .right-screens {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    
    .screen-top-right {
        height: 50%;
        width: 100%;
    }
    
    .screen-bottom-right {
        height: 50%;
        width: 100%;
    }
    
    /* 如果 MonitoringCenter.vue 中有按钮样式，也应用相同的样式 */
    button {
        background-color: #003366;
        color: #00ffff;
        border: 1px solid #00ffff;
        border-radius: 5px;
        padding: 5px 10px;
        cursor: pointer;
        transition: background-color 0.3s;
    }
    
    button:hover {
        background-color: #004080;
    }
</style>
