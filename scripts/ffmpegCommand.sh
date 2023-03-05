#重复播放背景音乐
ffmpeg -i forest.mp4 -stream_loop -1 -i 5s成都.flac -c:v copy -map 0:v -map 1:a -t 18 -y 成都森林.mp4

# 音轨合并用 merge 时，需保证合并的所有音轨在整个任务期间都是存在的，否则会没有声音，因此用 -t 时必须覆盖所有时长