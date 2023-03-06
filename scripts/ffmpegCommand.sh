#重复播放背景音乐
ffmpeg -i forest.mp4 -stream_loop -1 -i 5s成都.flac -c:v copy -map 0:v -map 1:a -t 18 -y 成都森林.mp4

# 音轨合并用 merge 时，需保证合并的所有音轨在整个任务期间都是存在的，否则会没有声音，因此用 -t 时必须覆盖所有时长


# 局部放大并且模糊背景
ffmpeg -i forest.mp4 -filter_complex "[0:v]boxblur=10:1[blur];[0:v]zoompan=z='6':d=1:x='0.25*in_w':y='0.25*in_h',crop=x=iw/4:y=ih/4,scale=iw/2:ih/2[v1];[blur][v1]overlay=(W-w)/2:(H-h)/2" -y forest_magnify.mp4

# 读取文件并推送到 udp 服务器
ffmpeg -re -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -c copy -f mpegts udp://0.0.0.0:1244

# 从 udp 服务器读取文件并生成
ffmpeg -i udp://0.0.0.0:1244 -buffer_size 1M -y udp.mp4

## extract an object detected in a video with its corresponding background as a mask
ffmpeg -i input_video.mp4 -filter_complex "[0:v]select=eq(n\,10),[0:v]scale=640:480:force_original_aspect_ratio=decrease,pad=640:480:(ow-iw)/2:(oh-ih)/2:color=black,boxblur=luma_radius=10:luma_power=1,geq=lum_expr='(r(X,Y)+g(X,Y)+b(X,Y))/3:128-m+1/2*lum(X,Y)'[mask];[0:v][mask]alphamerge[output]" -map "[output]" output_mask.mp4

# stream to rtc room over rtp protocol
ffmpeg -re i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -c:v vp8 -b:v 1000k -deadline 1 -cpu-used 2  -ssrc 2222 -payload_type 101 -f rtp rtp://121.5.133.154:10025 -map

## extract intra frame
ffmpeg -i forest.mp4 -vf "select=eq(pict_type\,I)" -vsync 0 forest_%03d.png
