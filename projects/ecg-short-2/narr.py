# SHORT (9:16) — Bài 2 · Lớn nhĩ & Phì đại thất: 4 chữ CAO – RỘNG – CỘNG – LẬT
NARR = [
  [("Nhìn ECG, đoán buồng tim nào đang to?", "Nhìn điện tâm đồ, đoán buồng tim nào đang to? Chỉ cần nhớ bốn chữ.")],
  [("Nhĩ xem P · Thất xem QRS", "Nhĩ thì xem sóng P, thất thì xem phức bộ QRS.")],
  [("① Lớn nhĩ phải → P CAO > 2,5 mm ở DII", "Một, lớn nhĩ phải: sóng P cao, trên hai phẩy năm mi li mét ở chuyển đạo hai.")],
  [("② Lớn nhĩ trái → P RỘNG > 0,11 s, hai đỉnh", "Hai, lớn nhĩ trái: sóng P rộng, trên không phẩy mười một giây, có hai đỉnh.")],
  [("③ Phì đại thất trái → CỘNG: S V1 + R V5 ≥ 35 mm", "Ba, phì đại thất trái thì cộng: S vê một cộng R vê năm, từ ba mươi lăm mi li mét.")],
  [("④ Phì đại thất phải → LẬT: V1 R > S", "Bốn, phì đại thất phải thì lật: ở vê một, R lớn hơn S.")],
  [("CAO – RỘNG – CỘNG – LẬT", "Nhắc lại nhé: cao, rộng, cộng, lật. Và nhớ, siêu âm tim mới khẳng định.")],
  [("Lưu lại để ôn · xem bài đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài đầy đủ trên kênh nhé.")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
