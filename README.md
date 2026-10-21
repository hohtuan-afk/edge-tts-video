# edge-tts-video

Bộ công cụ làm **video hoạt hình y khoa có thuyết minh tiếng Việt** (giọng Microsoft Edge TTS chạy trên GitHub Actions).

## Cấu trúc
- `projects/<ten>/narr.py` — lời thuyết minh: `NARR[cảnh] = [(phụ đề, lời đọc), ...]` + `SCENE_DUR`.
- `projects/<ten>/render.py` — vẽ hoạt hình bằng PIL, xuất MP4 1080p qua ffmpeg (ví dụ: `projects/suy-ho-hap`).
- `tts/lines.json` + `.github/workflows/tts.yml` — push lên `main` là GitHub tự đọc từng câu bằng Edge TTS và commit MP3 vào `audio/`.
- `kit/make_lines.py` — narr.py → tts/lines.json (chọn giọng, tốc độ).
- `kit/build_timing.py` — audio/*.mp3 → timing.json + narration.wav.
- `kit/asr_check.sh` — nghe lại bằng nhận dạng giọng nói tiếng Việt offline để soát phát âm.
- `kit/mux.sh` — ghép video + lời đọc + nhạc nền tự nhỏ khi có lời.

## Remotion (đồ hoạ 2D đẹp, render trên GitHub Actions)
- `remotion/src/lib.tsx` — bộ thành phần dùng chung: Glass, Chip, Memo, Header, Roadmap; SVG Tube, Flow, Lungs, Machine, Circuit, Humid, Trap, TempTag, Badge, XMark, Fan, Bact.
- `remotion/src/scenes.tsx` — các cảnh của bài đang dựng (bản lưu của từng bài: `projects/<ten>/remotion/`).
- `kit/remotion_prep.py projects/<ten>` — sinh `remotion/src/data.json`, `remotion/public/narration.m4a`, `remotion/stills.txt`.
- `remotion/render-mode.txt` = `stills` | `video`; push `remotion/**` là workflow **Remotion render** chạy, kết quả nằm ở nhánh `renders`.

## Quy trình
```bash
python3 kit/make_lines.py projects/<ten> vi-VN-HoaiMyNeural -5%
git rm -rq audio; git add -A; git commit -m "TTS <ten>"; git push      # Action chạy ~3 phút
gh run watch <id> -R hohtuan-afk/edge-tts-video; git pull
python3 kit/build_timing.py projects/<ten> audio
python3 projects/<ten>/render.py projects/<ten>/silent.mp4
bash kit/mux.sh projects/<ten>/silent.mp4 projects/<ten>/narration.wav <ten>.mp4
```
