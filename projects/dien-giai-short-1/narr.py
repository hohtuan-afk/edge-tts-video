# Giải mã điện giải · Short 1: Natri 125 có phải thiếu muối? (9:16)
NARR = [
  [("Natri máu 125: thiếu muối?", "Na tri máu một trăm hai mươi lăm, có phải là thiếu muối?")],
  [("Na⁺ máu là NỒNG ĐỘ = muối ÷ nước", "Chưa chắc. Na tri máu là nồng độ, bằng lượng muối chia cho lượng nước.")],
  [("Hạ natri thường do THỪA NƯỚC", "Vì vậy, hạ na tri thường là do thừa nước, chứ không phải thiếu muối.")],
  [("Thủ phạm thường gặp: ADH giữ nước ở thận", "Thủ phạm thường gặp là a đê hát, hóc môn giữ nước ở thận.")],
  [("Cùng Na⁺ 125: có thể phù, có thể mất nước", "Cùng na tri một trăm hai mươi lăm, bệnh nhân có thể phù, cũng có thể mất nước.")],
  [("Thể tích do MUỐI · nồng độ do NƯỚC", "Vì thể tích dịch do muối quyết định, còn nồng độ do nước.")],
  [("Lưu lại để ôn · xem Bài 1 đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài một đầy đủ trên kênh nhé!")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
