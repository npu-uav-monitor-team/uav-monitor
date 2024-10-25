import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/style/main.css'

import '@fortawesome/fontawesome-free/css/all.css'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete Icon.Default.prototype._getIconUrl
const iconOptions = {
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
};
Icon.Default.mergeOptions(iconOptions)

createApp(App).use(router).mount('#app')
