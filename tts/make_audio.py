"""Đọc tts/lines.json và tạo từng file MP3 bằng Microsoft Edge TTS vào thư mục audio/."""
import asyncio, json, os, sys
import edge_tts

cfg = json.load(open("tts/lines.json", encoding="utf-8"))
OUT = "audio"
os.makedirs(OUT, exist_ok=True)


async def one(item):
    path = os.path.join(OUT, item["id"] + ".mp3")
    for attempt in range(5):
        try:
            await edge_tts.Communicate(item["text"], cfg["voice"], rate=cfg["rate"], pitch=cfg["pitch"]).save(path)
            if os.path.getsize(path) > 1000:
                return True
        except Exception as e:
            print("retry", item["id"], e, flush=True)
        await asyncio.sleep(3 + attempt * 4)
    return False


async def main():
    failed = []
    for k, item in enumerate(cfg["lines"], 1):
        ok = await one(item)
        print(f"[{k}/{len(cfg['lines'])}] {item['id']} {'ok' if ok else 'FAILED'}", flush=True)
        if not ok:
            failed.append(item["id"])
    if failed:
        sys.exit("failed: " + ", ".join(failed))

asyncio.run(main())
