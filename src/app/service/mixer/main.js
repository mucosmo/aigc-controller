const fs = require('fs');

let script = fs.readFileSync('./src/app/service/mixer/script.json', 'utf8');
script = JSON.parse(script);

let command = fs.readFileSync('./src/app/service/mixer/target.json', 'utf8');
command = JSON.parse(command);


function transformer(script) {
    const fltScript = getScriptFiltered(script);
    // console.log('---- fltScript', fltScript.scenes[0]?.shots[0]?.clips[0]?.audios)
    // console.log('---- fltScript', fltScript.scenes[0]?.captions)
    console.log('---- fltScript', fltScript)
    const scenes = fltScript.scenes;
    const size = script.meta.size;
    console.log('---- size', size);

    checkScript(fltScript);
    fltScript.scenes = fltScript.scenes.map(scene => {
        scene = transScene(scene, size);
        return scene
    })

    fltScript.scenes.forEach(scene => {
        const render = transSceneToRender(scene, size);
        fs.writeFileSync(`/opt/application/render_${scene.sceneId}.json`, JSON.stringify(render), 'utf8');
        const ffmpegCommand = {
            "sink": {
                "roomId": "mixer",
                "userId": "mixer001",
                "deviceName": "FFMPEG",
                "displayName": "basic"
            },
            "streams": {
                "video": true,
                "audio": true
            },
            "render": render

        };
        fs.writeFileSync(`/opt/application/command_${scene.sceneId}.json`, JSON.stringify(ffmpegCommand), 'utf8');

    })


    fs.writeFileSync('/opt/application/transformer.json', JSON.stringify(fltScript), 'utf8');
    return command;
}

function transScene(scene, size) {
    scene['profile'] = {
        videos: countMedia(scene, 'videos'),
        audios: countMedia(scene, 'audios'),
        captions: countMedia(scene, 'captions'),
        subtitles: countMedia(scene, 'subtitles'),
    }
    scene = calSecneLayout(scene, size);
    return scene;
}

// 通过 enable 过滤剧本中的非活动元素
function getScriptFiltered(script) {
    for (let [key, val] of Object.entries(script)) {
        if (Array.isArray(val)) {
            val = val.filter(item => !item.hasOwnProperty('enable') || item.enable);
            val.forEach(item => {
                item = getScriptFiltered(item);
            })
            script[key] = val;
            if (val.length === 0 && key !== 'filters') {
                delete script[key];
            }
        } else if (val !== null && typeof val === 'object') {
            val = getScriptFiltered(val);
            script[key] = val;
        }
    }
    return script;
}


// 检查剧本是否合法
function checkScript(script) {
    if (!script.scenes) {
        throw new Error('scenes is not exist')
    }
}


function countMedia(scene, type) {
    let count = 0;
    scene.shots.forEach(shot => {
        shot.clips.forEach(clip => {
            clip[type] && (count += clip[type].length);
        })
    })
    return count;
}

function calSecneLayout(scene, size) {
    const layout = scene.layout;
    for (let [key, val] of Object.entries(layout)) {
        let x = layout[key].x * size.w;
        val.x = Math.floor(x / 2) * 2; // must be even
        let y = layout[key].y * size.h;
        val.y = Math.floor(y / 2) * 2;
        let w = layout[key].w * size.w;
        val.w = Math.floor(w / 2) * 2; // must be even
        let h = layout[key].h * size.h;
        val.h = Math.floor(h / 2) * 2; // must be even    
        layout[key] = val;
    }

    console.log('---- layout:', layout);

    scene.audios = scene.audios.map((audio, index) => {
        audio.options = [
            "-re",
            `-ss ${audio.clip.start}`,
            `-t ${audio.clip.duration}`,
        ];
        delete audio.clip;

        audio.srcId = audio.id;
        audio.type = "audio";
        audio.id = index + '_' + Math.random().toString(16).slice(2, 10);
        return audio;
    })

    scene.shots = scene.shots.map(shot => {
        const area = shot.area;
        shot.clips.map(clip => {
            let filIndex = -10;
            clip.vidoes = clip.videos.map((video, index) => {
                const scale = video.scale;

                console.log('---- video', video)
                const filters = video.filters;
                filIndex -= 1;
                const scaleFilter = {
                    "seq": filIndex,
                    "name": "scale",
                    "options": {
                        "w": layout[area].w,
                        "h": layout[area].h
                    }
                }
                filters.unshift(scaleFilter);
                delete video.scale;

                const crop = video.crop;
                filIndex -= 1;
                const cropFilter = {
                    "seq": filIndex,
                    "name": "crop",
                    "options": {
                        "w": crop.w,
                        "h": crop.h,
                        "x": crop.x,
                        "y": crop.y
                    }
                }
                filters.unshift(cropFilter);
                delete video.crop;

                video.srcId = video.id;
                video.id = index + '_' + Math.random().toString(16).slice(2, 10);

                video.options = [
                    "-re",
                    `-ss ${video.clip.start}`,
                    `-t ${video.clip.duration}`,
                ];
                delete video.clip;

                video.type = "video";


                return video;
            })

            clip.videos.map((video, index) => {
                // 有转场时不要叠加
                if (video.transitions && video.transitions.length > 0) {
                    video.area = {
                        "x": layout[area].x,
                        "y": layout[area].y
                    }
                    if (clip.videos[index + 1]) {
                        video.transitions = video.transitions.map(transition => {
                            transition.to = clip.videos[index + 1].id;
                            return transition;
                        })
                    } else {
                        delete video.transitions;
                    }
                }
                return video;
            })
            return clip;
        })
        return shot;
    })

    return scene;
}

// 单独场景转 render
function transSceneToRender(scene, size) {
    const render = { template: {} };
    const template = render.template;

    template.project = {
        "width": size.w,
        "height": size.h,
        "bgColor": "blue",
        "duration": 30
    };

    template.id = Math.random().toString(36).slice(2, 10);

    template.profile = scene.profile;

    template.videos = [];

    scene.shots.forEach(shot => {
        let index = 0;
        shot.clips.forEach(clip => {
            clip.videos.forEach(video => {
                // video.id = video.id + '_' + Math.random().toString(36).slice(2, 10);
                template.videos.push(video)
            })
        })
    })

    template.videos.push(...scene.captions);
    template.videos.push(...scene.subtitles);
    template.audios = scene.audios;
    return render;

}