# Giải mã khí máu · Short 4: Công thức Winter (9:16)
NARR = [
  [("Toan chuyển hoá: phổi đã bù đủ chưa?", "Toan chuyển hoá. Phổi đã bù đủ chưa? Chỉ cần mười giây.")],
  [("Winter: PaCO₂ dự kiến = 1,5 × HCO₃⁻ + 8 ± 2", "Dùng công thức Uyn-tơ: pê a xê ô hai dự kiến bằng một phẩy năm nhân bi các bô nát, cộng tám, cộng trừ hai.")],
  [("HCO₃⁻ 12 → 1,5 × 12 + 8 = 26 → khoảng 24–28", "Ví dụ bi các bô nát mười hai: một phẩy năm nhân mười hai, cộng tám, bằng hai mươi sáu. Khoảng dự kiến từ hai mươi bốn đến hai mươi tám.")],
  [("PaCO₂ trong khoảng → bù đủ", "Pê a xê ô hai nằm trong khoảng này: bù đủ.")],
  [("PaCO₂ cao hơn → có thêm toan hô hấp", "Cao hơn khoảng dự kiến: có thêm toan hô hấp.")],
  [("PaCO₂ thấp hơn → có thêm kiềm hô hấp", "Thấp hơn khoảng dự kiến: có thêm kiềm hô hấp.")],
  [("Lưu lại để ôn · xem Bài 4 đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài bốn đầy đủ trên kênh nhé!")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
