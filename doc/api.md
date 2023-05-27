# PPT 生成视频接口文档

## 总体说明

请求：所有接口请求的形式是 HTTP POST 请求，请求体为 JSON 格式

应答：HTTP STATUS CODE = 200，应答包格式为JSON：

```json
{"code": 200, message:"请求成功", "data": {}}，
```

data具体内容在接口中详细描述。

### 上传文件

**请求地址：**
 `https://chaosyhy.com:60126/upload/:tenant/:user`

**params 参数含义如下：**
| 字段 | 类型 |  必须  | 说明 |
| :------:    | :----:  | :----:  | :------:    |
| tenant |   String   | 是 | 用户所属租户，比如 picc |
| name | String | 是 | 用户名 |

**body 参数含义如下：**
| 字段 | 类型 |  必须  | 说明 |
| :------:    | :----:  | :----:  | :------:    |
| file |   form-data   | 是 | 要上传的文件数组 |

**返回结构：**

```json
{
    "code": 200,
    "message": "请求成功",
    "data": {
        "1684923588094.mp4": { // key 为上传时的文件名
            "path": "/opt/application/data/aigc/picc/user01/230527_080902_9d04c03f59.mp4", // 保存地址需回传
            "url": "https://chaosyhy.com:60125/data/aigc/picc/user01/230527_080902_9d04c03f59.mp4" // url 外部显示用
        },
        "FpPGKxnX0AAZ3bw.jpeg": {
            "path": "/opt/application/data/aigc/picc/user01/230527_080902_b56502025b.jpeg",
            "url": "https://chaosyhy.com:60125/data/aigc/picc/user01/230527_080902_b56502025b.jpeg"
        }
    }
}
```

### 请求合成视频

**请求地址**：

 `https://chaosyhy.com:60124/aigc/ppt2video`

**请求参数定义：**

| 参数名称 | 类型   |  描述  |
| :------:    | :----:  | :----:  |
| user |   Object   |   公司名称   |
|user.tenant   |   String   |   用户所属租乎   |
| user.name |   String   | 用户名 |
| asset |   Object   | 用户合成视频的数据 |
| asset. VideoTracks |   Array   |  视频轨道 |
| asset. AudioTracks | Array | 音频轨道 |
| asset. SubtitleTracks | Array | 字幕轨道 |

**请求参数示例**：

```json
{
    "user": {
        "tenant": "picc",
        "name": "user01"
    },
    "data": {
        "VideoTracks": [
            {
                "VideoTrackClips": [
                    {
                        "Type": "Image",
                        "MediaURL": "/opt/application/data/aigc/picc/ppt-1.jpg", // 资源 url
                        "Path": "/opt/application/data/aigc/picc/user01/230526_131452_a7d57b343c.jpg", // 资源内部路径
                        "Effects": {
                            "Transition": {
                                "Name": "dissolve",
                                "Duration": 1
                            },
                            "Filters": []
                        },
                        "Duration": 3,
                        "X": 0,
                        "Y": 0,
                        "Width": 720,
                        "Height": 1280
                    },
                    {
                        "Type": "Image",
                        "MediaURL": "/opt/application/data/aigc/picc/ppt-2.jpg",
                        "Path": "/opt/application/data/aigc/picc/user01/230526_131452_08761289d9.jpg",
                        "MediaId": "5d6d4840512b71ed8b1c909598416301",
                        "Effects": {
                            "Transition": {
                                "Name": "wiperight",
                                "Duration": 1
                            },
                            "Filters": []
                        },
                        "Duration": 2.408,
                        "TimelineIn": 3,
                        "TimelineOut": 5.407
                    }
                ]
            },
            {
                "VideoTrackClips": [
                    {
                        "Type": "Video",
                        "MediaURL": "https://digitalhuman-resourse.oss-cn-shanghai.aliyuncs.com/dr-test/1684820145475_afb6e4d8-a30b-43f8-a69e-8c0cc2acc7df.webm",
                        "MediaId": "28b84430ee8171edb858e7e7e4686302",
                        "Effects": [],
                        "TimelineIn": 0,
                        "TimelineOut": 2.25,
                        "In": 0,
                        "Out": 0.05,
                        "Duration": 3,
                        "X": 140,
                        "Y": 2,
                        "Width": 412,
                        "Height": 748
                    },
                    {
                        "Type": "Video",
                        "MediaURL": "/opt/application/data/aigc/picc/dh-26s.webm",
                        "Path": "/opt/application/data/aigc/picc/user01/230526_131452_ca1a2fae00.webm",
                        "MediaId": "28b84430ee8171edb858e7e7e4686302",
                        "Effects": [],
                        "TimelineIn": 5,
                        "TimelineOut": 10,
                        "Duration": 2.408,
                        "X": 14,
                        "Y": 256,
                        "Width": 720,
                        "Height": -1
                    },
                    {
                        "Type": "Video",
                        "MediaURL": "/opt/application/data/aigc/picc/dh-26s.webm",
                        "Path": "/opt/application/data/aigc/picc/user01/230526_131452_ca1a2fae00.webm",
                        "MediaId": "28b84430ee8171edb858e7e7e4686302",
                        "Effects": [],
                        "TimelineIn": 10,
                        "TimelineOut": 15,
                        "Duration": 2.408,
                        "X": 560,
                        "Y": 0,
                        "Width": 720,
                        "Height": -1
                    },
                    {
                        "Type": "Video",
                        "MediaURL": "https://digitalhuman-resourse.oss-cn-shanghai.aliyuncs.com/dr-test/1684820145475_afb6e4d8-a30b-43f8-a69e-8c0cc2acc7df.webm",
                        "MediaId": "28b84430ee8171edb858e7e7e4686302",
                        "Effects": [],
                        "TimelineIn": 15,
                        "TimelineOut": 20,
                        "In": 0,
                        "Out": 0.05,
                        "Duration": 3,
                        "X": 140,
                        "Y": 200,
                        "Width": 720,
                        "Height": -1
                    }
                ]
            }
        ],
        "AudioTracks": [
            {
                "AudioTrackClips": [
                    {
                        "MediaId": "22d778f0099f71ed8195909598416303",
                        "MediaURL": "https://digitalhuman-resourse.oss-cn-shanghai.aliyuncs.com/dr-test/1684820145475_afb6e4d8-a30b-43f8-a69e-8c0cc2acc7df.webm",
                        "TimelineIn": 0,
                        "TimelineOut": 2.25
                    },
                    {
                        "MediaId": "22d778f0099f71ed8195909598416303",
                        "MediaURL": "/opt/application/data/aigc/picc/dh-26s.webm",
                        "Path": "/opt/application/data/aigc/picc/user01/230526_131452_ca1a2fae00.webm",
                        "TimelineIn": 5,
                        "TimelineOut": 20
                    }
                ]
            }
        ],
        "SubtitleTracks": [
            {
                "SubtitleTrackClips": [
                    {
                        "Type": "Text",
                        "Content": "您说的我不太明白",
                        "TimelineIn": 0,
                        "TimelineOut": 2.25,
                        "X": 0,
                        "Y": 156,
                        "FontColor": "#0230bf",
                        "Font": "微软雅黑",
                        "FontSize": 18,
                        "FontFace": {
                            "Bold": true,
                            "Italic": false,
                            "Underline": false
                        },
                        "Alignment": "BottomCenter"
                    }                     
                ]
            },
            {
                "SubtitleTrackClips": [
                    {
                        "Type": "Text",
                        "Content": "这里是节点 1 标题，",
                        "TimelineIn": 3,
                        "TimelineOut": 5.408,
                        "X": 0,
                        "Y": 1200,
                        "FontColor": "#ed6548",
                        "Font": "微软雅黑",
                        "FontSize": 18,
                        "FontFace": {
                            "Bold": true,
                            "Italic": false,
                            "Underline": false
                        },
                        "Alignment": "TopCenter"
                    } 
                ]
            }
        ]
    }
}
```

**返回结构：**

```json
{
    "code": 200,
    "message": "请求成功",
    "data": {
        "sink": {
            "roomId": "picc",
            "userId": "user01",
            "path": "/opt/application/data/aigc/picc/user01/20230527_075432.mp4",
            "url": "https://chaosyhy.com:60125/data/aigc/picc/user01/20230527_075432.mp4"
        }
    }
}
```

### 查询合成进度

**请求地址：**
 `https://chaosyhy.com:60124/aigc/ppt2video/progress`

**body参数定义：**
| 参数名称 | 类型   |  描述  |
| :------:    | :----:  | :----:  |
| user |   Object   |   公司名称   |
|user.tenant   |   String   |   用户所属租乎   |
| user.name |   String   | 用户名 |

**返回结构：**

```json
{
    "code": 200,
    "message": "请求成功",
    "data": {
        "progress": 0.342 // 3 位小数，需自行转化为进度
    }
}
```
