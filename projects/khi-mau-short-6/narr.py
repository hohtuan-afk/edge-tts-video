# Giải mã khí máu · Short 6: Cùng PaCO₂ 60, sao pH khác nhau? (9:16)
NARR = [
  [("Cùng PaCO₂ 60, sao pH lại khác nhau?", "Hai người cùng pê a xê ô hai sáu mươi. Sao pê hát lại khác nhau?")],
  [("D: quá liều opioid · pH 7,26 · HCO₃⁻ 26", "Người D quá liều ô pi ô ít: pê hát bảy phẩy hai sáu, bi các bô nát hai mươi sáu.")],
  [("E: COPD ổn định · pH 7,34 · HCO₃⁻ 31", "Người E bị bệnh phổi tắc nghẽn mạn tính: pê hát bảy phẩy ba tư, bi các bô nát ba mươi mốt.")],
  [("Thận bù bằng cách giữ HCO₃⁻ · cần 3–5 ngày", "Bí mật nằm ở thận: thận giữ bi các bô nát để bù, nhưng cần ba đến năm ngày.")],
  [("D: cấp, thận chưa kịp bù → pH thấp", "Người D bị cấp, thận chưa kịp bù, nên pê hát rất thấp.")],
  [("E: mạn, thận đã bù → pH gần bình thường", "Người E bị mạn, thận đã bù, nên pê hát gần bình thường.")],
  [("Lưu lại để ôn · xem Bài 6 đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài sáu đầy đủ trên kênh nhé!")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
