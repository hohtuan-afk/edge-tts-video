# Giải mã sốc · Bài 3: Đánh giá tưới máu (11 cảnh)
NARR = [
  [  # 1 Mở đầu
    ("Sau 2 giờ hồi sức: MAP 68", "Ông bảy mươi tuổi sau hai giờ hồi sức, huyết áp trung bình đã lên sáu mươi tám."),
    ("Đã đủ chưa?", "Vậy đã hồi sức đủ chưa?"),
    ("Đích hồi sức = TƯỚI MÁU MÔ, không chỉ huyết áp", "Đích của hồi sức là tưới máu mô, không chỉ là con số huyết áp."),
  ],
  [  # 2 Ba tầng
    ("Tầng 1 · VĨ MÔ: MAP, nhịp tim", "Hãy đánh giá theo ba tầng. Tầng một, vĩ mô: huyết áp trung bình và nhịp tim."),
    ("Tầng 2 · MÔ: da, CRT, nước tiểu, tri giác", "Tầng hai, mô: da, thời gian đổ đầy mao mạch, nước tiểu và tri giác."),
    ("Tầng 3 · CHUYỂN HÓA: lactate, ScvO₂, chênh lệch CO₂", "Tầng ba, chuyển hóa: lắc tát, độ bão hòa oxy tĩnh mạch trung tâm, và chênh lệch khí các bô níc."),
  ],
  [  # 3 MAP
    ("MAP ≥ 65: CẦN nhưng chưa ĐỦ", "Huyết áp trung bình từ sáu mươi lăm trở lên là cần, nhưng chưa đủ."),
    ("Tăng huyết áp mạn: có thể cần MAP cao hơn", "Người tăng huyết áp mạn tính có thể cần mức cao hơn để tưới máu cơ quan."),
  ],
  [  # 4 Lactate
    ("Lactate: đo LẶP LẠI mỗi 2 giờ", "Lắc tát cần đo lặp lại, khoảng mỗi hai giờ."),
    ("Nhìn XU HƯỚNG: giảm ≥ 20% mỗi 2 giờ (Jansen 2010)", "Quan trọng là xu hướng. Nghiên cứu của Gian xen năm hai nghìn không trăm mười nhắm giảm ít nhất hai mươi phần trăm mỗi hai giờ."),
    ("SSC 2026: dùng lactate lặp lại để hướng dẫn hồi sức", "Hướng dẫn Xơ vai vinh Xép xít năm hai nghìn không trăm hai mươi sáu khuyến cáo dùng lắc tát đo lặp lại để hướng dẫn hồi sức."),
  ],
  [  # 5 Bẫy lactate
    ("Lactate giảm CHẬM: gan thanh thải chậm", "Nhưng lắc tát giảm chậm, vì gan cần thời gian để thanh thải."),
    ("Không phải lúc nào cũng do thiếu oxy: adrenaline, suy gan", "Lắc tát cũng không phải lúc nào cũng do thiếu oxy, mà còn do a đờ rê na lin hay suy gan."),
    ("Đừng truyền dịch mãi để 'đuổi' lactate", "Vì vậy, đừng truyền dịch mãi chỉ để đuổi theo lắc tát."),
  ],
  [  # 6 CRT
    ("CRT: ấn lam kính lên đầu ngón trỏ 10 giây", "Thời gian đổ đầy mao mạch đo chuẩn: ấn lam kính lên đầu ngón trỏ mười giây, đủ để da trắng."),
    ("Thả ra, bấm giờ: > 3 giây là BẤT THƯỜNG", "Thả ra và bấm giờ. Trên ba giây là bất thường."),
    ("CRT đổi NHANH: vài chục phút sau truyền dịch", "Ưu điểm lớn: nó thay đổi nhanh, chỉ vài chục phút sau khi truyền dịch."),
  ],
  [  # 7 ANDROMEDA-SHOCK
    ("ANDROMEDA-SHOCK (2019): CRT so với lactate", "Nghiên cứu An đờ rô mê đa Sốc năm hai nghìn không trăm mười chín so sánh hồi sức theo thời gian đổ đầy mao mạch với theo lắc tát."),
    ("Tử vong 34,9% so với 43,4% · chưa có ý nghĩa thống kê", "Tử vong ba mươi tư phẩy chín so với bốn mươi ba phẩy bốn phần trăm, chưa có ý nghĩa thống kê,"),
    ("Nhóm CRT: ít suy tạng hơn", "nhưng nhóm theo dõi thời gian đổ đầy mao mạch ít suy tạng hơn."),
  ],
  [  # 8 ANDROMEDA-SHOCK-2
    ("ANDROMEDA-SHOCK-2 (JAMA 2025): 1467 bệnh nhân · 86 ICU", "Năm hai nghìn không trăm hai mươi lăm, An đờ rô mê đa Sốc hai trên một nghìn bốn trăm sáu mươi bảy bệnh nhân."),
    ("Hồi sức cá thể hóa theo CRT: dịch nếu đáp ứng · siêu âm tim · dobutamine", "Nhóm can thiệp hồi sức cá thể hóa theo thời gian đổ đầy mao mạch: chỉ cho dịch khi có đáp ứng, siêu âm tim, và cân nhắc đô bu ta min."),
    ("Kết cục tổng hợp TỐT hơn · ít ngày hỗ trợ sống · ít dịch hơn", "Kết cục tổng hợp tốt hơn, chủ yếu nhờ ít ngày phải hỗ trợ sống, và dùng ít dịch hơn."),
    ("Tử vong 28 ngày tương đương: 26,5% so với 26,6%", "Còn tử vong hai mươi tám ngày thì tương đương."),
  ],
  [  # 9 ScvO2 và CO2
    ("ScvO₂ < 70%: cung oxy không đủ", "Ở bệnh nhân có đường truyền tĩnh mạch trung tâm, độ bão hòa oxy tĩnh mạch dưới bảy mươi phần trăm gợi ý cung oxy không đủ."),
    ("Chênh lệch CO₂ tĩnh – động mạch > 6 mmHg: lưu lượng THẤP", "Chênh lệch khí các bô níc giữa tĩnh mạch và động mạch trên sáu mi li mét thủy ngân gợi ý lưu lượng tim thấp,"),
    ("…kể cả khi ScvO₂ bình thường", "kể cả khi độ bão hòa oxy tĩnh mạch bình thường."),
  ],
  [  # 10 Giải ca
    ("CRT 4,5 → 2,5 giây · lactate 4,2 → 3,1 (giảm 26%)", "Quay lại ca bệnh. Thời gian đổ đầy mao mạch giảm từ bốn phẩy năm xuống hai phẩy năm giây. Lắc tát từ bốn phẩy hai xuống ba phẩy một, giảm hai mươi sáu phần trăm."),
    ("Nước tiểu 40 mL/giờ · tỉnh hơn", "Nước tiểu bốn mươi mi li lít mỗi giờ, và ông tỉnh hơn."),
    ("→ ĐANG ĐÁP ỨNG: ngừng bolus, tiếp tục theo dõi", "Ông đang đáp ứng. Ngừng bolus dịch, và tiếp tục theo dõi."),
  ],
  [  # 11 Ôn tập
    ("Đánh giá NHIỀU TẦNG · đo LẶP LẠI", "Ôn tập: đánh giá nhiều tầng, và đo lặp lại."),
    ("CRT đổi nhanh · lactate đổi chậm", "Thời gian đổ đầy mao mạch thay đổi nhanh, lắc tát thay đổi chậm."),
    ("Bài 4: truyền dịch đúng", "Bài sau: truyền dịch đúng, bao nhiêu là đủ."),
  ],
]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
