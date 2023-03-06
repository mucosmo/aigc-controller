#重复播放背景音乐
ffmpeg -i forest.mp4 -stream_loop -1 -i 5s成都.flac -c:v copy -map 0:v -map 1:a -t 18 -y 成都森林.mp4

# 音轨合并用 merge 时，需保证合并的所有音轨在整个任务期间都是存在的，否则会没有声音，因此用 -t 时必须覆盖所有时长


# 局部放大并且模糊背景
ffmpeg -i forest.mp4 -filter_complex "[0:v]boxblur=10:1[blur];[0:v]zoompan=z='6':d=1:x='0.25*in_w':y='0.25*in_h',crop=x=iw/4:y=ih/4,scale=iw/2:ih/2[v1];[blur][v1]overlay=(W-w)/2:(H-h)/2" -y forest_magnify.mp4