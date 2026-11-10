# Giải mã khí máu · Short 7: Khí máu "hoàn hảo" mà vẫn có 2 rối loạn? (9:16)
NARR = [
  [("Khí máu \"hoàn hảo\" mà vẫn có 2 rối loạn?", "Một phiếu khí máu hoàn hảo, mà bệnh nhân lại có tới hai rối loạn?")],
  [("pH 7,40 · PaCO₂ 40 · HCO₃⁻ 24", "Pê hát bảy phẩy bốn, pê a xê ô hai bốn mươi, bi các bô nát hai mươi tư. Tất cả đều bình thường.")],
  [("Nhưng Na⁺ 140 · Cl⁻ 90 → AG = 26", "Nhưng na tri một trăm bốn mươi, clo chín mươi. Khoảng trống a ni on bằng hai mươi sáu, tăng.")],
  [("AG tăng → có nhiễm toan ceton", "Khoảng trống a ni on tăng: có nhiễm toan xê tôn.")],
  [("HCO₃⁻ không giảm → thêm kiềm chuyển hoá do nôn", "Nhưng bi các bô nát không giảm, nghĩa là có thêm kiềm chuyển hoá do nôn ói.")],
  [("Triệt tiêu nhau → pH bình thường · luôn tính AG!", "Hai rối loạn triệt tiêu nhau, nên pê hát vẫn bình thường. Luôn tính khoảng trống a ni on!")],
  [("Lưu lại để ôn · xem Bài 7 đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài bảy đầy đủ trên kênh nhé!")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
