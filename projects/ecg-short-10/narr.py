# SHORT (9:16) — Bài 10 · Ngoại tâm thu & nhịp thoát: 3 câu hỏi + nhịp thoát là CỨU
NARR = [
  [("Nhát đến SỚM hay nhát đến CỨU? 3 câu hỏi đọc ngoại tâm thu", "Nhát đến sớm, hay nhát đến cứu? Ba câu hỏi để đọc ngoại tâm thu.")],
  [("① SỚM → ngoại tâm thu · MUỘN → nhịp thoát", "Một, sớm hay muộn. Đến sớm là ngoại tâm thu, đến muộn sau khoảng nghỉ là nhịp thoát.")],
  [("② P′ sớm + QRS HẸP → NHĨ · không P + QRS RỘNG kỳ dị → THẤT", "Hai, hẹp hay rộng. Sóng P phẩy sớm và QRS hẹp là nhĩ. Không có P, QRS rộng kỳ dị là thất.")],
  [("③ NGHỈ BÙ: đủ 2 × RR → THẤT · thiếu → NHĨ", "Ba, nghỉ bù. Đủ hai lần R R gợi ý thất. Thiếu gợi ý nhĩ.")],
  [("④ Nhịp thoát là CỨU — ĐỪNG XOÁ", "Và nhớ: nhịp thoát là nhịp cứu, đừng xoá nó bằng thuốc chống loạn nhịp.")],
  [("SỚM hay MUỘN – HẸP hay RỘNG – NGHỈ BÙ ĐỦ hay THIẾU", "Nhắc lại: sớm hay muộn, hẹp hay rộng, nghỉ bù đủ hay thiếu.")],
  [("Lưu lại để ôn · xem bài đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài đầy đủ trên kênh nhé.")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
