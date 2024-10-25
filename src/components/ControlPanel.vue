<template>
    <div class="control-panel">
        <h2>指挥控制中心</h2>
        <div class="control-section">
            <div class="other-btns">
                <h3>Control Bands</h3>
            </div>
            <div class="button-group">
                <button>2.4G</button>
                <button>5G</button>
                <button>按钮</button>
                <button>按钮</button>
            </div>
        </div>
        <div class="control-section">
            <div class="other-btns">
                <h3>CNSS Bands</h3>
            </div>
            <div class="button-group">
                <button>按钮</button>
                <button>按钮</button>
                <button>按钮</button>
                <button>按钮</button>
            </div>
        </div>
        <div>
            <div class="auto-defense">
                <h3>AutoDefense</h3>
                <label class="switch">
                    <input type="checkbox" v-model="autoDefense">
                    <span class="slider"></span>
                </label>
            </div>
            <div class="button-group">
                <button class="wide-button">干扰</button>
                <button class="wide-button">诱骗</button>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref } from "vue";
    
    const autoDefense = ref(false)
</script>

<style scoped>
    .control-panel {
        background: rgba(0, 31, 63, 0.8);
        border-radius: 10px;
        padding: 15px;
        height: 40%;
        display: flex;
        flex-direction: column;
    }
    
    .control-panel .other-btns {
        display: flex;
        justify-content: flex-start;
    }
    
    h2 {
        color: #00ffff;
        text-align: center;
        margin: 0 0 10px 0;
        font-size: 18px;
    }
    
    h3 {
        color: #ffffff;
        margin: 0 0 10px 0;
        font-size: 18px;
    }
    
    .control-section {
        margin-bottom: 10px;
    }
    
    .button-group {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 5px;
    }
    
    button {
        background: #003366;
        color: #00ffff;
        border: 1px solid #00ffff;
        padding: 5px 10px;
        cursor: pointer;
    }
    
    .auto-defense {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    
    .switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 34px;
    }
    
    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }
    
    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
        border-radius: 34px;
    }
    
    .slider:before {
        position: absolute;
        content: "";
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
    }
    
    input:checked + .slider {
        background-color: #2196F3;
    }
    
    input:checked + .slider:before {
        transform: translateX(26px);
    }
    
    .wide-button {
        grid-column: span 2;
    }
</style>
