#!/usr/bin/env bash

timestamp=$(date +%s)

outputvideo=../files/composites/shell-${timestamp}.

# 568*320
video1=../files/resources/filevideo.mp4
# 568*320
office=../files/resources/office.mp4
# 568*320
video2=../files/resources/video2.mp4
# 1401*1261
png=../files/resources/fileimage.png
gif=../files/resources/gif.gif
mask=../files/resources/mask.png
svg=../files/resources/svg.svg
rtmp='rtmp\\://175.178.31.221\\:51013/live/m25822721816395777'
m3u8=http://hz-test.ikandy.cn:60125/files/m3u8/1669358475054g2l5bihp6e/mediasoup_live.m3u8
dh=../files/resources/dh.mp4
subtitles=../files/resources/subtitles.srt
font=/usr/share/fonts/chinese/SIMKAI.TTF
drawtext="你好啊"
drawtextfile=../files/resources/drawtext.txt
screen5s=../files/resources/screen5s.mp4
koreaRtmp=rtmp://mobliestream.c3tv.com:554/live/goodtv.sdp

onlinepic='https\\://alifei05.cfp.cn/creative/vcg/veer/1600water/veer-412747764.jpg' // 转义字符，避免 : 出现歧义


# ffmpeg -hide_banner -h filter=transpose

# ffplay -hide_banner -f lavfi -i testsrc -vf transpose=1

# ffmpeg -i resources/filevideo.mp4 -vf "hqdn3d,pad=2*iw" output.mp4

# gif
# ffmpeg -i ${video1} -ignore_loop 0 -i ${gif} -filter_complex "[0:v][1:v]overlay=10:10:shortest=1" output.mp4

# 滤镜图中有空格时，需要用双引号括起来，否则会报错
# ffmpeg -i resources/filevideo.mp4 -lavfi "split[main][tmp];[tmp]crop=iw:ih/2:0:0,vflip[flip];[main][flip]overlay=0:H/2" ${outputvideo}

# 需要 --enable-librsvg
# ffmpeg -i ${svg} test.png

# 字幕向上滚动
# ffplay -hide_banner -f lavfi -i color=size=640x480:duration=10:rate=25:color=green -vf "drawtext=fontfile=/path/to/helvitca.ttf:fontsize=100:fontcolor=FFFFFF:x=(w-text_w)/2:y=h-80*t:text='Hello World'"

# # alphamerge 时两个对象大小必须一致
# ffmpeg -i ${video1} -i ${png} -i ${png} -i ${mask} -i ${video2} -i ${gif} -i ${svg} -loop 3 -filter_complex "[1]crop=100:50:0:0[cropped1];[2]crop=100:50:0:0[cropped2];[3]alphaextract[amask];[amask]scale=100:100[vmask];[4:v]scale=100:100[cropped4];[cropped4][vmask]alphamerge[avatar];[0][cropped1]overlay=W-w-10:10[ov1];[ov1][cropped2]overlay=W-w-10:100[ov2];[ov2][avatar]overlay=W-w:H/3[ov3];[5:v]scale=50:50[gif];[ov3][gif]overlay=W-w-10:H/2[ov4];[ov4]subtitles=resources/subtitles.srt[final];[final]drawtext=text=string1:fontfile=foo.ttf:x=(w-text_w)/2:y=h-80*t:fontcolor=white:fontsize=40:shadowx=2:shadowy=2" -max_muxing_queue_size 1024 ${outputvideo}

# # 从会议中拉取流
# ffmpeg -i ${video1} -i ${png} -i ${mask} -i ${video2} -i ${gif} -filter_complex "[1]crop=100:50:200:200[cropped1];[2]alphaextract[amask];[amask]scale=150:150[vmask];[3:v]scale=150:150[cropped3];[cropped3][vmask]alphamerge[avatar];[0][cropped1]overlay=W-w-10:10[ov1];[ov1][avatar]overlay=10:10[ov2];[4:v]scale=50:50[gif];[ov2][gif]overlay=W-w-10:H/2" -max_muxing_queue_size 1024 -f matroska - | ffplay -


# # 添加绿幕背景
# ffmpeg -i ${video1} -i ${png} -i ${mask} -i ${video2} -i ${gif} -i ${dh}  -filter_complex "[1]crop=100:50:200:200[cropped1];[2]alphaextract[amask];[amask]scale=150:150[vmask];[3:v]scale=150:150[cropped3];[cropped3][vmask]alphamerge[avatar];[0][cropped1]overlay=W-w-10:10[ov1];[ov1][avatar]overlay=10:10[ov2];[4:v]scale=50:50[gif];[ov2][gif]overlay=W-w-10:H/2[ov3];[5:v]scale=150:-1,chromakey=0x00ff00:0.3:0.05[ov4];[ov3][ov4]overlay=-20:H*0.6[ov5];[ov5]subtitles=${subtitles}[final];[final]drawtext=text=string1:fontfile=${font}:x=(w-text_w)/2:y=h-80*t:fontcolor=white:fontsize=40:shadowx=2:shadowy=2" -max_muxing_queue_size  1024  ${outputvideo}flv

# # # 循环播放
# ffmpeg -i ${video1}    -filter_complex "loop=loop=-1:size=500:start=0" -max_muxing_queue_size  1024  -r 25 -f flv rtmp://121.5.133.154:1935/myapp/12345

# # 简单转码, 设置码率(清晰度) -b 2M     直播时固定输入帧率 -re
# ffmpeg -re -i ${office} -filter_complex "scale=500:-1,drawtext=fontfile=${font}:text=TXCO:x=30:y=20:fontcolor=green:fontsize=50" -c:v flv -b:v 3M -f flv rtmp://121.5.133.154:1935/myapp/12345


# # -q 参数可以压制调试模式的数据输出
#  gst-launch-1.0 -v videotestsrc pattern=snow ! video/x-raw,width=1280,height=720  ! filesink location= /dev/stdout | ffmpeg -y -i - -codec copy -f flv test.flv


# # 从 gstreamer 输出到 ffmpeg
# # fdsink 可替换成 filesink location=/dev/stdout
# gst-launch-1.0 -v -q  videotestsrc pattern=0 ! video/x-raw,width=1280,height=720  ! matroskamux ! fdsink | ffmpeg -y -i - -i ${rtmp} -filter_complex "[1:v]scale=150:-1[ov1];[0][ov1]overlay=-20:H*0.6" -c:v libx264 -t 5 -preset faster -crf 25 -r 30 ${outputvideo}mp4

# # 从 gst 输出一个源作为 ffmpeg 的输入进行合成
# gst-launch-1.0 -v -q filesrc location=${video1} ! fdsink | ffmpeg -i - -i ${png} -i ${mask} -i ${video2} -i ${gif} -i ${dh}  -filter_complex "[1]crop=100:50:200:200[cropped1];[2]alphaextract[amask];[amask]scale=150:150[vmask];[3:v]scale=150:150[cropped3];[cropped3][vmask]alphamerge[avatar];[0][cropped1]overlay=W-w-10:10[ov1];[ov1][avatar]overlay=10:10[ov2];[4:v]scale=50:50[gif];[ov2][gif]overlay=W-w-10:H/2[ov3];[5:v]scale=200:300,chromakey=0x00ff00:0.3:0.05[ov4];[ov3][ov4]overlay=-20+5*n:H*0.2[ov5];[ov5]subtitles=${subtitles}[final];[final]drawtext=textfile=${drawtextfile}:reload=1:fontfile=${font}:x=(w-text_w)/2:y=h-80*t:fontcolor=white:fontsize=40:shadowx=2:shadowy=2"  ${outputvideo}mp4

# # 多文件合成
# ffmpeg -i ${video1} -i ${png} -i ${mask} -i ${video2} -i ${gif} -i ${dh}  -filter_complex "[1]crop=100:50:200:200[cropped1];[2]alphaextract[amask];[amask]scale=150:150[vmask];[3:v]scale=150:150[cropped3];[cropped3][vmask]alphamerge[avatar];[ov2][gif]overlay=W-w-10:H/2[ov3];[0][cropped1]overlay=W-w-10:10[ov1];[ov1][avatar]overlay=10:10[ov2];[4:v]scale=50:50[gif];[ov3][ov4]overlay=-20+5*n:H*0.2[ov5];[5:v]scale=200:300,chromakey=0x00ff00:0.3:0.05[ov4];[ov5]subtitles=${subtitles}[final];[final]drawtext=textfile=${drawtextfile}:reload=1:fontfile=${font}:x=(w-text_w)/2:y=h-80*t:fontcolor=white:fontsize=40:shadowx=2:shadowy=2"  ${outputvideo}mp4

# # 多文件合成 （所有文件从 movie 的输入）
# ffmpeg -i /opt/application/tx-rtcStream/files/resources/screen18s.mp4  -filter_complex "movie=/opt/application/tx-rtcStream/files/resources/screen5s.mp4[0];movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[m0];movie=/opt/application/tx-rtcStream/files/resources/mask.png[m1];movie=/opt/application/tx-rtcStream/files/resources/filevideo.mp4[m2];movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[m3];movie=/opt/application/tx-rtcStream/files/resources/dh.mp4[m4];[m0]crop=200:200:200:200[cropped1];[m1]alphaextract[amask];[amask]scale=150:150[vmask];[m2]scale=150:150[cropped3];[cropped3][vmask]alphamerge[avatar];[0][cropped1]overlay=W-w-10:10[ov1];[ov1][avatar]overlay=100:10[ov2];[m3]scale=50:50[gif];[ov2][gif]overlay=W-w-10:H/2[ov3];[m4]scale=200:300,chromakey=0x00ff00:0.3:0.05[ov4];[ov3][ov4]overlay=-20+n:100[ov5];[ov5]subtitles=${subtitles}[final];[final]drawtext=text=1:fontfile=/usr/share/fonts/chinese/SIMKAI.TTF:x=10:y=100:fontcolor=white:fontsize=100:shadowx=2:shadowy=2"  ${outputvideo}mp4

# # 从 movie 输入 https 文件, 注意转义字符/单引号
# # 如果是从 txt 文件中读取，应该写成 movie='rtmp\://175.178.31.221\:51013/live/m25822721816395777'
# ffmpeg -i /opt/application/tx-rtcStream/files/resources/screen5s.mp4  -filter_complex "movie=/opt/application/tx-rtcStream/files/resources/screen5s.mp4[0];movie='https\\://alifei05.cfp.cn/creative/vcg/veer/1600water/veer-412747764.jpg'[m0];movie=${mask}[m1];movie=${video1}[m2];movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[m3];movie='rtmp\\://175.178.31.221\\:51013/live/m25824109577371649'[m4];[m0]crop=200:200:200:200[cropped1];[m1]alphaextract[amask];[amask]scale=150:150[vmask];[m2]scale=150:150[cropped3];[cropped3][vmask]alphamerge[avatar];[0][cropped1]overlay=W-w-10:10[ov1];[ov1][avatar]overlay=100:10[ov2];[m3]scale=50:50[gif];[ov2][gif]overlay=W-w-10:H/2[ov3];[m4]scale=200:300,chromakey=0x00ff00:0.3:0.05[ov4];[ov3][ov4]overlay=-20+n:100[ov5];[ov5]subtitles=${subtitles}[final];[final]drawtext=text=1:fontfile=/usr/share/fonts/chinese/SIMKAI.TTF:x=10:y=100:fontcolor=white:fontsize=100:shadowx=2:shadowy=2"  ${outputvideo}mp4


ffmpeg -i /opt/application/tx-rtcStream/files/resources/screen5s.mp4  -filter_complex "movie=/opt/application/tx-rtcStream/files/resources/video2.mp4[region_0.0.0];movie=/opt/application/tx-rtcStream/files/resources/dh.mp4[region_1.0.0];movie=/opt/application/tx-rtcStream/files/resources/office10s.mp4[region_1.0.1];movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[region_2.0.1];movie=/opt/application/tx-rtcStream/files/resources/image1.jpg[region_2.1.1];[region_0.0.0]scale=w=-1:h=100[region_0.0.0_prepro];[region_1.0.0]scale=w=200:h=300,drawbox=x=10:y=10:w=50:h=100:color=red:thickness=5,chromakey=color=0x00ff00:similarity=0.3:blend=0.05[region_1.0.0_prepro];[region_1.0.1]crop=w=700:h=700:x=100:y=200,scale=w=200:h=200[region_1.0.1_prepro];[region_2.0.1]crop=w=100:h=200:x=200:y=300[region_2.0.1_prepro];[region_2.1.1]scale=w=300:h=-1,gblur=sigma=50:steps=2[region_2.1.1_prepro];movie=/opt/application/tx-rtcStream/files/resources/mask.png[region_1.0.1_mask];[region_1.0.1_mask]alphaextract,scale=w=200:h=200:[region_1.0.1_premask];[region_1.0.1_prepro][region_1.0.1_premask]alphamerge[region_1.0.1_maskmerge];[0][region_0.0.0_prepro]overlay=500:50[out0];[out0][region_1.0.0_prepro]overlay=x=5*n:y=500+n*(n-50)[out1];[out1][region_1.0.1_maskmerge]overlay=x=10:y=10[out2];[out2][region_2.0.1_prepro]overlay=x=100+(n-20)*(n-20):y=200[out3];[out3][region_2.1.1_prepro]overlay=x=20:y=600[out4];[out4]subtitles=filename=/opt/application/tx-rtcStream/files/resources/subtitles.srt:force_style='Fontsize=8,PrimaryColour=&H0230bf&'[outText_region_3.0.0];[outText_region_3.0.0]drawtext=textfile=/opt/application/tx-rtcStream/files/resources/drawtext.txt:x=(w-text_w)/2-n:y=h-150*t-n*5:fontfile=/usr/share/fonts/chinese/SIMKAI.TTF:fontcolor=red:fontsize=60:shadowx=20:shadowy=10[outText_region_4.0.0];[outText_region_4.0.0]drawtext=text=text字幕:x=300:y=300:fontfile=/usr/share/fonts/chinese/SIMKAI.TTF:fontcolor=green:fontsize=20"  ${outputvideo}.mp4


# # 打开多个文件时可以把其他文件放到 filter 中的 movie 路径
# ffmpeg -re -i ${office} -filter_complex "movie=${png}[m0];movie=${video1}[m1];[m0]scale=200:-1[m0scale];[m1]scale=300:-1[m1scale];[0][m0scale]overlay=2:2[out1];[out1][m1scale]overlay=200:100" -t 5 ${outputvideo}mp4


# # scale 视频
#  ffmpeg -re -i ${screen5s} -filter_complex "scale=200:350" -t 5 ${outputvideo}mp4




# # #  test-hz 服务器上 ffmpeg 的构造
# PKG_CONFIG_PATH="/opt/program/ffmpeg/lib/pkgconfig" ./configure \
#   --pkg-config-flags="--static" \
#   --extra-cflags="-I/opt/program/ffmpeg/include" \
#   --extra-ldflags="-L/opt/program/ffmpeg/lib" \
#   --extra-libs="-lpthread -lm" \
#   --ld="g++"  --prefix=/opt/program/ffmpeg --enable-shared --enable-gpl --enable-version3 --enable-static --disable-debug --disable-ffplay --disable-indev=sndio --disable-outdev=sndio --cc=gcc --enable-fontconfig  --enable-gnutls --enable-gmp --enable-gray --enable-libaom --enable-libfribidi --enable-libass --enable-libfreetype --enable-libmp3lame --enable-libopus --enable-libvpx  --enable-libx264 --enable-libx265


# # c 程序转码时绘制文本
# drawtext=text=string1:fontfile=/usr/share/fonts/chinese/SIMKAI.TTF:x=(w-text_w)/2:y=h-80*t:fontcolor=white:fontsize=40

# # 源码 overlay image 和 video
#  movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[m0];movie=/opt/application/tx-rtcStream/files/resources/screen5s.mp4[m1];[in][m0]overlay=20:200[out1];[out1][m1]overlay=200:100

# # 源码 scale 大小
# scale=200:-300


# # 背景视频+预设轨迹多图片
# movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[m0];movie=/opt/application/tx-rtcStream/files/resources/mask.png[m1];movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[m2];movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[m3];movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[m4];[m0]crop=100:50:200:200[cropped1];[m1]alphaextract[amask];[amask]scale=150:150[vmask];[m2]scale=150:150[cropped3];[cropped3][vmask]alphamerge[avatar];[in][cropped1]overlay=W-w-10:10[ov1];[ov1][avatar]overlay=10:10[ov2];[m3]scale=50:50[gif];[ov2][gif]overlay=W-w-10:H/2[ov3];[m4]scale=200:300,chromakey=0x00ff00:0.3:0.05[ov4];[ov3][ov4]overlay=-20+5*n:H*0.2[ov5];[ov5]subtitles=/opt/application/tx-rtcStream/files/resources/subtitles.srt[final];[final]drawtext=textfile=/opt/application/tx-rtcStream/files/resources/drawtext.txt:reload=1:fontfile=/usr/share/fonts/chinese/SIMKAI.TTF:x=(w-text_w)/2:y=h-80*t:fontcolor=white:fontsize=40:shadowx=2:shadowy=2

# # 添加一个视频（dh) 预设轨迹
# movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[m0];movie=/opt/application/tx-rtcStream/files/resources/mask.png[m1];movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[m2];movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[m3];movie=/opt/application/tx-rtcStream/files/resources/dh.mp4[m4];[m0]crop=100:50:200:200[cropped1];[m1]alphaextract[amask];[amask]scale=150:150[vmask];[m2]scale=150:150[cropped3];[cropped3][vmask]alphamerge[avatar];[in][cropped1]overlay=W-w-10:10[ov1];[ov1][avatar]overlay=10:10[ov2];[m3]scale=50:50[gif];[ov2][gif]overlay=W-w-10:H/2[ov3];[m4]scale=200:300,chromakey=0x00ff00:0.3:0.05[ov4];[ov3][ov4]overlay=-20+5*n:H*0.2[ov5];[ov5]subtitles=/opt/application/tx-rtcStream/files/resources/subtitles.srt[final];[final]drawtext=textfile=/opt/application/tx-rtcStream/files/resources/drawtext.txt:reload=1:fontfile=/usr/share/fonts/chinese/SIMKAI.TTF:x=(w-text_w)/2:y=h-80*t:fontcolor=white:fontsize=40:shadowx=2:shadowy=2

# # 两个数字人视频
# movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[m0];movie=/opt/application/tx-rtcStream/files/resources/mask.png[m1];movie=/opt/application/tx-rtcStream/files/resources/dh.mp4[m2];movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[m3];movie=/opt/application/tx-rtcStream/files/resources/dh.mp4[m4];[m0]crop=100:50:200:200[cropped1];[m1]alphaextract[amask];[amask]scale=150:150[vmask];[m2]scale=150:150[cropped3];[cropped3][vmask]alphamerge[avatar];[in][cropped1]overlay=W-w-10:10[ov1];[ov1][avatar]overlay=10:10[ov2];[m3]scale=50:50[gif];[ov2][gif]overlay=W-w-10:H/2[ov3];[m4]scale=200:300,chromakey=0x00ff00:0.3:0.05[ov4];[ov3][ov4]overlay=-20+5*n:H*0.2[ov5];[ov5]subtitles=/opt/application/tx-rtcStream/files/resources/subtitles.srt[final];[final]drawtext=textfile=/opt/application/tx-rtcStream/files/resources/drawtext.txt:reload=1:fontfile=/usr/share/fonts/chinese/SIMKAI.TTF:x=(w-text_w)/2:y=h-80*t:fontcolor=white:fontsize=40:shadowx=2:shadowy=2


end_time=$(date +%s)


echo shell-execution time was `expr $end_time - $timestamp` s



## 左右两个视频对比
ffmpeg -i 10_input.mp4 -filter_complex "[0:v]split=2[v0][v1];[v0]scale=640x480,setsar=1,pad=1280:480:0:0[v0];[v1]scale=640x480,setsar=1, hue=s=0,boxblur=3:1[v1];[v0][v1]overlay=w" -c:a copy -y 10_output.mp4

ffmpeg -i forest.mp4 -filter_complex "[0:v]split=2[v0][v1];[v0]pad=2732:720:0:0[v0];[v1]hue=s=0,boxblur=3:1[v1];[v0][v1]overlay=w" -c:a copy -y forest_splitter_output.mp4

ffmpeg -i forest.mp4 -i forest_output.mp4 -filter_complex "[0]pad=2732:720:0:0[v0];[v0][1]overlay=w" -c:a copy -y forest_splitter_output.mp4

ffmpeg -i /opt/application/tx-rtcStream/files/resources/office30s.mp4 -i rtmp://liveplay.ivh.qq.com/live/m1568283098611713 -filter_complex "[0:v][1:v]overlay=20:20" -an -c:v vp8 -b:v 1000k -deadline 1 -cpu-used 2 -ssrc 2222 -payload_type 101 -f rtp rtp://${this.channel.videoTransport.ip}:${this.channel.videoTransport.port}


## 淡入淡出
ffmpeg -i forest.mp4 -loop 1 -i globalmap.jfif -filter_complex "[1:v]fade=in:st=0:d=5,scale=200:-1[v1];[0:v][v1]overlay=10:10" -pix_fmt yuv420p -c:a copy -t 10 -y forest_image_fade.mp4


## 持续一段时间后消失
ffmpeg -i forest.mp4 -loop 1 -i globalmap.jfif -filter_complex "[1:v]trim=duration=5,scale=640x360[v1];[0:v][v1]overlay=10:10:enable='between(t,0,5)'" -pix_fmt yuv420p -c:a copy forest_overlay_trim.mp4


# 转场
# 需要先统一处理图片至相同的 DAR (scale=1200:600) 和 SAR (setsar=1:1)
ffmpeg -loop 1 -t 5 -i image1.jpg -loop 1 -t 5 -i image2.jpg -loop 1 -t 5 -i image3.jpg -loop 1 -t 5 -i image4.jpg -filter_complex "[0:v]fade=t=out:st=4:d=1[v0];[1:v]fade=t=in:st=0:d=1,fade=t=out:st=4:d=1[v1];[2:v]fade=t=in:st=0:d=1,fade=t=out:st=4:d=1[v2];[3:v]fade=t=in:st=0:d=1,fade=t=out:st=4:d=1[v3];[v0][v1][v2][v3]concat=n=4:v=1:a=0,format=yuv420p[v]" -map "[v]" -y out.mp4

# 音量检测, 其中的 I (Integrated loudness) 可以代表音量高低
# http://underpop.online.fr/f/ffmpeg/help/ebur128.htm.gz
# https://tech.ebu.ch/docs/r/r128s1.pdf
ffmpeg -i /opt/dev/rtcSdk/files/16k-2.mp3 -filter:a ebur128 audioLevel_output.mp3
# 显示音量检测结果
ffplay -f lavfi -i "amovie=mv1.mp4,ebur128=video=1:meter=18 [out0][out1]"

# 旋转
ffmpeg -i /opt/dev/rtcSdk/files/resources/office10s.mp4 -i /opt/dev/rtcSdk/files/resources/dh.mp4 -filter_complex "[1:v]format=yuva444p,rotate=-30*PI/180:ow=rotw(iw):oh=roth(ih):c=none,scale=200:-1 [rotate];[0:v][rotate] overlay=40:10:enable='between(t,0,10)', colorchannelmixer=aa=0.5" -auto-alt-ref 0 -pix_fmt yuv420p -c:a copy -y overlayavatar.mp4

# 圆形蒙版（背景未去除）
ffmpeg  -i /opt/application/tx-rtcStream/files/resources/office10s.mp4  -i /opt/application/tx-rtcStream/files/resources/dh.mp4 -filter_complex "[0:v]null[region_0.0];[1:v]null[region_1.0.1];[region_0.0]scale=w=454:h=240,boxblur=lr=1:lp=1[region_0.0_prepro];[region_1.0.1]crop=w=300:h=300:x=130:y=130,scale=w=200:h=200,chromakey=color=0x00ff00:similarity=0.3:blend=0.05[region_1.0.1_prepro];movie='/opt/application/tx-rtcStream/files/resources/mask.png'[region_1.0.1_mask];[region_1.0.1_mask]alphaextract,scale=w=200:h=200[region_1.0.1_premask];[region_1.0.1_prepro][region_1.0.1_premask]alphamerge[region_1.0.1_maskmerge];[region_0.0_prepro][region_1.0.1_maskmerge]overlay=(W-w)/5:(H-h)/10" -c:v libx264 -y mask.mp4


# 圆形蒙版（尝试去除背景）
ffmpeg  -i /opt/application/tx-rtcStream/files/resources/office10s.mp4  -i /opt/application/tx-rtcStream/files/resources/dh.mp4  -i /opt/application/tx-rtcStream/files/resources/globalmap.png -filter_complex "[0:v]null[region_0.0];[1:v]null[region_1.0.1];[2:v]scale=-1:200[2v];[region_0.0]scale=w=454:h=240[region_0.0_prepro];[region_1.0.1]crop=w=300:h=300:x=130:y=130,scale=w=200:h=200[region_1.0.1_prepro];movie='/opt/application/tx-rtcStream/files/resources/mask.png'[region_1.0.1_mask];[region_1.0.1_mask]alphaextract,scale=w=200:h=200[region_1.0.1_premask];[region_1.0.1_prepro][region_1.0.1_premask]alphamerge[region_1.0.1_maskmerge];[2v][region_1.0.1_maskmerge]overlay=10:10[ov];[ov]chromakey=color=0x00ff00:similarity=0.3:blend=0[masked];[region_0.0_prepro][masked]overlay=(W-w)/5:(H-h)/10" -c:v libx264 -y mask_removed.mp4

ffmpeg  -i /opt/application/tx-rtcStream/files/resources/office10s.mp4  -i /opt/application/tx-rtcStream/files/resources/dh.mp4 -filter_complex "[0:v]null[region_0.0];[1:v]null[region_1.0.1];[region_0.0]scale=w=454:h=240[region_0.0_prepro];[region_1.0.1]crop=w=300:h=300:x=130:y=130,scale=w=200:h=200[region_1.0.1_prepro];movie='/opt/application/tx-rtcStream/files/resources/mask.png'[region_1.0.1_mask];[region_1.0.1_mask]alphaextract,scale=w=200:h=200[region_1.0.1_premask];[region_1.0.1_prepro][region_1.0.1_premask]alphamerge[region_1.0.1_maskmerge];[region_0.0_prepro][masked]overlay=(W-w)/5:(H-h)/10" -c:v libx264 -y mask.mp4

# very close
ffmpeg  -i /opt/application/tx-rtcStream/files/resources/office10s.mp4  -i /opt/application/tx-rtcStream/files/resources/dh.mp4  -i /opt/application/tx-rtcStream/files/resources/office10s.mp4 -filter_complex "[0:v]null[region_0.0];[1:v]null[region_1.0.1];[2:v]null[2v];[region_0.0]scale=w=454:h=240[region_0.0_prepro];[region_1.0.1]crop=w=300:h=300:x=130:y=130,scale=w=200:h=200[region_1.0.1_prepro];movie='/opt/application/tx-rtcStream/files/resources/mask.png'[region_1.0.1_mask];[region_1.0.1_mask]alphaextract,scale=w=200:h=200[region_1.0.1_premask];[region_1.0.1_prepro][region_1.0.1_premask]alphamerge[region_1.0.1_maskmerge];[2v][region_1.0.1_maskmerge]overlay=(W-w)/5:(H-h)/10[ov];[ov]chromakey=color=0x00ff00:similarity=0.3:blend=0[masked];[region_0.0_prepro][masked]overlay=0:0" -c:v libx264 -y mask_removed.mp4


ffmpeg  -i /opt/application/tx-rtcStream/files/resources/office10s.mp4  -i /opt/application/tx-rtcStream/files/resources/dh.mp4  -i /opt/application/tx-rtcStream/files/resources/transparent.png -filter_complex "[0:v]null[region_0.0];[1:v]null[region_1.0.1];[2:v]scale=-1:240[2v];[region_0.0]scale=w=454:h=240[region_0.0_prepro];[region_1.0.1]crop=w=300:h=300:x=130:y=130,scale=w=200:h=200[region_1.0.1_prepro];movie='/opt/application/tx-rtcStream/files/resources/mask.png'[region_1.0.1_mask];[region_1.0.1_mask]alphaextract,scale=w=200:h=200[region_1.0.1_premask];[region_1.0.1_prepro][region_1.0.1_premask]alphamerge[region_1.0.1_maskmerge];[2v][region_1.0.1_maskmerge]overlay=10:10[ov];[ov]chromakey=color=0x00ff00:similarity=0.3:blend=0[masked];[region_0.0_prepro][masked]overlay=(W-w)/5:(H-h)/10" -c:v libx264 -y mask_removed.mp4


# ok but not perfect
ffmpeg  -i /opt/application/tx-rtcStream/files/resources/office10s.mp4  -i /opt/application/tx-rtcStream/files/resources/dh.mp4  -i /opt/application/tx-rtcStream/files/resources/office10s.mp4 -filter_complex "[0:v]null[region_0.0];[1:v]null[region_1.0.1];[2:v]null[2v];[region_0.0]null[region_0.0_prepro];[region_1.0.1]crop=w=400:h=400:x=100:y=100,scale=w=100:h=100[region_1.0.1_prepro];movie='/opt/application/tx-rtcStream/files/resources/mask.png'[region_1.0.1_mask];[region_1.0.1_mask]alphaextract,scale=w=100:h=100[region_1.0.1_premask];[region_1.0.1_prepro][region_1.0.1_premask]alphamerge[region_1.0.1_maskmerge];[2v][region_1.0.1_maskmerge]overlay=0:0[ov];[ov]chromakey=color=0x00ff00:similarity=0.3:blend=0[masked];[region_0.0_prepro][masked]overlay=0:0" -c:v libx264 -y mask_removed.mp4


ffmpeg  -i /opt/application/tx-rtcStream/files/resources/testsrc_1280x960_30p.mp4  -i /opt/application/tx-rtcStream/files/resources/dh.mp4  -i /opt/application/tx-rtcStream/files/resources/testsrc_1280x960_30p.mp4 -filter_complex "[0:v]null[region_0.0];[1:v]null[region_1.0.1];[2:v]null[2v];[region_0.0]null[region_0.0_prepro];[region_1.0.1]crop=w=400:h=400:x=100:y=100,scale=w=300:h=300[region_1.0.1_prepro];movie='/opt/application/tx-rtcStream/files/resources/mask.png'[region_1.0.1_mask];[region_1.0.1_mask]alphaextract,scale=w=300:h=300[region_1.0.1_premask];[region_1.0.1_prepro][region_1.0.1_premask]alphamerge[region_1.0.1_maskmerge];[2v][region_1.0.1_maskmerge]overlay=W-400:H-400[ov];[ov]chromakey=color=0x00ff00:similarity=0.3:blend=0[masked];[region_0.0_prepro][masked]overlay=0:0" -c:v libx264 -y mask_removed.mp4


# 透明层
ffmpeg  -i /opt/application/tx-rtcStream/files/resources/testsrc_1280x960_30p.mp4  -i /opt/application/tx-rtcStream/files/resources/dh.mp4  -i /opt/dev/rtcSdk/server/transparent.mp4 -filter_complex "[0:v]null[region_0.0];[1:v]null[region_1.0.1];[2:v]scale=1280:960[2v];[region_0.0]null[region_0.0_prepro];[region_1.0.1]crop=w=400:h=400:x=100:y=100,scale=w=300:h=300[region_1.0.1_prepro];movie='/opt/application/tx-rtcStream/files/resources/mask.png'[region_1.0.1_mask];[region_1.0.1_mask]alphaextract,scale=w=300:h=300[region_1.0.1_premask];[region_1.0.1_prepro][region_1.0.1_premask]alphamerge[region_1.0.1_maskmerge];[2v][region_1.0.1_maskmerge]overlay=W-400:H-400[ov];[ov]chromakey=color=0x00ff00:similarity=0.3:blend=0[masked];[region_0.0_prepro][masked]overlay=0:0" -c:v libx264 -y mask_removed.mp4


# extract alpha channel, white is opaque, black is transparent
ffmpeg -i /opt/application/tx-rtcStream/files/resources/mask.png -vf "alphaextract" alphaextract.mp4

,chromakey=color=0x00ff00:similarity=0.3:blend=0.05

ffmpeg -i /opt/application/tx-rtcStream/files/resources/office10s.mp4 -i /opt/application/tx-rtcStream/files/resources/dh.mp4 -i /opt/application/tx-rtcStream/files/resources/mask.png -filter_complex "[1:v]crop=w=300:h=300:x=130:y=130,scale=w=200:h=200,chromakey=0x00FF00:0.1:0.2[masked];[2:v]scale=w=200:h=200[maskpng];[masked][maskpng]alphamerge[overlay];[0:v][overlay]overlay=0:0[outv]" -map "[outv]" output_mask.mp4

# geq filter 可能有用
ffmpeg -i /opt/application/tx-rtcStream/files/resources/office10s.mp4 -i /opt/application/tx-rtcStream/files/resources/dh.mp4 -i /opt/application/tx-rtcStream/files/resources/mask.png -filter_complex "[1:v]format=rgba,colorkey=0x00FF00:0.1:0.2,geq=lum_expr='r=128:g=128:b=128':128,maskfun='r(X,Y)':128:128[masked];[masked][2:v]alphamerge[overlay];[0:v][overlay]overlay=0:0[outv]" -map "[outv]" -y output.mp4


# 最后结果中忽略前面的帧
ffmpeg -i /opt/dev/rtcSdk/files/resources/20_input.mp4 -i /opt/application/tx-rtcStream/files/resources/dh.mp4 -filter_complex "[0:v]overlay=200:200[merged];[merged]trim=start_frame=100,setpts=PTS-STARTPTS[out]" -map "[out]" -y skip.mp4

ffmpeg -i /opt/dev/rtcSdk/files/resources/20_input.mp4 -i /opt/application/tx-rtcStream/files/resources/dh.mp4 -filter_complex "[0:v]overlay=200:200,trim=start_frame=100,setpts=PTS-STARTPTS[out]" -map "[out]" -y skip.mp4


# 生成测试用的时钟视频(需要注意format=yuv420p)
ffmpeg -f lavfi -i "testsrc=duration=40:size=1280*720:rate=30,format=yuv420p" -c:v libx264 -preset fast -y 100_input.mp4

# 片段裁剪 (-ss hh:mm:ss[.xxx] 位数代表精度， 00:00:05.80 / 00:00:05.800 / 5.80 是一样的)
ffmpeg -i /opt/application/tx-rtcStream/files/resources/100_input.mp4 -ss 70.10 -t 3.60 -y clock_clip.mp4


# 渐入叠加
ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -i /opt/application/tx-rtcStream/files/resources/dh.mp4 -filter_complex "[1:v]fade=in:st=4:d=2[fadein];[0:v][fadein]overlay=10:10[outv]" -map "[outv]" -c:v libx264 -preset fast -crf 18 -c:a copy -y fade_output.mp4


# 渐入时避免黑块(trim)
ffmpeg -i /opt/application/tx-rtcStream/files/resources/100_input.mp4 -i /opt/application/tx-rtcStream/files/resources/dh.mp4 -filter_complex "[1:v]trim=start_frame=0,setpts=PTS-STARTPTS+4/TB,fade=in:st=0:d=2[fadein];[0:v][fadein]overlay=10:10[outv]" -map "[outv]" -c:v libx264 -preset fast -crf 18 -c:a copy output.mp4

# 渐入时避免黑块（format), 注意添加alpha值到fade滤波器的参数列表中
# format=pix_fmts=yuva420p is optional, but it will make the fade smoother
# https://superuser.com/questions/881002/how-can-i-avoid-a-black-background-when-fading-in-an-overlay-with-ffmpeg
ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -i /opt/application/tx-rtcStream/files/resources/office10s.mp4 -filter_complex "[1:v]format=pix_fmts=yuva420p,fade=in:st=4:d=2:alpha=1,fade=out:st=10:d=1:alpha=1[fadein];[0:v][fadein]overlay=10:10[outv]" -map "[outv]" -c:v libx264 -preset fast -crf 18 -c:a copy -y fade_output.mp4


ffmpeg  -ss 0 -t 30 -i /opt/application/tx-rtcStream/files/resources/彩虹.mp3  -acodec copy -y caihong.mp3

# 利用 concat 拼接音频时，需注意每个音频的 st 都应当是 0 ， 否则会出现空白的时间段
ffmpeg  -ss 10 -t 10 -i /opt/application/tx-rtcStream/files/resources/成都.mp3  -ss 13 -t 15 -i /opt/application/tx-rtcStream/files/resources/彩虹.mp3 -filter_complex "[0:a]afade=t=in:st=0:d=3,afade=t=out:st=7:d=3[a6];[1:a]afade=t=in:st=0:d=1,afade=t=out:st=10.00:d=3[a7];[a6][a7]concat=n=2:v=0:a=1[a]" -map "[a]" -acodec libmp3lame -y audio_concat.mp3


ffmpeg -ss 10 -t 20 -i /opt/application/tx-rtcStream/files/resources/成都.mp3  -ss 10 -t 11 -i /opt/application/tx-rtcStream/files/resources/彩虹.mp3 -filter_complex "[0:a]afade=t=out:st=10:d=3[a1];[1:a]afade=t=in:st=11:d=3,afade=t=out:st=20:d=3,apad[a2];[a1][a2]amerge=inputs=2[aout]" -map "[aout]" -y audio_merge.mp3


# 在音频之间插入空白音频
ffmpeg -f lavfi -t 5 -i anullsrc=channel_layout=stereo:sample_rate=44100 -ss 10 -t 20 -i /opt/application/tx-rtcStream/files/resources/成都.mp3 -ss 10 -t 11 -i /opt/application/tx-rtcStream/files/resources/彩虹.mp3  -filter_complex "[1:a][0:a][2:a][0:a]concat=n=4:v=0:a=1" silent_concat.mp3


# 生成空白音频 (silence audio)
ffmpeg -f lavfi -i anullsrc=channel_layout=5.1:sample_rate=48000 -t 5 silence.mp3


# 叠加时延迟显示某视频
ffmpeg -i /opt/application/tx-rtcStream/files/resources/40_input.mp4 -i /opt/application/tx-rtcStream/files/resources/40_input.mp4 -filter_complex "[1:v]setpts=PTS-STARTPTS+4/TB,scale=w='iw/3':h='ih/3'[v1];[0:v][v1]overlay=10:10" -c:a copy overlay_setpts.mp4

ffmpeg -i /opt/application/tx-rtcStream/files/resources/40_input.mp4  -fflags +genpts -c:v copy -an timebase.mp4

ffprobe -v error -show_entries packet=pts_time,start_pts_time -of default=noprint_wrappers=1 /opt/application/tx-rtcStream/files/resources/20_input.mp4

# 合并音频视频，音频延迟 4s
ffmpeg -i /opt/application/tx-rtcStream/files/resources/40_input.mp4  -ss 18 -t 30 -i /opt/application/tx-rtcStream/files/resources/成都.mp3 -filter_complex "[1:a]asetpts=PTS-STARTPTS+4/TB" -c:v copy -c:a libmp3lame -y asetpts.mp4

ffmpeg -ss 10 -t 20 -i /opt/application/tx-rtcStream/files/resources/成都.mp3 -ss 10 -t 11 -i /opt/application/tx-rtcStream/files/resources/彩虹.mp3  -filter_complex "[1:a]asetpts=PTS-STARTPTS+24/TB[audio];[0:a][audio]concat=n=2:v=0:a=1" -y asetpts_concat.mp3

# 叠加透明背景图片
ffmpeg  -i /opt/application/tx-rtcStream/files/resources/testsrc_1280x960_30p.mp4 -i /opt/application/tx-rtcStream/files/resources/dog_couch.png -filter_complex "[1]scale=-1:800[1s];[0][1s]overlay=0:0[ret]" -map "[ret]"  -y dog.mp4

# rescale and setsar since when you concat images or videos, they should have the same dimension / pixel format / pixel aspect ratio / timebase number
ffmpeg -i  /opt/application/tx-rtcStream/files/resources/40_input.mp4 -vf scale=1200:600,setsar=1:1 -y  scale.mp4


ffmpeg -i /opt/application/tx-rtcStream/files/resources/image2.jpg -vf "format=yuv420p" output.jpg
ffmpeg -i /opt/application/tx-rtcStream/files/resources/image2.jpg -pix_fmt yuv420p -preset ultrafast -y output.jpg

# 黑色背景视频
ffmpeg -f lavfi -i color=c=black@0.0:s=1280x720:r=30:d=10 -pix_fmt yuva420p transparent.mp4

# 不同的时间在不同的位置
ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4  -i /opt/application/tx-rtcStream/files/resources/dog_couch.png -filter_complex "[1:v]scale=-1:100[1v];[0:v][1v]overlay=x='if(gte(t,0)*lt(t,5),0,if(gte(t,5)*lt(t,10),(2/3)*(n-150),100))':y='if(gte(t,0)*lt(t,10),(H-h),(H-h)-(H-h)/300*(n-300))'" -pix_fmt yuv420p -c:a copy -y diff_overlay.mp4


# zoomin
ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -filter:v "zoompan=z='min(max(zoom,pzoom)+0.0015,1.5)':d=100:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'" -ss 00:00:10 -t 5 zoomin.mp4

ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -filter:v "zoompan=z='if(lte(mod(time,10),3),2,1)':d=1:x=iw/2-(iw/zoom/2):y=ih/2-(ih/zoom/2):fps=30" -t 20 -y zoomin.mp4

# smooth
ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -filter:v "zoompan=z='min(max(zoom,pzoom)+0.015,1.5)':d=100:x=iw/2-(iw/zoom/2):y=ih/2-(ih/zoom/2):s=320*240" -t 20 -y zoomin.mp4


ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -filter:v "zoompan=z='if(lte(time,3),min(max(zoom,pzoom)+0.015,3),1)':d=1:x=iw/2-(iw/zoom/2):y=ih/2-(ih/zoom/2):s=320*240" -t 20 -y zoomin.mp4

# zoom 时运动 (d=1)
ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -vf "zoompan=z='if(lte(mod(time,10),3),2,1)':d=1:x=iw/2-(iw/zoom/2):y=ih/2-(ih/zoom/2):fps=30" -y lock_zoom.mp4

ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -vf "zoompan=z='min(max(zoom,pzoom)+0.015,1.5)':d=1:x=iw/2-(iw/pzoom/2):y=ih/2-(ih/pzoom/2):s=320*240,reverse" -y lock_zoom.mp4


# geq 应用1 （翻转）
# http://underpop.online.fr/f/ffmpeg/help/geq.htm.gz
ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4  -i /opt/application/tx-rtcStream/files/resources/image1.jpg -filter_complex "[1:v]geq='mod(p(W-X,Y)*3,255)',crop,scale=w=-1:h=100[rounded_overlay];[0:v][rounded_overlay]overlay=x=0:y=0" -c:a copy -y geq.mp4

# 斑马条纹：
# 128 + 100*sin(2*(PI/100)*(cos(PI/3)*(X-50*T) + sin(PI/3)*Y)):128:128
# 光球， nullsrc 是黑色背景视频
# random(1)/hypot(X-cos(N*0.07)*W/2-W/2\,Y-sin(N*0.09)*H/2-H/2)^2*1000000*sin(N*0.02):128:128
#
# (p(X,Y)+(256-p(X-4,Y-4)))/2
ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4  -i /opt/application/tx-rtcStream/files/resources/image1.jpg -filter_complex "nullsrc=s=320x240:d=10,geq='lum=random(1)/hypot(X-cos(N*0.07)*W/2-W/2\,Y-sin(N*0.09)*H/2-H/2)^2*1000000*sin(N*0.02):128:128'[rounded_overlay];[rounded_overlay]colorkey=0x000000:0.3:0.1[av];[0:v][av]overlay=x=0:y=0:enable='between(t,1,10)':alpha=1" -c:a copy -y geq.mp4

ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4  -i /opt/application/tx-rtcStream/files/resources/image1.jpg -filter_complex "[1:v]geq='lum=255*gauss((X/W-0.5)*3)*gauss((Y/H-0.5)*3)/gauss(0)/gauss(0)',format=gray[rounded_overlay];[rounded_overlay]colorkey=0x000000:0.3:0.1[av];[0:v][av]overlay=x=0:y=0:enable='between(t,1,10)':alpha=1" -c:a copy -y geq.mp4


# 列出所有像素格式
ffmpeg -pix_fmts

# side by side （左中右）
ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -i /opt/application/tx-rtcStream/files/resources/forest.mp4 -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -filter_complex "[0:v]crop=w=iw/2:h=ih:x=iw/2:y=0[0v];[2:v]crop=w=iw/2:h=ih:x=iw/2:y=0,geq='255-p(X,Y)'[2v];[1:v]scale=w=-1:h=240[1v];[0v]pad=iw*3:ih[int];[int][1v]overlay=W/3:0[vid];[vid][2v]overlay=2*W/3:0[vid2]" -map "[vid2]" -c:v libx264 -crf 23 -preset veryfast -y leftcenterright.mp4

# side by side （左上下）
ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -i /opt/application/tx-rtcStream/files/resources/forest.mp4 -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -filter_complex "[0:v]crop=w=iw/2:h=ih:x=iw/2:y=0[0v];[2:v]crop=w=iw/2:h=ih/2:x=iw/2:y=ih/2,geq='(255-p(X,Y))*random(1)*255'[2v];[1:v]scale=w=-1:h=120[1v];[0v]pad=iw*2:ih[int];[int][1v]overlay=W/2:0[vid];[vid][2v]overlay=W/2:H/2[vid2]" -map "[vid2]" -c:v libx264 -crf 23 -preset veryfast -y leftupdown.mp4

# zoom-out， 先 scale 放大，再缩小
ffmpeg -loop 1 -i /opt/application/tx-rtcStream/files/resources/image1.jpg -vf "scale=-4:4*ih,zoompan=z='if(lte(zoom,1.0),3,max(1.001,zoom-0.02))':d=150" -c:v libx264 -t 5  -y zoom_out.mp4

# 背景视频 concat (用 trim)
ffmpeg -t 15 -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -i /opt/application/tx-rtcStream/files/resources/40_input.mp4  -t 10 -i /opt/application/tx-rtcStream/files/resources/image1.jpg -filter_complex "[0:v]trim=0:5,setpts=PTS-STARTPTS,fade=t=out:st=4:d=1[bg1];[1:v]trim=5:15,setpts=PTS-STARTPTS,fade=t=in:st=5:d=1[bg2];[2:v]scale=-1:10[2v];[bg1][bg2]concat=n=2:v=1:a=0[bg];[bg][2v]overlay=10:10" -c:a copy -y mov_with_overlay.mp4

# 通过裁剪防抖
ffmpeg -i /opt/application/tx-rtcStream/files/resources/dog_couch_orig.jpg -filter_complex "zoompan=z=zoom+0.001:fps=30:s=1920x1080, crop=1920:1080:10:10" zoom_offset.mp4

# 改变播放速度 (0.5 代表 2 倍速， 2 代表 0.5 倍速, 时间变量是大写的 T)
# https://ffmpeg.org/ffmpeg-filters.html#setpts_002c-asetpts
# 如下并不能正确的加速部分视频，加速都是针对完整视频的，比如在 final cut pro 中，如果要加速视频的某个片段，首先必须从视频中剪切出来，然后再加速，最后再拼接回去
ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -filter:v "setpts='if(gte(T,5),0.5*PTS,PTS)'" -c:a copy -y speed.mp4

# 帧率
ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4   -filter:v "fps=2" -c:a copy  -y frame_rate.mp4

# 转场（dissolve, wipe, blur, circle, diagbl, zoomin效果）
# 要求 format / scale / fps / settb 一致
ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -i /opt/application/tx-rtcStream/files/resources/office10s.mp4 -filter_complex "[1:v]scale=320:240,setsar=1:1,fps=30,settb=1/15360[1v];[0:v][1v]xfade=transition=dissolve:duration=2:offset=3" -y ./files/synthesis/xfade_dissolve.mp4

# 定制化（custom）转场
# https://ffmpeg.org/ffmpeg-filters.html#xfade
ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -i /opt/application/tx-rtcStream/files/resources/forest.mp4 -filter_complex "[1:v]scale=320:240,setsar=1:1,fps=30,settb=1/15360[1v];[0:v][1v]xfade=transition=custom:expr='if(gt(P, abs(X/W - 0.5)), A, B)':duration=2:offset=3" -y ./files/synthesis/xfade_dissolve.mp4

# 叠加时延迟出现
ffmpeg -i /opt/application/tx-rtcStream/files/resources/40_input.mp4 -i /opt/application/tx-rtcStream/files/resources/40_input.mp4 -filter_complex "[1:v]setpts=PTS-STARTPTS+4/TB,scale=w='iw/3':h='ih/3'[v1];[0:v][v1]overlay=10:10" -c:a copy overlay_setpts.mp4

# 黑幕衔接制作背景
ffmpeg  -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -i  /opt/application/tx-rtcStream/files/resources/forest.mp4 -filter_complex "[0:v]trim=end=5,setpts=PTS-STARTPTS,fade=t=out:st=4:d=1[v1];[1:v]trim=start=0,setpts=PTS-STARTPTS+5/TB,scale=320:240,setsar=1:1,fps=30,settb=1/15360[v3]; [v1][v3]concat=n=2:v=1:a=0" -c:v libx264  -y concat_blank.mp4

# 黑色背景视频作为第0层
ffmpeg -f lavfi -i color=c=black:s=320x240:r=30:d=5 -i /opt/application/tx-rtcStream/files/resources/20_input.mp4  -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -filter_complex "[1:v]null[1v];[0:v][1v]overlay=0:0" -y black_bg.mp4

# 分屏 (黑底为背景，较快)
ffmpeg -f lavfi -i color=c=black:s=320x240:r=30:d=5 -i /opt/application/tx-rtcStream/files/resources/20_input.mp4  -ss 0 -t 20 -i /opt/application/tx-rtcStream/files/resources/forest.mp4 -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -filter_complex "[1:v]crop=iw/3:ih:2*iw/3:0[1v];[2:v]crop=iw/3:ih:2*iw/3:0[2v];[3:v]crop=2*iw/4:ih/2:iw/2:ih/3[3v];[0:v][1v]overlay=0:0[ov1];[ov1][2v]overlay=W/3[ov2];[ov2][3v]overlay=W/3:H/2" -y -r 12 black_bg.mp4

# 用 xstack 生成 mosaic 效果 （源视频大小不一时非常非常慢）
ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -i /opt/application/tx-rtcStream/files/resources/video2.mp4 -filter_complex "[0:v]null[bg0]; [1:v]crop=iw:ih/2[bg1]; [2:v]scale=iw:ih/2[bg2];[bg0][bg1][bg2]xstack=inputs=3:layout=0_0|w0_0|w0_h1" -y xstack.mp4


# 黑底背景分屏加转场
ffmpeg  -i /opt/application/tx-rtcStream/files/resources/20_input.mp4  -ss 0 -t 20 -i /opt/application/tx-rtcStream/files/resources/forest.mp4 -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -i /opt/application/tx-rtcStream/files/resources/video2.mp4 -filter_complex "color=c=black:s=320x240:r=30:d=5[bg];[0:v]crop=iw/3:ih:2*iw/3:0[0v];[1:v]crop=iw/3:ih:2*iw/3:0[1v];[2:v]crop=2*iw/4:ih/2:iw/2:ih/3[2v];[bg][0v]overlay=0:0[ov0];[ov0][1v]overlay=W/3[ov1];[ov1][2v]overlay=W/3:H/2,settb=expr='1/20'[bg0];[3:v]scale=320:240,setsar=sar='1:1',fps=fps=30,settb=1/20[3v];[4:v]scale=320:240,setsar=1:1,fps=30,settb=1/20[4v];[bg0][3v]xfade=transition=circleclose:duration=2:offset=13[bg1];[bg1][4v]xfade=transition=custom:expr='if(gt(P, abs(X/W - 0.5)), A, B)':duration=1:offset=23" -y -r 12 black_bg.mp4


ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4  -filter_complex "[0:v]null[0v];[0v][0v]concat=n=2:v=1:a=0" -y concat_same.mp4

ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -vf "geq=r='X/W*r(X,Y)':g='(1-X/W)*g(X,Y)':b='(H-Y)/H*b(X,Y)'" -y geq.mp4

ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -vf "geq=lum_expr='(p(X,Y)+(256-p(X-4,Y-4)))/2'" -y geq_emboss.mp4

ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -vf "geq=lum_expr='p(X,Y)*gauss((X/W-0.5)*3)*gauss((Y/H-0.5)*3)/gauss(0)/gauss(0)'" -y geq_emboss.mp4


# 剪映工程文件在 C:\Users\eddie\AppData\Local\JianyingPro\User Data\Projects 可以看到具体的工程信息

ffmpeg  -re -i /opt/application/tx-rtcStream/files/resources/40_input.mp4 -re -i /opt/application/tx-rtcStream/files/resources/forest.mp4 -re -i /opt/application/tx-rtcStream/files/resources/dog_couch_orig.jpg -re -i /opt/application/tx-rtcStream/files/resources/dh.mp4  -re -ss 5 -t 30 -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -filter_complex "color=c=blue:s=640x480:r=30:d=50[blackBg];[0:v]null[region_0.0.0];[1:v]null[region_0.0.1];[2:v]null[region_0.0.2];[3:v]null[region_3.0.1];[region_0.0.0]geq=lum='(lum(X,Y)+(256-lum(X-4,Y-4)))/2':cr='(cr(X,Y)+(256-cr(X-6,Y-6)))/2':cb='(cb(X,Y)+(256-cb(X-8,Y-8)))/2',crop=w=iw/3:h=ih:x=2*iw/3:y=0,scale=w=214:h=480[region_0.0.0_prepro];[region_0.0.1]scale=w=428:h=240[region_0.0.1_prepro];[region_0.0.2]crop=w=iw:h=ih:x=0:y=0,zoompan=z='if(between(time,0,6),min(max(zoom,pzoom)+0.015,4),1)':d=480:x=1*iw/3-(1*iw/zoom/3):y=2*ih/4-(2*ih/zoom/4),scale=w=428:h=240[region_0.0.2_prepro];[region_3.0.1]crop=w=300:h=300:x=130:y=130,scale=w=100:h=100,chromakey=color=0x00ff00:similarity=0.3:blend=0.05[region_3.0.1_prepro];[blackBg][region_0.0.0_prepro]overlay=0:0[out0];[out0][region_0.0.1_prepro]overlay=x=W/3:y=0[out1];[out1][region_0.0.2_prepro]overlay=x=W/3:y=H/2,settb='1/20'[out2];[4:v]scale=640:480,setsar=1:1,fps=30,settb=1/20[7v];[out2][7v]xfade=transition=circleclose:duration=2:offset=15[trans0];[trans0][region_3.0.1_prepro]overlay=x='if(between(t,0,5),0,if(between(t,5,10),(500/5/30)*(n-150),500))':y='if(gte(t,0)*lt(t,10),(H-h),if(between(t,10,12),(H-h)-(H-h-0)/2/30*(n-300),0))'[out3];[out3]subtitles=filename=/opt/application/tx-rtcStream/files/resources/subtitles.srt:force_style='Fontsize=18,PrimaryColour=&H0230bf&'[outText_region_3.0.0]" -map "[outText_region_3.0.0]" -c:v libx   -b:v 500k -deadline 1 -cpu-used 2 -r 30 -vsync drop -auto-alt-ref 0 -y aha.mp4

# LUT （look up table) 调色
# https://www.rocketstock.com/free-after-effects-templates/35-free-luts-for-color-grading-videos/
ffmpeg -i /opt/application/tx-rtcStream/files/resources/image2.jpg -vf lut3d="/opt/dev/rtcSdk/files/LUT/McKinnon 75.CUBE" -y lut.jpg


ffmpeg -i input.mp4 -vf vidstabdetect=stepsize=6:shakiness=8:accuracy=9:result=transform_vectors.trf -f null -
ffmpeg -i input.mp4 -vf vidstabtransform=input=transform_vectors.trf:zoom=1:smoothing=30,unsharp=5:5:0.8:3:3:0.4 -vcodec libx264 -preset slow -tune film -crf 18 output.mp4

# 在视频前后增加黑色 （slug），tpad 滤镜， 可以用以非零点的视频合成
ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -filter_complex "tpad=stop_duration=20:start_duration=20:color=red,fade=type=in:st=20:d=2,fade=type=out:st=38:d=2" -y tpad.mp4

ffmpeg -ss 20 -t 10 -i /opt/application/tx-rtcStream/files/resources/稻香.mp3 -ss 30 -t 10 -i /opt/application/tx-rtcStream/files/resources/彩虹.mp3 -filter_complex "[1]asetpts=PTS+3000/TB[a1];[0][a1]amix=inputs=2:weights='5 1'" -y amix.mp3


# 延迟视频中的音频
ffmpeg -i /opt/application/tx-rtcStream/files/resources/audio_10sOffice.mp4 -af "asetpts='if(lt(T\,0.1),PTS,PTS+4/TB)',aresample=async=1" -c:v copy -y asetpts.mp4
ffmpeg -i /opt/application/tx-rtcStream/files/resources/audio_10sOffice.mp4 -filter_complex "asetpts= PTS+4/TB" -c:v copy -y asetpts.mp4
ffmpeg -i /opt/application/tx-rtcStream/files/resources/audio_10sOffice.mp4 -i /opt/application/tx-rtcStream/files/resources/audio_10sOffice.mp4  -filter_complex "[0:a]adelay=2000|2000[a1]; [1:a]adelay=5000|50   00[a2]; [a1][a2]amix=inputs=2:duration=longest[out]" -map "[out]" -y adelay.mp3


ffmpeg -ss 20 -t 10 -i /opt/application/tx-rtcStream/files/resources/稻香.mp3 -ss 30 -t 10 -i /opt/application/tx-rtcStream/files/resources/彩虹.mp3 -filter_complex "[0]afade=t=out:st=7:d=3,apad=pad_dur=3[a0];[a0][1]concat=n=2:v=0:a=1" -y concat_apad.mp3

# 对齐音视频（自动在音频尾部添加静音）
ffmpeg  -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -ss 20 -t 10 -i /opt/application/tx-rtcStream/files/resources/稻香.mp3 -filter_complex "[1:0]apad" -shortest audio_align.mp4

#在音频头部添加静音（aevalsrc, concat)
ffmpeg -ss 20 -t 10 -i /opt/application/tx-rtcStream/files/resources/稻香.mp3 -filter_complex "aevalsrc=0:d=5[s];[s][0:a]concat=n=2:v=0:a=1" -y audio_aevalsrc.mp3

# 音频转场
ffmpeg -ss 20 -t 10 -i /opt/application/tx-rtcStream/files/resources/稻香.mp3 -ss 30 -t 10 -i /opt/application/tx-rtcStream/files/resources/彩虹.mp3 -filter_complex "[0][1]acrossfade=duration=2:curve1=hsin:curve2=log" -y audio_acrossfade.mp3


# 改变音频音量（volume , between)
ffmpeg -ss 20 -t 10 -i /opt/application/tx-rtcStream/files/resources/稻香.mp3 -ss 30 -t 10 -i /opt/application/tx-rtcStream/files/resources/彩虹.mp3 -filter_complex "[0]volume=4:enable='between(t,2,5)'[a0];[a0][1]acrossfade=duration=2:curve1=hsin:curve2=log" -y audio_volume.mp3

ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -i /opt/application/tx-rtcStream/files/resources/mask.png -filter_complex "[1:v]geq='if(gt(lum(X,Y),128),255,0)',scale=320:240[mask];[0:v][mask]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2" -c:a copy -y mask_geq.mp4


ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -i /opt/application/tx-rtcStream/files/resources/mask.png -filter_complex "[1:v]scale=320:240[mask];[0:v][mask]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2:enable='gt(alpha,0)'" -c:a copy -y mask_geq.mp4


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
