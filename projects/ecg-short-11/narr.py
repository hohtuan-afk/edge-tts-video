# SHORT (9:16) — Bài 11 · Những kẻ giả dạng ST chênh lên: CHÊNH ≠ TẮC
NARR = [
  [("ST chênh lên = TẮC mạch? CHƯA CHẮC! 4 câu hỏi nhận ra kẻ giả dạng", "S T chênh lên có phải luôn là tắc mạch vành? Chưa chắc! Bốn câu hỏi để nhận ra kẻ giả dạng.")],
  [("① LAN TOẢ? Chênh khắp nơi, không theo 1 vùng → nghĩ GIẢ DẠNG", "Một, lan toả? Chênh ở khắp nơi, không theo một vùng mạch vành, hãy nghĩ đến kẻ giả dạng như viêm màng ngoài tim.")],
  [("② SOI GƯƠNG? Có ST chênh xuống đối diện → nghĩ TẮC thật", "Hai, soi gương? Có S T chênh xuống ở vùng đối diện, hãy nghĩ đến tắc thật.")],
  [("③ HÌNH DẠNG? Lõm + PR ↓ · khấc J · V1 dạng vòm (Brugada)", "Ba, hình dạng? S T lõm kèm P R chênh xuống, khấc J ở người trẻ, hay dạng vòm ở vê một của Bru-ga-đa.")],
  [("④ BỐI CẢNH? Tuổi · sốt · ECG cũ · còn nghi ngờ → coi như TẮC", "Bốn, bối cảnh? Tuổi, sốt, và điện tâm đồ cũ. Còn nghi ngờ thì coi như tắc, và làm lại điện tâm đồ.")],
  [("CHÊNH ≠ TẮC · LAN TOẢ – SOI GƯƠNG – HÌNH DẠNG – BỐI CẢNH", "Nhắc lại: chênh không đồng nghĩa với tắc. Lan toả, soi gương, hình dạng, bối cảnh.")],
  [("Lưu lại để ôn · xem bài đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài đầy đủ trên kênh nhé.")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
