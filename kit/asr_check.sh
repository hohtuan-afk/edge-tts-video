#!/usr/bin/env bash
# Nhận dạng tiếng Việt offline để kiểm tra phát âm của các file âm thanh (so với lời đọc mong muốn).
# Lần đầu tự tải runtime sherpa-onnx + mô hình ASR tiếng Việt từ GitHub Releases vào ~/tts.
# Dùng: bash kit/asr_check.sh audio/01-1.mp3 audio/07-2.mp3 ...   (nên ≤ 3 file mỗi lần để tránh hết RAM)
set -euo pipefail
T=~/tts; mkdir -p $T; cd $T
V=1.12.20
RT=$T/sherpa-onnx-v$V-linux-x64-shared
A=$T/sherpa-onnx-zipformer-vi-int8-2025-04-20
[ -d $RT ] || { curl -sL -o rt.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/v$V/sherpa-onnx-v$V-linux-x64-shared.tar.bz2 && tar xjf rt.tar.bz2; }
[ -d $A ] || { curl -sL -o asr.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-zipformer-vi-int8-2025-04-20.tar.bz2 && tar xjf asr.tar.bz2; }
cd - >/dev/null
for f in "$@"; do
  w=$(mktemp --suffix .wav); ffmpeg -v error -y -i "$f" -ar 16000 -ac 1 "$w"
  printf '%s: ' "$f"
  LD_LIBRARY_PATH=$RT/lib $RT/bin/sherpa-onnx-offline --tokens=$A/tokens.txt \
    --encoder=$A/encoder-epoch-12-avg-8.int8.onnx --decoder=$A/decoder-epoch-12-avg-8.onnx \
    --joiner=$A/joiner-epoch-12-avg-8.int8.onnx "$w" 2>&1 | grep -o '"text": "[^"]*"' | cut -d'"' -f4
  rm -f "$w"
done
