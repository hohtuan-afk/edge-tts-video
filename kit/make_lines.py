"""Tạo tts/lines.json (đầu vào cho GitHub Action Edge TTS) từ narr.py của một dự án.

Dùng:  python3 kit/make_lines.py projects/<ten-du-an> [giong] [toc-do]
  giong:  vi-VN-HoaiMyNeural (nữ, mặc định) | vi-VN-NamMinhNeural (nam)
  toc-do: "-5%" (mặc định), "-10%", "+0%"
"""
import importlib.util, json, os, sys

proj = sys.argv[1]
voice = sys.argv[2] if len(sys.argv) > 2 else "vi-VN-HoaiMyNeural"
rate = sys.argv[3] if len(sys.argv) > 3 else "-5%"
spec = importlib.util.spec_from_file_location("narr", os.path.join(proj, "narr.py"))
narr = importlib.util.module_from_spec(spec)
spec.loader.exec_module(narr)
lines = [{"id": f"{i:02d}-{j}", "text": sp} for i, sc in enumerate(narr.NARR) for j, (_, sp) in enumerate(sc)]
os.makedirs("tts", exist_ok=True)
json.dump({"voice": voice, "rate": rate, "pitch": "+0Hz", "lines": lines},
          open("tts/lines.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(lines), "câu ->", "tts/lines.json", voice, rate)
