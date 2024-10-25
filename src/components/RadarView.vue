<template>
  <div class="radar-view">
    <div class="radar-container">
      <h2>雷达监控图</h2>
      <div class="radar-circle" v-for="i in 4" :key="i"></div>
      <div class="radar-line"></div>
      <div class="radar-cross-x"></div>
      <div class="radar-cross-y"></div>
      <div
        class="radar-dot"
        v-for="aircraft in illegalAircraft"
        :key="aircraft.id"
        :style="{ top: `${50 + aircraft.y}%`, left: `${50 + aircraft.x}%` }"
        @mouseover="showDetails(aircraft)"
        @mouseout="hideDetails"
      >
        {{ aircraft.id }}
      </div>
    </div>
    <div class="illegal-aircraft-list">
      <h2>非法飞行物列表</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>类型</th>
            <th>距离 (km)</th>
            <th>方位角 (°)</th>
            <th>俯仰角 (°)</th>
            <th>速度 (km/h)</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="aircraft in illegalAircraft"
            :key="aircraft.id"
            :class="{ 'highlighted': aircraft.id === activeTarget?.id }"
            @mouseover="highlightDot(aircraft.id)"
            @mouseout="unhighlightDot"
          >
            <td>{{ aircraft.id }}</td>
            <td>{{ aircraft.type }}</td>
            <td>{{ aircraft.distance.toFixed(2) }}</td>
            <td>{{ aircraft.angle.toFixed(2) }}</td>
            <td>{{ aircraft.elevation.toFixed(2) }}</td>
            <td>{{ aircraft.speed }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="activeTarget" class="target-info" :style="infoPosition">
      <p>目标编号: {{ activeTarget.id }}</p>
      <p>类型: {{ activeTarget.type }}</p>
      <p>当前距离: {{ activeTarget.distance.toFixed(2) }} km</p>
      <p>方位角: {{ activeTarget.angle.toFixed(2) }}°</p>
      <p>俯仰角: {{ activeTarget.elevation.toFixed(2) }}°</p>
      <p>速度: {{ activeTarget.speed }} km/h</p>
    </div>
  </div>
</template>

<script setup>
    
    import { ref } from "vue";
    
    const activeTarget= ref()
        const infoPosition= ref({ top: '0px', left: '0px' })
    const illegalAircraft= ref([
        { id: 1, type: 'UAV', distance: 5.2, angle: 45, elevation: 15, speed: 80, x: 30, y: -20 },
        { id: 2, type: 'Aircraft', distance: 10.5, angle: 120, elevation: 30, speed: 200, x: -25, y: 35 },
        { id: 3, type: 'Helicopter', distance: 7.8, angle: 210, elevation: 20, speed: 150, x: -15, y: -40 },
        { id: 4, type: 'UAV', distance: 3.5, angle: 75, elevation: 10, speed: 60, x: 40, y: 10 },
        { id: 5, type: 'Aircraft', distance: 15.0, angle: 300, elevation: 35, speed: 250, x: -35, y: -15 },
    ])
    function showDetails(aircraft) {
        activeTarget.value = aircraft;
        infoPosition.value = {
            top: `calc(${50 + aircraft.y}% + 10px)`,
            left: `calc(${50 + aircraft.x}% + 10px)`
        };
    }
    function hideDetails() {
        activeTarget.value = null;
    }
    function highlightDot(id) {
        const dot = document.querySelector(`.radar-dot:nth-child(${id + 4})`);
        if (dot) {
            dot.classList.add('highlighted');
        }
    }
    function unhighlightDot() {
        const dots = document.querySelectorAll('.radar-dot');
        dots.forEach(dot => dot.classList.remove('highlighted'));
    }
</script>

<style scoped>
.radar-view {
  display: flex;
  flex-direction: column;
  height: 100%; /* 改为 100% 而不是 100vh */
  background-color: #001f3f;
  color: #00ffff;
  padding: 10px; /* 添加一些内边距 */
  box-sizing: border-box; /* 确保内边距不会增加总高度 */
}

.radar-container {
  flex: 2; /* 保持雷达图的比例为 2/3 */
  position: relative;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  max-height: 60vh; /* 限制最大高度 */
  margin: auto;
  background: rgba(0, 20, 40, 0.9);
  border-radius: 50%;
  box-shadow: inset 0 0 20px rgba(0, 255, 255, 0.1);
}

.illegal-aircraft-list {
  flex: 1; /* 保持列表的比例为 1/3 */
  padding: 10px;
  overflow-y: auto;
  max-height: 30vh; /* 限制最大高度 */
}

h2 {
  text-align: center;
  margin-bottom: 10px;
  color: #ffffff;
  font-size: 18px; /* 稍微减小字体大小 */
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px; /* 减小表格字体大小 */
}

th, td {
  padding: 5px; /* 减小单元格内边距 */
  text-align: left;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
}

th {
  background-color: rgba(0, 51, 102, 0.8);
  color: #00ffff;
}

tbody tr:nth-child(even) {
  background-color: rgba(0, 31, 63, 0.6);
}

/* 美化滚动条 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 31, 63, 0.8);
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.7);
}

/* 保持其他样式不变 */
.radar-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid rgba(0, 255, 0, 0.5);
  border-radius: 50%;
}

.radar-circle:nth-child(1) { width: 20%; height: 20%; }
.radar-circle:nth-child(2) { width: 40%; height: 40%; }
.radar-circle:nth-child(3) { width: 60%; height: 60%; }
.radar-circle:nth-child(4) { width: 80%; height: 80%; }

.radar-line {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50%; /* 将宽度恢复到 50%，使线延伸到雷达圆的边缘 */
  height: 2px;
  background-color: rgba(0, 255, 0, 0.7);
  transform-origin: left center;
  animation: radar-sweep 4s infinite linear;
  box-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
}

.radar-cross-x, .radar-cross-y {
  position: absolute;
  background-color: rgba(0, 255, 0, 0.5);
}

.radar-cross-x {
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
}

.radar-cross-y {
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
}

.radar-dot {
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: red;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
  box-shadow: 0 0 5px red;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 10px;
  font-weight: bold;
}

.radar-dot:hover, .radar-dot.highlighted {
  transform: scale(1.5);
  background-color: #ff6600;
  z-index: 10;
}

.illegal-aircraft-list tr.highlighted {
  background-color: rgba(255, 102, 0, 0.3);
}

.target-info {
  position: absolute;
  background: rgba(0, 31, 63, 0.9);
  border: 1px solid #00ffff;
  border-radius: 5px;
  padding: 5px;
  color: #00ffff;
  font-size: 12px; /* 减小目标信息的字体大小 */
  z-index: 10;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.target-info p {
  margin: 5px 0;
}

@keyframes radar-sweep {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 确保内容不会溢出视口 */
body, html {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}
</style>
