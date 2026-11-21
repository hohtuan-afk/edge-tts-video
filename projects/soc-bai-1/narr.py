# Giải mã sốc · Bài 1: Sốc là gì? (11 cảnh)
NARR = [
  [  # 1 Mở đầu
    ("Ông 70 tuổi · viêm phổi · HA 85/50 · mạch 118", "Ông bảy mươi tuổi, viêm phổi, huyết áp tám mươi lăm trên năm mươi, mạch một trăm mười tám."),
    ("Lơ mơ · tay chân lạnh · nước tiểu 15 mL/giờ · lactate 4,2", "Lơ mơ, tay chân lạnh, nước tiểu mười lăm mi li lít mỗi giờ, lắc tát bốn phẩy hai."),
    ("Ông có đang sốc? Huyết áp thấp chưa đủ để trả lời", "Ông có đang sốc không? Và vì sao chỉ nhìn huyết áp thì chưa đủ để trả lời?"),
  ],
  [  # 2 Định nghĩa
    ("Sốc = oxy cung cấp KHÔNG ĐỦ cho nhu cầu tế bào", "Sốc là suy tuần hoàn cấp, khiến oxy cung cấp không đủ cho nhu cầu của tế bào."),
    ("Vấn đề ở TẾ BÀO, không chỉ ở con số huyết áp", "Vấn đề nằm ở tế bào, không chỉ ở con số huyết áp."),
    ("Có thể sốc dù huyết áp còn bình thường", "Vì vậy, bệnh nhân có thể đang sốc dù huyết áp vẫn còn bình thường."),
  ],
  [  # 3 DO2
    ("Cung oxy: DO₂ = cung lượng tim × O₂ trong máu", "Lượng oxy đưa tới mô, gọi là đê ô hai, bằng cung lượng tim nhân với lượng oxy trong máu."),
    ("O₂ trong máu phụ thuộc Hb và SaO₂", "Lượng oxy trong máu phụ thuộc chủ yếu vào huyết sắc tố và độ bão hòa oxy."),
    ("Cung lượng tim = tần số × thể tích nhát bóp", "Còn cung lượng tim bằng tần số tim nhân với thể tích mỗi nhát bóp."),
  ],
  [  # 4 Huyết áp
    ("MAP ≈ cung lượng tim × sức cản mạch", "Huyết áp trung bình xấp xỉ bằng cung lượng tim nhân với sức cản mạch máu."),
    ("Mạch co mạnh → huyết áp vẫn 'đẹp'…", "Nếu mạch máu co mạnh, huyết áp vẫn có thể đẹp,"),
    ("…nhưng lưu lượng tới mô đã GIẢM", "trong khi lưu lượng máu tới mô đã giảm."),
  ],
  [  # 5 Bù trừ
    ("Cơ thể bù: tim nhanh · co mạch (da lạnh)", "Khi thiếu tưới máu, cơ thể bù bằng tim đập nhanh và co mạch, làm da lạnh."),
    ("→ Tụt huyết áp là dấu hiệu MUỘN", "Nên tụt huyết áp thường là dấu hiệu muộn, khi bù trừ đã cạn."),
    ("Chỉ số sốc = mạch ÷ HA tâm thu · > 1 đáng lo", "Một công cụ nhanh: chỉ số sốc bằng mạch chia huyết áp tâm thu, trên một là đáng lo."),
    ("Ca này: 118 ÷ 85 ≈ 1,4", "Ca này: một trăm mười tám chia tám mươi lăm, khoảng một phẩy bốn."),
  ],
  [  # 6 Lactate
    ("Thiếu oxy → chuyển hoá yếm khí → LACTATE", "Tế bào thiếu oxy chuyển sang chuyển hóa yếm khí, sinh ra lắc tát."),
    ("Lactate > 2 mmol/L: bất thường", "Lắc tát trên hai mi li mol trên lít là bất thường."),
    ("Lactate cao còn do: suy gan · adrenaline · co giật…", "Nhưng lắc tát cao còn có nguyên nhân khác như suy gan, dùng a đrê na lin, co giật, nên luôn đọc cùng lâm sàng."),
  ],
  [  # 7 Ba cửa sổ
    ("3 cửa sổ tưới máu", "Nhìn tưới máu qua ba cửa sổ."),
    ("DA: lạnh · nổi bông · CRT kéo dài", "Da: lạnh, nổi bông, thời gian đổ đầy mao mạch kéo dài."),
    ("THẬN: nước tiểu < 0,5 mL/kg/giờ", "Thận: nước tiểu dưới không phẩy năm mi li lít mỗi ký mỗi giờ."),
    ("NÃO: lơ mơ · kích thích", "Não: lơ mơ, hoặc kích thích vật vã."),
  ],
  [  # 8 CRT
    ("CRT: ấn đầu ngón 10 giây rồi thả", "Đo thời gian đổ đầy mao mạch: ấn đầu ngón tay mười giây rồi thả ra."),
    ("Đếm thời gian hồng trở lại · > 3 giây là chậm", "Đếm thời gian để hồng trở lại. Trên ba giây là chậm."),
    ("ANDROMEDA-SHOCK: CRT là mục tiêu hồi sức đáng tin", "Thử nghiệm an đờ rô mê đa sốc cho thấy thời gian đổ đầy mao mạch là mục tiêu hồi sức đáng tin."),
    ("SSC 2026: dùng CRT hỗ trợ cùng lactate", "Hướng dẫn sống còn trong nhiễm khuẩn huyết năm hai nghìn không trăm hai mươi sáu khuyến cáo dùng nó để hỗ trợ, cùng với lắc tát."),
  ],
  [  # 9 Sepsis-3
    ("Sốc nhiễm khuẩn (Sepsis-3): cần vận mạch giữ MAP ≥ 65", "Theo định nghĩa sép xít ba, sốc nhiễm khuẩn là khi cần vận mạch để giữ huyết áp trung bình từ sáu mươi lăm,"),
    ("+ lactate > 2 · dù đã bù dịch đủ", "và lắc tát trên hai, dù đã bù dịch đủ."),
  ],
  [  # 10 Giải ca
    ("Da lạnh · nước tiểu ít · lơ mơ: cả 3 cửa sổ đều xấu", "Quay lại ca bệnh: da lạnh, nước tiểu ít, lơ mơ. Cả ba cửa sổ đều xấu."),
    ("Lactate 4,2 · chỉ số sốc 1,4 → SỐC", "Lắc tát bốn phẩy hai, chỉ số sốc một phẩy bốn. Ông đang sốc."),
    ("Câu hỏi tiếp: sốc KIỂU GÌ?", "Câu hỏi tiếp theo: sốc kiểu gì?"),
  ],
  [  # 11 Ôn tập
    ("Sốc = tế bào thiếu oxy, không chỉ là huyết áp", "Ôn tập: sốc là tế bào thiếu oxy, không chỉ là con số huyết áp."),
    ("Nhìn 3 cửa sổ · lactate · CRT", "Hãy nhìn ba cửa sổ, lắc tát và thời gian đổ đầy mao mạch."),
    ("Bài 2: 4 kiểu sốc · bơm – ống – thể tích", "Bài sau: bốn kiểu sốc, qua bộ ba bơm, ống và thể tích."),
  ],
]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
