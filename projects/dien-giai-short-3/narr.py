# Giải mã điện giải · Short 3: Hạ natri — quy tắc 5 · 10 · 8 (9:16)
NARR = [
  [("Hạ natri: quy tắc 5 · 10 · 8", "Xử trí hạ na tri, nhớ quy tắc năm, mười, tám.")],
  [("5 · triệu chứng nặng: NaCl 3%, tăng ~5", "Năm: có triệu chứng nặng, truyền na tri clo rua ba phần trăm, tăng khoảng năm để cứu não.")],
  [("10 · không quá 10 trong 24 giờ đầu", "Mười: không tăng quá mười trong hai mươi bốn giờ đầu.")],
  [("8 · không quá 8 mỗi 24 giờ sau", "Tám: không quá tám cho mỗi hai mươi bốn giờ tiếp theo.")],
  [("Nâng quá nhanh → huỷ myelin thẩm thấu", "Vì nâng quá nhanh có thể gây hội chứng huỷ mi ê lin thẩm thấu.")],
  [("Nước tiểu > 100 mL/giờ → thử lại Na⁺ ngay!", "Nước tiểu trên một trăm mi li lít mỗi giờ? Thử lại na tri ngay!")],
  [("Lưu lại để ôn · xem Bài 3 đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài ba đầy đủ trên kênh nhé!")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
