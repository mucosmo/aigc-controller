
import { Provide, Inject } from '@midwayjs/decorator';

import { Context, } from '@/interface';

import { TimelineDTO } from '../../../dto/aigc/ppt';
import { LocalFileDTO } from '@/app/dto/stream/ffmpeg';

import fs from 'fs';
import path from 'path';


@Provide()
export class AigcPptService {
    @Inject()
    ctx: Context;

    ppT2Ffmpeg(params: TimelineDTO) {
        const template = JSON.parse(fs.readFileSync(path.join(__dirname, './ppt-template.json'), 'utf-8'));
        console.log(template.sink);

        // subtitles
        const templateSubtitles = this.__subtitleTracksToTemplateSubtitles(params.SubtitleTracks);
        console.log(templateSubtitles);

        // slides
        const templateVideos = this.__videosTracksToTemplateVideos(params.VideoTracks);
        template.render.template.videos = templateVideos[0];
        template.render.template.videos.push(...templateSubtitles)

        return template as unknown as LocalFileDTO;
    }


    // {
    //     "Type": "Text",
    //     "Content": "默认视频标题",
    //     "TimelineIn": 3,
    //     "TimelineOut": 5.407,
    //     "X": 0,
    //     "Y": 156,
    //     "FontColor": "#000000",
    //     "Font": "微软雅黑",
    //     "FontSize": 36,
    //     "FontFace": {
    //         "Bold": true,
    //         "Italic": false,
    //         "Underline": fals
    //     },
    //     "Alignment": "TopCenter"
    // }

    private __videosTracksToTemplateVideos(tracks) {
        const videos = []
        tracks.forEach((track, trackIdx) => {
            const tracks = []
            const clips = track.VideoTrackClips;
            let currentTime = 0
            clips.forEach((element, index) => {
                let video;
                currentTime += element.Duration;
                if (index === clips.length - 1) {
                    video = {
                        "id": `region_${index}`,
                        "url": element.MediaURL,
                        "type": "video",
                        "srcId": "EE7776FEC0C7EE6F80B5DDA904BD1637",
                        "options": [
                            "-loop 1",
                            `-t ${element.Duration}`
                        ],
                        "filters": [
                            {
                                "seq": 1,
                                "name": "scale",
                                "options": {
                                    "w": "1280",
                                    "h": "720"
                                }
                            },
                            {
                                "seq": 2,
                                "name": "setsar",
                                "options": {
                                    "sar": "1:1"
                                }
                            },
                            {
                                "seq": 3,
                                "name": "fps",
                                "options": {
                                    "fps": "30"
                                }
                            },
                            {
                                "seq": 4,
                                "name": "settb",
                                "options": {
                                    "expr": "1/20"
                                }
                            }
                        ]
                    }
                } else if (index === 0) {
                    video = {
                        "id": `region_${index}`,
                        "type": "video",
                        "url": element.MediaURL,
                        "srcId": "5B88FB00A7B75BF6A31BBC9A1DA269D5",
                        "options": [
                            "-loop 1"
                        ],
                        "filters": [
                            {
                                "seq": 1,
                                "name": "scale",
                                "options": {
                                    "w": "1280",
                                    "h": "720"
                                }
                            },
                            {
                                "seq": 2,
                                "name": "setsar",
                                "options": {
                                    "sar": "1:1"
                                }
                            },
                            {
                                "seq": 3,
                                "name": "fps",
                                "options": {
                                    "fps": "30"
                                }
                            },
                            {
                                "seq": 4,
                                "name": "settb",
                                "options": {
                                    "expr": "1/20"
                                }
                            }
                        ],
                        "area": {
                            "x": "0",
                            "y": "0"
                        },
                        "transitions": [
                            {
                                "name": "xfade",
                                "options": {
                                    "transition": "dissolve",
                                    "duration": "1",
                                    "offset": currentTime
                                },
                                "to": `region_${index + 1}`
                            }
                        ]
                    }
                } else {
                    video = {
                        "id": `region_${index}`,
                        "type": "video",
                        "url": element.MediaURL,
                        "srcId": "5B88FB00A7B75BF6A31BBC9A1DA269D5",
                        "options": [
                            "-loop 1"
                        ],
                        "filters": [
                            {
                                "seq": 1,
                                "name": "scale",
                                "options": {
                                    "w": "1280",
                                    "h": "720"
                                }
                            },
                            {
                                "seq": 2,
                                "name": "setsar",
                                "options": {
                                    "sar": "1:1"
                                }
                            },
                            {
                                "seq": 3,
                                "name": "fps",
                                "options": {
                                    "fps": "30"
                                }
                            },
                            {
                                "seq": 4,
                                "name": "settb",
                                "options": {
                                    "expr": "1/20"
                                }
                            }
                        ],
                        "transitions": [
                            {
                                "name": "xfade",
                                "options": {
                                    "transition": "dissolve",
                                    "duration": "1",
                                    "offset": currentTime
                                },
                                "to": `region_${index + 1}`
                            }
                        ]
                    }
                }
                tracks.push(video);
            });
            if (tracks.length) {
                videos.push(tracks);
            }
        })
        return videos;
    }

    private __subtitleTracksToTemplateSubtitles(tracks) {
        const subtitlFiles = [];
        const time = new Date().getTime();
        tracks.forEach((track, trackIdx) => {
            const clips = track.SubtitleTrackClips;
            let subStr = '';
            clips.forEach((ele, idx) => {
                // 00:00:01,090 --> 00:00:04,880
                const timeClip = secondsToTimeline(ele.TimelineIn) + ' --> ' + secondsToTimeline(ele.TimelineOut);
                subStr += `${idx + 1}\n${timeClip}\n${ele.Content}\n\n`;
            });
            const file = { data: subStr, path: `/opt/application/tx-rtcStream/files/synthesis/picc/${time}-${trackIdx + 1}.srt`, style: clips[0] };
            subtitlFiles.push(file);
        })

        // 字幕写入文件
        subtitlFiles.forEach(subtitle => fs.writeFileSync(subtitle.path, subtitle.data, 'utf-8'));

        const templateSubtitles = subtitlFiles.map((subtitle, idx) => {
            const style = subtitle.style;
            const alignments = {
                TopCenter: 6,
                BottomCenter:2
            }
            const tmp = {
                "id": `region_${1000 + idx}`,
                "type": "subtitles",
                "name": "subtitles",
                "options": {
                    "filename": subtitle.path,
                    "force_style": `'Fontsize=${style.FontSize},PrimaryColour=&H${style.FontColor.replace('#','')},Alignment=${alignments[style.Alignment]},MarginV=10'`
                }
            }
            return tmp;
        })

        return templateSubtitles;
    }



}

function secondsToTimeline(time: number) {
    const hour = Math.floor(time / 3600);
    const minute = Math.floor((time - hour * 3600) / 60);
    const second = Math.floor(time - hour * 3600 - minute * 60);
    const microSeconds = Math.floor((time - Math.floor(time)) * 1000);

    return `${hour}:${minute}:${second},${microSeconds}`;

}