#!/usr/bin/env bash
# Ghép video câm + lời đọc + nhạc nền tự nhỏ đi khi có lời (sidechain ducking), chuẩn hoá -16 LUFS.
# Dùng: bash kit/mux.sh <video_cam.mp4> <narration.wav> <dau_ra.mp4>
set -euo pipefail
V="$1"; N="$2"; OUT="$3"
DIR="$(cd "$(dirname "$0")" && pwd)"
TMP="$(mktemp -d)"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$N")
python3 "$DIR/pad.py" "$(python3 -c "print(float('$DUR')+1)")" "$TMP/pad.wav"
ffmpeg -v error -y -i "$N" -i "$TMP/pad.wav" -filter_complex \
 "[0]aresample=48000,highpass=f=70,equalizer=f=200:t=q:w=1:g=1.5,acompressor=threshold=-20dB:ratio=2.5:attack=10:release=150:makeup=1.5,pan=stereo|c0=c0|c1=c0,asplit[v][sc];\
[1]lowpass=f=2500,volume=0.13[m];[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=30:release=700[md];\
[v][md]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000" -c:a aac -b:a 160k -ar 48000 "$TMP/mix.m4a"
ffmpeg -v error -y -i "$V" -i "$TMP/mix.m4a" -map 0:v -map 1:a -c copy -shortest -movflags +faststart "$OUT"
rm -rf "$TMP"
ffprobe -v error -show_entries stream=codec_type,duration -of compact "$OUT"
