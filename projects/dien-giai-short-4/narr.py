# Giải mã điện giải · Short 4: Na⁺ 162 — thiếu bao nhiêu lít nước? (9:16)
NARR = [
  [("Na⁺ 162: thiếu bao nhiêu lít nước?", "Na tri một trăm sáu mươi hai, cơ thể thiếu bao nhiêu lít nước?")],
  [("Nước thiếu = nước cơ thể × (Na⁺ ÷ 140 − 1)", "Công thức: nước cơ thể nhân với, na tri chia một trăm bốn mươi, trừ một.")],
  [("Người già 60 kg → nước cơ thể ≈ 30 L", "Người già sáu mươi ký, nước cơ thể khoảng ba mươi lít.")],
  [("30 × (162 ÷ 140 − 1) ≈ 4,7 L", "Ba mươi nhân với, một trăm sáu mươi hai chia một trăm bốn mươi trừ một, khoảng bốn phẩy bảy lít.")],
  [("Bù dần ~48 giờ · ưu tiên nước lọc qua đường tiêu hoá", "Bù dần trong khoảng bốn mươi tám giờ, ưu tiên nước lọc qua đường tiêu hoá.")],
  [("Mạn tính: hạ ~10 mmol/L mỗi 24 giờ", "Thể mạn, hạ khoảng mười mi li mol trên lít mỗi hai mươi bốn giờ.")],
  [("Lưu lại để ôn · xem Bài 4 đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài bốn đầy đủ trên kênh nhé!")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
