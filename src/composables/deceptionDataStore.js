import { reactive } from 'vue';

const state = reactive({
  capture: {
    latitude: 0,
    longitude: 0,
    altitude: 0,
    simulationLevel: 100,
    captureType: true
  },
  driveAngle: 0,
  bootstrapPosition: {
    latitude: 0,
    longitude: 0,
    altitude: 0,
  },
  bootstrapFlag: false
});

const actions = {
  setCapture(data) {
    state.capture.latitude = data.latitude;
    state.capture.longitude = data.longitude;
    state.capture.altitude = data.altitude;
    state.capture.simulationLevel = data.simulationLevel;
    state.capture.captureType = data.captureType
  },
  setDriveAngle(data) {
    state.driveAngle = data;
  },
  setBootstrapPosition(data) {
    state.bootstrapPosition = data;
  },
  setBootstrapFlag(data){
    state.bootstrapFlag = data
  }
};

const getCapture = () => state.capture;
const getDriveAngle = () => state.driveAngle;
const getBootstrapPosition = () => state.bootstrapPosition;
const getBootstrapFlag = () => state.bootstrapFlag;

export { state, actions, getCapture, getDriveAngle, getBootstrapPosition, getBootstrapFlag };