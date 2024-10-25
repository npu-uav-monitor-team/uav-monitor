标准所有飞行物数据

111Test

```json
[
  {
    "id": 1,
    "type": "uav",
    "name": "UAV-001",
    "speed": 120,
    "altitude": 500,
    "distance": 2.5,
    "updateTime": "2023/4/10 10:30:00",
    "threadLevel": "Low",
    "lat": 34.2286,
    "lng": 108.9291,
    "color": "red",
    "pitchAngle": "15.00",
    "azimuth": "120.00",
    "path": [
      [
        34.2286,
        108.9291
      ],
      [
        34.2286184230984,
        108.92886107671048
      ]
    ]
  }
]
```

参数说明

| 参数  | 参数说明                      | 参数类型/备选值                    |
| ----- |---------------------------|-----------------------------|
| id    | 飞行物id                     | number                      |
| type  | 飞行物类型                     | UAV                         |
| name  | 飞行物名称                     | string                      |
| speed | 飞行物速度                     | number                      |
| altitude | 飞行物高度                     | number                      |
| distance | 飞行物距离                     | number                      |
| updateTime | 飞行物更新时间                   | string  yyyy/MM/dd HH:mm:ss |
| threadLevel | 飞行物威胁等级                   | Low/Middle/High             |
| lat   | 飞行物纬度                     | number                      |
| lng   | 飞行物经度                     | number                      |
| color | 飞行物颜色 | string 尽量不同的颜色 颜色还需要用于标识轨迹  |
| pitchAngle | 飞行物俯仰角                   | string                      |
| azimuth | 飞行物方位角                   | string                      |
| path  | 飞行物轨迹                     | array[array] 数组数组，子数组中第一个元素表示lat，第二个元素表示lng |

