
import { Provide, Inject, App } from '@midwayjs/decorator';

import { Context, Application } from '@/interface';

import { TimelineDataDTO, TimelineDTO } from '../../../dto/aigc/ppt';
import { LocalFileDTO } from '@/app/dto/stream/ffmpeg';

import fs from 'fs';
import path from 'path';
import moment from 'moment';


@Provide()
export class AigcPptService {
    @Inject()
    ctx: Context;

    @App()
    private _app!: Application;

    pptToFfmpeg(params: TimelineDTO) {
        const template = JSON.parse(fs.readFileSync(path.join(__dirname, './ppt-template.json'), 'utf-8'));
        const dir = `/opt/application/data/aigc/${params.user.tenant}/${params.user.name}`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }


        const filePath = path.join(dir, `${moment().format('YYYYMMDD_HHmmss')}.mp4`);
        template.sink = {
            roomId: params.user.tenant,
            userId: params.user.name,
            path: filePath,
            url: filePath.replace('/opt/application', 'https://chaosyhy.com:60125')
        }

        // subtitles
        const templateSubtitles = this.__subtitleTracksToTemplateSubtitles(params.asset.SubtitleTracks, dir);

        // slides
        const templateVideos = this.__videosTracksToTemplateVideos(params.asset.VideoTracks);
        template.render.template.videos = templateVideos[0];

        // console.log(templateVideos[1])
        template.render.template.videos.push(...templateVideos[1]);

        template.render.template.videos.push(...templateSubtitles);

        const templateAudios = this._audioTracksToTemplateAudios(params.asset.AudioTracks);
        template.render.template.audios = templateAudios[0];

        return template as unknown as LocalFileDTO;
    }

    async ffmpegProgress(user) {
        const key = `ppt2videoProgress:${user.tenant}_${user.name}`;
        let info = JSON.parse(await this._app.redis.get(key));
        let occupied = info.occupied;
        let progress = info.progress;
        if (progress > 0.98) {
            progress = 1;
        }
        return { progress, occupied };
    }

    private __videosTracksToTemplateVideos(tracks) {
        const videos = []
        tracks.forEach((track, trackIdx) => {
            const tracks = [];
            if (trackIdx === 0) {
                const clips = track.VideoTrackClips;
                let currentTime = 0
                clips.forEach((element, index) => {
                    currentTime += element.Duration;
                    let video = {
                        "id": `region_${trackIdx}_${index}`,
                        "type": "video",
                        "url": element.Path ?? element.MediaURL,
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
                            "y": "0",
                            enable: this.__overlayEnable(element)
                        },
                        "transitions": [
                            {
                                "name": "xfade",
                                "options": {
                                    "transition": element.Effects.Transition?.Name ?? "wipeleft",
                                    "duration": element.Effects.Transition?.Duration ?? 1,
                                    "offset": currentTime
                                },
                                "to": `region_${trackIdx}_${index + 1}`
                            }
                        ]
                    }
                    if (index === clips.length - 1) {
                        video.options.push(`-t ${element.Duration}`);
                        video['transitions'] = undefined;
                        video['area'] = undefined;
                    } else if (index === 0) {
                        video = video
                    } else {
                        video['area'] = undefined;
                    }
                    tracks.push(video);
                });
            } else { // digital human
                const clips = track.VideoTrackClips;
                clips.forEach((element, index) => {
                    const video = {
                        "id": `region_${trackIdx}_${index + 1}`,
                        "type": "video",
                        "srcId": "B5B3823C1EB318E9CF526F06EA8F93DB",
                        "url": element.Path ?? element.MediaURL,
                        "options": [
                            `-t ${element.TimelineOut - element.TimelineIn}`
                        ],
                        "filters": [
                            {
                                "seq": 0,
                                "name": "setpts",
                                "options": {
                                    "expr": `PTS-STARTPTS+${element.TimelineIn}/TB`
                                }
                            },
                            {
                                "seq": 1,
                                "name": "scale",
                                "options": {
                                    "w": element.Width,
                                    "h": element.Height
                                }
                            },
                            {
                                "seq": 3,
                                "name": "chromakey",
                                "options": {
                                    "color": "0x00ff00",
                                    "similarity": 0.3,
                                    "blend": 0.05
                                }
                            }
                            // ,
                            // {
                            //     "seq": 5,
                            //     "name": "fade",
                            //     "options": {
                            //         "t": "out",
                            //         "st": `${element.TimelineOut - 0.5}`,
                            //         "d": "0.5",
                            //     }
                            // }
                        ],
                        "area": {
                            "x": element.X,
                            "y": element.Y,
                            enable: this.__overlayEnable(element)

                        }
                    }
                    tracks.push(video)
                })
            }

            if (tracks.length) {
                videos.push(tracks);
            }
        })
        return videos;
    }

    private __subtitleTracksToTemplateSubtitles(tracks, dir) {
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
            const file = { data: subStr, path: path.join(dir, `${time}-${trackIdx + 1}.srt`), style: clips[0] };
            subtitlFiles.push(file);
        })

        // 字幕写入文件
        subtitlFiles.forEach(subtitle => fs.writeFileSync(subtitle.path, subtitle.data, 'utf-8'));

        const templateSubtitles = subtitlFiles.map((subtitle, idx) => {
            const style = subtitle.style;
            const alignments = {
                TopCenter: 6,
                BottomCenter: 2
            }
            const tmp = {
                "id": `region_subtitle_${idx + 1}`,
                "type": "subtitles",
                "name": "subtitles",
                "options": {
                    "filename": subtitle.path,
                    "force_style": `'Fontsize=${style.FontSize},PrimaryColour=&H${style.FontColor.replace('#', '')},Alignment=${alignments[style.Alignment]},MarginV=10'`
                }
            }
            return tmp;
        })

        return templateSubtitles;
    }

    private _audioTracksToTemplateAudios(tracks) {
        const audios = [];
        tracks.forEach((track, trackIdx) => {
            const clips = track.AudioTrackClips;
            let audioOneTrack = [];
            clips.forEach((element, index) => {
                const audio = {
                    "id": `region_${trackIdx}_${index + 1}`,
                    "type": "audio",
                    "url": element.Path ?? element.MediaURL,
                    "srcId": "B8B0892BB14FBB07CFA60E38B19242B2",
                    "options": [
                        `-t ${element.TimelineOut - element.TimelineIn}`
                    ],
                    "filters": [
                        {
                            "seq": 0,
                            "name": "adelay",
                            "options": {
                                "delays": `${element.TimelineIn * 1000}|${element.TimelineIn * 1000} `
                            }
                        },
                        {
                            "seq": 1,
                            "name": "afade",
                            "options": {
                                "t": "out",
                                "st": `${element.TimelineOut - 0.5}`,
                                "d": "0.5"
                            }
                        }
                    ]
                }
                audioOneTrack.push(audio)
            });
            if (audioOneTrack.length) {
                audios.push(audioOneTrack);
            }
        })
        return audios;
    }


    /**
     * 从 资源中 计算合成后视频时长
     * @param asset 
     */
    calDuration(asset: TimelineDataDTO) {

        let duration = 0;

        const videoTracks = asset.VideoTracks as any[];
        const audioTracks = asset.AudioTracks as any[];
        // const subtitleTracks = asset.SubtitleTracks as any[];

        videoTracks.forEach(element => {
            const clips = element.VideoTrackClips;
            clips.forEach(clip => {
                const timelineOut = clip.TimelineOut;
                if (timelineOut > duration) {
                    duration = timelineOut;
                }
            })
        });

        audioTracks.forEach(element => {
            const clips = element.AudioTrackClips;
            clips.forEach(clip => {
                const timelineOut = clip.TimelineOut;
                if (timelineOut > duration) {
                    duration = timelineOut;
                }
            })
        });

        // subtitleTracks.forEach(element => {
        //     const clips = element.SubtitleTrackClips;
        //     clips.forEach(clip => {
        //         const timelineOut = clip.TimelineOut;
        //         if (timelineOut > duration) {
        //             duration = timelineOut;
        //         }
        //     })
        // });
        return duration;
    }

    private __overlayEnable(element) {
        const ovin = element.TimelineIn ?? 0;
        const ovout = element.TimelineOut ?? element.Duration;
        return `'between(t, ${ovin}, ${ovout})'`
    }



}

function secondsToTimeline(time: number) {
    const hour = Math.floor(time / 3600);
    const minute = Math.floor((time - hour * 3600) / 60);
    const second = Math.floor(time - hour * 3600 - minute * 60);
    const microSeconds = Math.floor((time - Math.floor(time)) * 1000);

    return `${hour}:${minute}:${second},${microSeconds}`;

}