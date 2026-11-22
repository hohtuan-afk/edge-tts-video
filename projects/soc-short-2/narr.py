# Giải mã sốc · Short 2: 4 kiểu sốc trong 30 giây (9:16)
NARR = [
  [("4 kiểu sốc trong 30 giây", "Bốn kiểu sốc, nhớ trong ba mươi giây.")],
  [("Tuần hoàn = BƠM · ỐNG · NƯỚC", "Tuần hoàn giống hệ thống nước: bơm là tim, ống là mạch máu, nước là thể tích máu.")],
  [("① Thiếu nước → GIẢM THỂ TÍCH", "Thiếu nước: sốc giảm thể tích, như mất máu, tiêu chảy.")],
  [("② Bơm hỏng → SỐC TIM", "Bơm hỏng: sốc tim, như nhồi máu cơ tim.")],
  [("③ Bị chặn → TẮC NGHẼN", "Bị chặn: sốc tắc nghẽn, như thuyên tắc phổi, chèn ép tim.")],
  [("④ Ống giãn → PHÂN BỐ", "Ống giãn: sốc phân bố, hay gặp nhất là nhiễm khuẩn.")],
  [("Lưu lại để ôn · xem Bài 2 đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài hai đầy đủ trên kênh nhé!")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
