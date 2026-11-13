# Giải mã điện giải · Bài 2: Hạ natri máu — chẩn đoán (11 cảnh)
NARR = [
  [  # 1 Mở đầu
    ("Cụ bà 78 tuổi, lơ mơ · Na⁺ 121", "Cụ bà bảy mươi tám tuổi, lơ mơ, na tri máu một trăm hai mươi mốt."),
    ("Nguyên nhân là gì?", "Nguyên nhân là gì?"),
    ("Trả lời bằng 4 câu hỏi theo thứ tự", "Ta sẽ trả lời bằng bốn câu hỏi, theo đúng thứ tự."),
  ],
  [  # 2 Định nghĩa
    ("Hạ natri: Na⁺ < 135 mmol/L", "Hạ na tri là na tri máu dưới một trăm ba mươi lăm mi li mol trên lít."),
    ("Nhẹ 130–135 · vừa 125–129 · nặng < 125", "Nhẹ từ một trăm ba mươi đến một trăm ba mươi lăm, vừa từ một trăm hai mươi lăm đến một trăm hai mươi chín, nặng khi dưới một trăm hai mươi lăm."),
    ("Cấp < 48 giờ · mạn ≥ 48 giờ", "Cấp tính khi xuất hiện dưới bốn mươi tám giờ, mạn tính khi từ bốn mươi tám giờ trở lên."),
    ("Triệu chứng nặng (nôn, co giật, hôn mê) → xử trí trước", "Nếu có triệu chứng nặng như nôn, co giật, hôn mê, phải xử trí ngay, chẩn đoán sau."),
  ],
  [  # 3 Câu 1: ALTT máu
    ("Câu 1: ALTT máu có thấp không?", "Câu hỏi một: áp lực thẩm thấu máu có thấp không?"),
    ("ALTT bình thường → giả hạ natri (mỡ máu, protein rất cao)", "Nếu bình thường, có thể là giả hạ na tri, do mỡ máu hoặc protein máu rất cao."),
    ("ALTT tăng → đường máu cao, mannitol", "Nếu tăng, nghĩ đến đường máu cao hoặc truyền ma ni tôn."),
    ("Đường máu tăng 5,5 mmol/L → Na⁺ giảm ≈ 1,6–2,4", "Cứ đường máu tăng năm phẩy năm mi li mol trên lít, na tri giảm khoảng một phẩy sáu đến hai phẩy bốn."),
  ],
  [  # 4 Câu 2: ALTT niệu
    ("Câu 2: ALTT niệu (ADH đang bật hay tắt?)", "Câu hỏi hai: áp lực thẩm thấu niệu, để biết a đê hát đang bật hay tắt."),
    ("< 100 → ADH TẮT, thận đang thải nước tối đa", "Dưới một trăm: a đê hát đang tắt, thận đang thải nước tối đa."),
    ("Uống quá nhiều nước · uống nhiều bia · ăn quá ít đạm", "Gặp khi uống quá nhiều nước, uống nhiều bia, hoặc ăn quá ít đạm."),
    ("> 100 → ADH đang hoạt động → hỏi tiếp", "Trên một trăm: a đê hát đang hoạt động, hỏi tiếp câu ba."),
  ],
  [  # 5 Câu 3: Na niệu
    ("Câu 3: Na⁺ niệu", "Câu hỏi ba: na tri niệu."),
    ("≤ 30 → thể tích tuần hoàn hiệu dụng THẤP, thận giữ muối", "Từ ba mươi trở xuống: thể tích tuần hoàn hiệu dụng thấp, thận đang cố giữ muối."),
    ("Mất qua tiêu hoá · suy tim · xơ gan · hội chứng thận hư", "Gặp khi mất dịch qua tiêu hoá, hoặc suy tim, xơ gan, hội chứng thận hư."),
    ("> 30 → thận đang mất muối, hoặc SIAD", "Trên ba mươi: thận đang mất muối, hoặc hội chứng tiết a đê hát không thích hợp."),
  ],
  [  # 6 Câu 4: Thể tích
    ("Câu 4: thể tích dịch ngoại bào", "Câu hỏi bốn: đánh giá thể tích dịch ngoại bào."),
    ("Giảm · bình thường · tăng (phù, báng)", "Giảm, bình thường, hay tăng với phù và báng bụng."),
    ("Khám lâm sàng đánh giá thể tích KÉM chính xác", "Lưu ý: khám lâm sàng đánh giá thể tích kém chính xác."),
    ("Vì vậy hướng dẫn châu Âu xét Na⁺ niệu TRƯỚC", "Vì vậy, hướng dẫn châu Âu xét na tri niệu trước, rồi mới đến thể tích."),
  ],
  [  # 7 Na niệu > 30
    ("Na⁺ niệu > 30: nghĩ gì?", "Na tri niệu trên ba mươi, nghĩ đến gì?"),
    ("Thuốc lợi tiểu (thiazide, hay gặp ở người già)", "Thuốc lợi tiểu, đặc biệt là thi a dít, rất hay gặp ở người già."),
    ("Suy thượng thận · nôn ói · bệnh thận mất muối", "Suy thượng thận, nôn ói, bệnh thận mất muối."),
    ("Không có các nguyên nhân trên → SIAD", "Nếu không có các nguyên nhân trên, nghĩ đến hội chứng tiết a đê hát không thích hợp."),
  ],
  [  # 8 SIAD tiêu chuẩn
    ("SIAD: tiết ADH không thích hợp", "Hội chứng tiết a đê hát không thích hợp: a đê hát vẫn tiết dù máu đang loãng."),
    ("ALTT máu < 275 · ALTT niệu > 100 · Na⁺ niệu > 30", "Tiêu chuẩn: áp lực thẩm thấu máu dưới hai trăm bảy mươi lăm, niệu trên một trăm, na tri niệu trên ba mươi."),
    ("Thể tích BÌNH THƯỜNG", "Và thể tích dịch bình thường."),
    ("Loại trừ: suy giáp · suy thượng thận · lợi tiểu", "Phải loại trừ suy giáp, suy thượng thận, và thuốc lợi tiểu."),
  ],
  [  # 9 Nguyên nhân SIAD
    ("Nguyên nhân SIAD", "Nguyên nhân của hội chứng này."),
    ("Phổi (viêm phổi) · não (đột quỵ, chấn thương)", "Bệnh phổi như viêm phổi, bệnh não như đột quỵ hay chấn thương."),
    ("Thuốc: SSRI, carbamazepine · ung thư phổi tế bào nhỏ", "Thuốc như nhóm ét ét a i, các ba ma de pin, và ung thư phổi tế bào nhỏ."),
    ("Đau · nôn · sau phẫu thuật", "Cả đau, nôn và giai đoạn sau phẫu thuật cũng kích thích tiết a đê hát."),
  ],
  [  # 10 Ca số 1 & 2
    ("Ca số 1: Na⁺ 121 · ALTT máu 255 · đường máu bình thường", "Ca số một: na tri một trăm hai mươi mốt, áp lực thẩm thấu máu hai trăm năm mươi lăm, đường máu bình thường."),
    ("ALTT niệu 420 · Na⁺ niệu 48 · không phù · không lợi tiểu", "Áp lực thẩm thấu niệu bốn trăm hai mươi, na tri niệu bốn mươi tám, không phù, không dùng lợi tiểu."),
    ("Đang dùng sertraline → SIAD do thuốc (kiểm tra TSH, cortisol)", "Đang dùng xéc tra lin. Nghĩ đến hội chứng tiết a đê hát không thích hợp do thuốc, sau khi kiểm tra chức năng giáp và cortisol."),
    ("Ca số 2: xơ gan báng bụng · Na⁺ 126 · Na⁺ niệu 10", "Ca số hai: xơ gan báng bụng, na tri một trăm hai mươi sáu, na tri niệu mười."),
    ("→ Hạ natri thừa dịch, thể tích tuần hoàn hiệu dụng thấp", "Đây là hạ na tri thừa dịch, nhưng thể tích tuần hoàn hiệu dụng thấp."),
  ],
  [  # 11 Ôn tập
    ("① ALTT máu · ② ALTT niệu", "Ôn tập bốn câu hỏi: một, áp lực thẩm thấu máu. Hai, áp lực thẩm thấu niệu."),
    ("③ Na⁺ niệu · ④ thể tích", "Ba, na tri niệu. Bốn, thể tích dịch."),
    ("Bài 3: Hạ natri, xử trí an toàn", "Bài sau: hạ na tri, xử trí an toàn."),
  ],
]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
