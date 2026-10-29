# SHORT (9:16) — Bài 4 · Block nhánh & Block phân nhánh: QRS rộng → nhìn V1 và V6
NARR = [
  [("QRS rộng? Nhìn V1 là biết block nhánh nào!", "QRS rộng? Nhìn vê một là biết block nhánh nào. Mẹo như cần xi-nhan: gạt lên rẽ phải, gạt xuống rẽ trái.")],
  [("① Nhánh PHẢI: V1 hướng LÊN — rSR′ “tai thỏ”", "Một, block nhánh phải: vê một hướng lên, dạng r S R phẩy như tai thỏ. Vê sáu có S rộng.")],
  [("② Nhánh TRÁI: V1 hướng XUỐNG · V6 R khấc, mất q", "Hai, block nhánh trái: vê một hướng xuống. Vê sáu có R rộng có khấc, và mất sóng q.")],
  [("③ Phân nhánh trái TRƯỚC: trục lệch TRÁI −45° → −90°", "Ba, block phân nhánh trái trước: QRS không rộng, trục lệch trái, từ âm bốn mươi lăm đến âm chín mươi độ.")],
  [("④ Phân nhánh trái SAU: trục lệch PHẢI +90° → +180°", "Bốn, block phân nhánh trái sau: trục lệch phải, từ chín mươi đến một trăm tám mươi độ, nhớ loại trừ nguyên nhân khác.")],
  [("V1 LÊN → PHẢI · V1 XUỐNG → TRÁI · Phân nhánh → TRỤC", "Nhắc lại nhé: vê một lên là phải, vê một xuống là trái, phân nhánh thì nhìn trục.")],
  [("Lưu lại để ôn · xem bài đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài đầy đủ trên kênh nhé.")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
