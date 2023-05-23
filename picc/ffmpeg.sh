ffmpeg -loop 1 -t 5 -i  ppt-1.jpg -loop 1 -t 3 -i  http://upload-bucket-test.oss-cn-shanghai.aliyuncs.com/cvsuat/63fdd59398706e0017542ec2-1679650425542.jpg -filter_complex "[0:v]fps=25[a];[1:v]fps=25,scale=1280x720[b];[a][b]concat=n=2:v=1:a=0[outv]" -map "[outv]" -y output.mp4

ffmpeg -r 1 -pattern_type glob -i '*.jpg' -c:v libx264 -r 30 -pix_fmt yuv420p -y out.mp4

# 从图片合成视频 （只能 .png)
ffmpeg -framerate 1/3 -pattern_type glob -i '*.png' -c:v libx264 -r 30 -pix_fmt yuv420p -vf "scale=1280:720" -y out.mp4