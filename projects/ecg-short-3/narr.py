# SHORT (9:16) — Bài 3 · Block nhĩ thất: Tìm P – Đo PR – Xem RƠI
NARR = [
  [("Block nhĩ thất: nhìn 1 dải nhịp là biết độ mấy!", "Block nhĩ thất, nhìn một dải nhịp là biết độ mấy. Nhớ ba bước: tìm P, đo PR, xem rơi.")],
  [("① Độ I: PR > 0,20 s, cố định — dài mà KHÔNG RƠI", "Một, block độ một: PR dài hơn không phẩy hai mươi giây, cố định. Dài mà không rơi.")],
  [("② Mobitz I: PR dài dần… rồi RƠI", "Hai, Mô-bít một: PR dài, dài, dài, rồi rơi.")],
  [("③ Mobitz II: PR cố định… bỗng RƠI", "Ba, Mô-bít hai: PR cố định, đang yên bỗng rơi.")],
  [("④ Độ III: P đi đường P, QRS đi đường QRS", "Bốn, block độ ba: P đi đường P, QRS đi đường QRS, nhĩ nhanh hơn thất.")],
  [("Tìm P – Đo PR – Xem RƠI", "Nhắc lại nhé: tìm P, đo PR, xem rơi.")],
  [("Lưu lại để ôn · xem bài đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài đầy đủ trên kênh nhé.")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
