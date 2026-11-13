# Giải mã điện giải · Short 2: Hạ natri — 4 câu hỏi chẩn đoán (9:16)
NARR = [
  [("Hạ natri: 4 câu hỏi chẩn đoán", "Hạ na tri máu? Chẩn đoán bằng bốn câu hỏi.")],
  [("① ALTT máu thấp? → hạ natri THẬT", "Một: áp lực thẩm thấu máu có thấp không? Thấp mới là hạ na tri thật.")],
  [("② ALTT niệu < 100 → uống quá nhiều nước", "Hai: áp lực thẩm thấu niệu. Dưới một trăm là uống quá nhiều nước.")],
  [("③ Na⁺ niệu ≤ 30 → thận đang giữ muối", "Ba: na tri niệu. Từ ba mươi trở xuống là thận đang giữ muối.")],
  [("④ Thể tích: giảm · bình thường · tăng", "Bốn: đánh giá thể tích, giảm, bình thường, hay tăng.")],
  [("Na⁺ niệu > 30 + thể tích bình thường → nghĩ SIAD", "Na tri niệu trên ba mươi, thể tích bình thường, nghĩ đến hội chứng tiết a đê hát không thích hợp.")],
  [("Lưu lại để ôn · xem Bài 2 đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài hai đầy đủ trên kênh nhé!")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
