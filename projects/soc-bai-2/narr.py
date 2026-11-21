# Giải mã sốc · Bài 2: 4 kiểu sốc (11 cảnh)
NARR = [
  [  # 1 Mở đầu
    ("Ông 70 tuổi đang sốc. Nhưng sốc KIỂU GÌ?", "Ông bảy mươi tuổi ở bài trước đang sốc. Nhưng là sốc kiểu gì?"),
    ("Tuần hoàn = BƠM · ỐNG · NƯỚC", "Hãy hình dung tuần hoàn như một hệ thống nước: cái bơm là tim, đường ống là mạch máu, và nước là thể tích máu."),
    ("Hỏng chỗ nào → kiểu sốc đó", "Hỏng ở chỗ nào, ta có kiểu sốc tương ứng."),
  ],
  [  # 2 Bốn kiểu
    ("4 kiểu sốc (Weil – Shubin)", "Từ năm một nghìn chín trăm bảy mươi mốt, Uây và Su bin chia sốc thành bốn kiểu."),
    ("Giảm thể tích · Tim · Tắc nghẽn · Phân bố", "Giảm thể tích, do tim, tắc nghẽn, và phân bố."),
    ("SOAP II: phân bố 66% (nhiễm khuẩn 62%) · tim 16% · giảm thể tích 16% · tắc nghẽn 2%", "Trong nghiên cứu Sốp hai, sốc phân bố chiếm khoảng sáu mươi sáu phần trăm, phần lớn là nhiễm khuẩn. Sốc tim và giảm thể tích mỗi loại mười sáu phần trăm, tắc nghẽn chỉ hai phần trăm."),
  ],
  [  # 3 Giảm thể tích
    ("① GIẢM THỂ TÍCH: thiếu nước", "Kiểu thứ nhất, giảm thể tích: bơm tốt, ống tốt, nhưng thiếu nước."),
    ("Mất máu · nôn, tiêu chảy · bỏng", "Nguyên nhân là mất máu, nôn, tiêu chảy, hay bỏng rộng."),
    ("Da lạnh · tĩnh mạch cổ XẸP", "Bệnh nhân da lạnh, và tĩnh mạch cổ xẹp."),
  ],
  [  # 4 Sốc tim
    ("② SỐC TIM: bơm hỏng", "Kiểu thứ hai, sốc tim: cái bơm hỏng."),
    ("Nhồi máu cơ tim · suy tim cấp · loạn nhịp", "Thường do nhồi máu cơ tim, suy tim cấp, hoặc rối loạn nhịp."),
    ("Da lạnh · tĩnh mạch cổ NỔI · ran phổi", "Máu ứ lại phía sau bơm, nên tĩnh mạch cổ nổi, phổi có ran, và da cũng lạnh."),
  ],
  [  # 5 Tắc nghẽn
    ("③ TẮC NGHẼN: ống bị chặn", "Kiểu thứ ba, tắc nghẽn: bơm tốt, nước đủ, nhưng dòng chảy bị chặn."),
    ("Thuyên tắc phổi · chèn ép tim · tràn khí màng phổi áp lực", "Ba thủ phạm chính là thuyên tắc phổi, chèn ép tim, và tràn khí màng phổi áp lực."),
    ("Phải GỠ chỗ tắc", "Dịch và thuốc vận mạch chỉ câu giờ. Phải gỡ được chỗ tắc."),
  ],
  [  # 6 Phân bố
    ("④ PHÂN BỐ: ống giãn", "Kiểu thứ tư, phân bố: đường ống giãn rộng, và rò rỉ."),
    ("Nhiễm khuẩn · phản vệ · tổn thương tủy", "Nguyên nhân là nhiễm khuẩn, phản vệ, hoặc tổn thương tủy sống."),
    ("Giai đoạn đầu: da có thể ẤM", "Ở giai đoạn đầu, da có thể còn ấm, dễ đánh lừa."),
  ],
  [  # 7 Phân biệt
    ("Phân biệt: da · tĩnh mạch cổ · phổi", "Để phân biệt, hãy nhìn da, tĩnh mạch cổ, và nghe phổi."),
    ("Cung lượng tim · sức cản mạch · áp lực đổ đầy", "Về huyết động, so sánh ba thông số: cung lượng tim, sức cản mạch, và áp lực đổ đầy."),
    ("Phân bố: cung lượng tim thường TĂNG, sức cản GIẢM", "Ba kiểu kia đều làm cung lượng tim giảm. Riêng sốc phân bố, cung lượng tim thường tăng, còn sức cản mạch giảm."),
  ],
  [  # 8 POCUS
    ("POCUS: siêu âm tại giường (RUSH)", "Công cụ nhanh nhất là siêu âm tại giường, theo quy trình Rát."),
    ("BƠM: co bóp · dịch màng ngoài tim · thất phải", "Kiểm tra bơm: tim co bóp ra sao, có dịch màng ngoài tim, thất phải có giãn không."),
    ("BÌNH: tĩnh mạch chủ dưới · dịch ổ bụng · phổi", "Kiểm tra bình chứa: tĩnh mạch chủ dưới, dịch ổ bụng, và phổi."),
    ("ỐNG: động mạch chủ · huyết khối tĩnh mạch sâu", "Kiểm tra đường ống: động mạch chủ, và huyết khối tĩnh mạch sâu."),
  ],
  [  # 9 Hỗn hợp
    ("Thực tế: thường là sốc HỖN HỢP", "Thực tế, nhiều bệnh nhân bị sốc hỗn hợp."),
    ("Nhiễm khuẩn = ống giãn + thiếu nước + bơm yếu", "Sốc nhiễm khuẩn vừa giãn mạch, vừa thiếu thể tích, và có thể kèm bệnh cơ tim do nhiễm khuẩn."),
  ],
  [  # 10 Giải ca
    ("Siêu âm: tim co bóp mạnh · TM chủ dưới nhỏ, xẹp · phổi sạch", "Quay lại ca bệnh. Siêu âm thấy tim co bóp mạnh, tĩnh mạch chủ dưới nhỏ và xẹp, phổi sạch."),
    ("→ Sốc PHÂN BỐ (nhiễm khuẩn) + thiếu thể tích", "Đây là sốc phân bố do nhiễm khuẩn, kèm thiếu thể tích."),
    ("Cần dịch + vận mạch (Bài 4, 5)", "Ông cần dịch và thuốc vận mạch, sẽ học ở bài bốn và bài năm."),
  ],
  [  # 11 Ôn tập
    ("Bơm hỏng · Ống giãn · Thiếu nước · Bị chặn", "Ôn tập: bơm hỏng, ống giãn, thiếu nước, và bị chặn."),
    ("Khám + siêu âm tại giường để phân loại", "Khám lâm sàng và siêu âm tại giường giúp phân loại nhanh."),
    ("Bài 3: đánh giá tưới máu", "Bài sau: đánh giá tưới máu, đọc lắc tát và thời gian đổ đầy mao mạch."),
  ],
]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
