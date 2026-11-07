# Giải mã khí máu · Short 3: PaO₂ 90 mà vẫn nguy kịch? (9:16)
NARR = [
  [("PaO₂ 90: bình thường hay nguy kịch?", "Pê a ô hai chín mươi. Bình thường, hay nguy kịch?")],
  [("Câu trả lời: còn tuỳ FiO₂, oxy bệnh nhân đang thở", "Câu trả lời là còn tuỳ ép i ô hai, tức nồng độ ô xy bệnh nhân đang thở.")],
  [("P/F = PaO₂ ÷ FiO₂", "Hãy tính tỉ số pê trên ép, bằng pê a ô hai chia cho ép i ô hai.")],
  [("Thở khí trời (0,21): P/F ≈ 430 · bình thường", "Thở khí trời, ép i ô hai không phẩy hai mốt, pê trên ép khoảng bốn trăm ba mươi. Bình thường.")],
  [("Thở oxy 100% (1,0): P/F = 90 · rất nặng", "Thở ô xy một trăm phần trăm, pê trên ép chỉ còn chín mươi. Rất nặng.")],
  [("Nếu là ARDS: P/F ≤ 100 là mức nặng", "Nếu là suy hô hấp cấp tiến triển, pê trên ép từ một trăm trở xuống là mức nặng.")],
  [("Lưu lại để ôn · xem Bài 3 đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài ba đầy đủ trên kênh nhé!")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
