export class deceptionService {
  static async updateCommand(updateCommandRequestDto) {
    return fetch('http://localhost:8848/UAV/UpdateCommand', {
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
    return fetch('http://localhost:8848/UAV/updateConnectSetting', {
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
}
