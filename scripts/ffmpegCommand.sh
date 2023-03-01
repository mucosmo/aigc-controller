#重复播放背景音乐
ffmpeg -i forest.mp4 -stream_loop -1 -i 5s成都.flac -c:v copy -map 0:v -map 1:a -t 18 -y 成都森林.mp4