# SHORT (9:16) — Bài 7 · Nhịp nhanh QRS hẹp: ĐỀU? – P Ở ĐÂU? – RP?
NARR = [
  [("Nhịp nhanh QRS hẹp? Hỏi 3 câu là ra tên!", "Nhịp nhanh QRS hẹp? Hỏi ba câu là ra tên: đều không, P ở đâu, RP dài hay ngắn.")],
  [("① Không đều hoàn toàn, không P → RUNG NHĨ", "Một, nhịp không đều hoàn toàn, không thấy sóng P, đó là rung nhĩ.")],
  [("② Đều ~ 150 → tìm sóng F răng cưa → CUỒNG NHĨ 2:1", "Hai, nhịp đều khoảng một trăm năm mươi, hãy tìm sóng F răng cưa. Đó là cuồng nhĩ dẫn truyền hai trên một.")],
  [("③ Không thấy P, r′ giả V1 → vòng vào lại NÚT nhĩ thất", "Ba, không thấy P, có r phẩy giả ở vê một, là nhịp nhanh vòng vào lại nút nhĩ thất.")],
  [("④ P sau QRS, RP ≥ 90 ms → vòng vào lại qua ĐƯỜNG PHỤ", "Bốn, sóng P nằm sau QRS, RP từ chín mươi mi li giây, là vòng vào lại qua đường phụ.")],
  [("ĐỀU? – P Ở ĐÂU? – RP DÀI HAY NGẮN?", "Nhớ nhé: đều không, P ở đâu, RP dài hay ngắn.")],
  [("Lưu lại để ôn · xem bài đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài đầy đủ trên kênh nhé.")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
