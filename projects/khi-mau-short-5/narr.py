# Giải mã khí máu · Short 5: Tiêu chảy gây toan mà AG bình thường? (9:16)
NARR = [
  [("Tiêu chảy gây toan, mà AG lại bình thường?", "Tiêu chảy gây toan chuyển hoá, nhưng khoảng trống a ni on lại bình thường. Vì sao?")],
  [("Dịch ruột chứa nhiều HCO₃⁻", "Dịch ruột chứa rất nhiều bi các bô nát.")],
  [("Tiêu chảy → mất HCO₃⁻ → toan máu", "Tiêu chảy làm mất bi các bô nát, nên máu bị toan.")],
  [("Không có acid lạ · Cl⁻ tăng bù chỗ trống", "Không có a xít lạ nào. Clo tăng lên để bù vào chỗ trống.")],
  [("AG giữ nguyên → toan tăng Clo", "Vì vậy khoảng trống a ni on giữ nguyên. Gọi là toan tăng clo.")],
  [("Ngược lại: sốc, toan ceton → thêm acid → AG tăng", "Ngược lại, sốc hay nhiễm toan xê tôn thêm a xít vào máu, làm khoảng trống a ni on tăng.")],
  [("Lưu lại để ôn · xem Bài 5 đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài năm đầy đủ trên kênh nhé!")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
