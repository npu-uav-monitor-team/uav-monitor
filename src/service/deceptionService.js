export class deceptionService {
  static async updateCommand(updateCommandRequestDto) {
    return fetch(`http://${import.meta.env.VITE_DECEPTION_HOST}:8848/UAV/UpdateCommand`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateCommandRequestDto),
    })
      .then(response => response.json())
      .then((data) => {
        if (data.isSuccess) {
          // 自行处理
        } else {
          // 自行处理
        }
        return data
      })
      .catch((error) => {
        console.error('Error:', error)
        return null
      })
  }

  static async updateConnectSetting(udpSettingsDto){
    return fetch(`http://${import.meta.env.VITE_DECEPTION_HOST}:8848/UAV/updateConnectSetting`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(udpSettingsDto),
    })
      .then(response => response.json())
      .then((data) => {
        if (data.isSuccess) {
          // 自行处理
        }
        else {
          // 自行处理
        }
        console.log(data)
        return { isSuccess: true, data: data } // Ensure this value is returned to the caller
      })
      .catch((error) => {
          // 自行处理
        return { isSuccess: false, data: error.message } // Return something even in case of error
      })
  }

  static async sendCommand(cmdWord, data) {
    let updateCommandRequestDto
    if (cmdWord === 4352) {
      // todu: 注意更改position绑定的数据
      updateCommandRequestDto = {
          CmdWord: cmdWord,
          CommandDto: {
              Capture: {
                  Position: {
                    Latitude: data.latitude,
                    Longitude: data.longitude,
                    Altitude: data.altitude
                  },
                  CaptureAmbiguity: data.simulationLevel,
                  Operate: data.captureType
              }
          }
      }
    } else if (cmdWord === 4097) {
        updateCommandRequestDto = {
            cmdWord: 4097,
            commandDto: {
                driveAngle: data
            }
        }
    } else if (cmdWord === 8192) {
        // 目标位置引导，在捕获之前需要发送一条这个
        updateCommandRequestDto = {
            CmdWord: cmdWord,
            CommandDto: {
                bootstrapPosition: {
                    targetType: 0,
                    Position: {
                      Latitude: data.latitude,
                      Longitude: data.longitude,
                      Altitude: data.altitude
                    },
                }
            }
        }
    } else if (cmdWord === 4100) {
        // 防御
        updateCommandRequestDto = {
            CmdWord: cmdWord,
            CommandDto: {
                defense: true
            }
        }
    } else if (cmdWord === 4098) {
        // 干扰
        updateCommandRequestDto = {
            CmdWord: cmdWord,
            CommandDto: {
                IsInterferenceEmitted: true
            }
        }
    } else if (cmdWord === 4099) {
        // 禁飞
        updateCommandRequestDto = {
            CmdWord: cmdWord,
            CommandDto: {
                nofly: {
                    state: true,
                    Position: {
                      Latitude: 0,
                      Longitude: 0,
                      Altitude: 0
                    },
                }
            }
        }
    } else if (cmdWord === 4101) {
        // 手动功率设置
        updateCommandRequestDto = {
            CmdWord: cmdWord,
            CommandDto: {
                transmitPower: {
                    state: 1,
                    power: data,
                    sinr: 10,
                }
            }
        }
    }
    const res = await deceptionService.updateCommand(updateCommandRequestDto)
    if (res && res.isSuccess) {
      return true;
    }
    return false;
  }

  static async stopLaunch_1() {
    let updateCommandRequestDto = {
        cmdWord: 4096,
        commandDto: {
            category: 0
        }
    }
    const res = await deceptionService.updateCommand(updateCommandRequestDto)
    if (res && res.isSuccess) {
      return true;
    }
    return false;
  }
}
