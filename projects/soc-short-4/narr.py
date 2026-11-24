# Giải mã sốc · Short 4: Nâng chân 1 phút (9:16)
NARR = [
  [("Nâng chân 1 phút: còn nên truyền dịch?", "Nâng chân một phút, biết ngay còn nên truyền dịch hay không.")],
  [("Chỉ ~50% bệnh nhân sốc còn đáp ứng dịch", "Chỉ khoảng một nửa bệnh nhân sốc còn đáp ứng với dịch. Truyền thừa sẽ gây phù.")],
  [("Nửa ngồi → nằm ngửa, nâng chân 45°", "Từ tư thế nửa ngồi, hạ thân và nâng hai chân bốn mươi lăm độ.")],
  [("~300 mL máu dồn về tim", "Khoảng ba trăm mi li lít máu dồn về tim, như một liều dịch thử.")],
  [("Cung lượng tim tăng ≥ 10% → CÒN ĐÁP ỨNG", "Đo cung lượng tim trong một phút. Tăng từ mười phần trăm trở lên là còn đáp ứng.")],
  [("Lưu lại để ôn · xem Bài 4 đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài bốn đầy đủ trên kênh nhé!")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
