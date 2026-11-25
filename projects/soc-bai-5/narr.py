# Giải mã sốc · Bài 5: Thuốc vận mạch (11 cảnh)
NARR = [
  [  # 1 Mở đầu
    ("Hết đáp ứng dịch · MAP vẫn 58", "Ông bảy mươi tuổi đã hết đáp ứng dịch, nhưng huyết áp trung bình vẫn năm mươi tám."),
    ("→ Đến lúc dùng VẬN MẠCH", "Đã đến lúc dùng thuốc vận mạch."),
    ("Chọn thuốc nào? Theo thứ tự nào?", "Nhưng chọn thuốc nào, và theo thứ tự nào?"),
  ],
  [  # 2 Thụ thể
    ("α1: CO MẠCH", "Trước hết, nhớ ba thụ thể. An pha một trên mạch máu: gây co mạch."),
    ("β1: tim đập MẠNH và NHANH", "Bê ta một trên tim: làm tim đập mạnh và nhanh hơn."),
    ("V1: thụ thể của VASOPRESSIN", "Vê một: thụ thể của va sô prét xin, cũng gây co mạch, theo một đường riêng."),
  ],
  [  # 3 Norepinephrine
    ("NOREPINEPHRINE: thuốc ĐẦU TAY", "Nô ơ e pi nê phrin là thuốc đầu tay, khuyến cáo mạnh của Xơ vai vinh Xép xít năm hai nghìn không trăm hai mươi sáu."),
    ("α1 mạnh · β1 nhẹ", "Thuốc tác động mạnh lên an pha một, và nhẹ lên bê ta một."),
    ("Liều tính theo µg/kg/phút", "Liều tính bằng mi crô gam mỗi ký mỗi phút."),
  ],
  [  # 4 Sớm
    ("CENSER 2019: norepinephrine liều thấp SỚM", "Không nên chờ quá lâu. Nghiên cứu Xen xơ năm hai nghìn không trăm mười chín dùng nô ơ e pi nê phrin liều thấp sớm."),
    ("Kiểm soát sốc ở giờ 6: 76% so với 48%", "Tỷ lệ kiểm soát được sốc ở giờ thứ sáu là bảy mươi sáu so với bốn mươi tám phần trăm."),
  ],
  [  # 5 Ngoại vi
    ("SSC 2026: có thể bắt đầu qua tĩnh mạch NGOẠI VI", "Chưa có đường truyền trung tâm? Hướng dẫn mới gợi ý bắt đầu qua tĩnh mạch ngoại vi, thay vì chờ đợi."),
    ("Tĩnh mạch LỚN · gần gốc chi · kiểm tra thoát mạch", "Chọn tĩnh mạch lớn, gần gốc chi, và kiểm tra thoát mạch thường xuyên."),
    ("Thoát mạch hiếm: khoảng 3%", "Thoát mạch hiếm gặp, khoảng ba phần trăm."),
  ],
  [  # 6 Đích MAP
    ("Đích MAP 65 (khuyến cáo mạnh)", "Đích huyết áp trung bình là sáu mươi lăm, khuyến cáo mạnh."),
    ("≥ 65 tuổi: 60–65 có thể chấp nhận (65 trial)", "Ở người từ sáu mươi lăm tuổi, mức sáu mươi đến sáu mươi lăm có thể chấp nhận, theo nghiên cứu Sáu mươi lăm."),
    ("SEPSISPAM: MAP cao hơn KHÔNG giảm tử vong", "Nghiên cứu Xép xít pam cho thấy nhắm huyết áp cao hơn không giảm tử vong."),
  ],
  [  # 7 Vasopressin
    ("VASOPRESSIN: thêm khi norepinephrine 0,25–0,5 µg/kg/phút", "Khi liều nô ơ e pi nê phrin tăng lên khoảng không phẩy hai lăm đến không phẩy năm, hãy thêm va sô prét xin."),
    ("Liều CỐ ĐỊNH 0,03 đơn vị/phút", "Va sô prét xin dùng liều cố định, không phẩy không ba đơn vị mỗi phút."),
    ("Giúp GIẢM liều norepinephrine (VASST 2008)", "Thuốc giúp giảm liều nô ơ e pi nê phrin. Nghiên cứu nền tảng là Vát năm hai nghìn không trăm lẻ tám."),
  ],
  [  # 8 Epinephrine
    ("EPINEPHRINE: lựa chọn THỨ BA", "Nếu vẫn chưa đủ, thêm e pi nê phrin, là lựa chọn thứ ba."),
    ("Lưu ý: tăng lactate · nhịp nhanh", "Lưu ý: e pi nê phrin làm tăng lắc tát và gây nhịp nhanh, nên đừng nhầm là tưới máu xấu đi."),
  ],
  [  # 9 Tránh
    ("Dopamine: loạn nhịp 24,1% so với 12,4% (SOAP II)", "Tránh đô pa min. Nghiên cứu Sốp hai cho thấy loạn nhịp hai mươi tư phẩy một so với mười hai phẩy bốn phần trăm."),
    ("SSC 2026: KHÔNG dùng terlipressin", "Hướng dẫn mới khuyến cáo không dùng téc li prét xin."),
    ("Xanh methylen: chưa đủ bằng chứng", "Xanh mê ti len chưa đủ bằng chứng để khuyến cáo."),
  ],
  [  # 10 Giải ca
    ("Norepinephrine ngoại vi: 0,1 → 0,3 µg/kg/phút", "Quay lại ca bệnh. Bắt đầu nô ơ e pi nê phrin qua tĩnh mạch ngoại vi, tăng từ không phẩy một lên không phẩy ba."),
    ("+ Vasopressin 0,03 đơn vị/phút", "Thêm va sô prét xin không phẩy không ba đơn vị mỗi phút."),
    ("MAP 66 ✓ · đặt đường truyền trung tâm", "Huyết áp trung bình đạt sáu mươi sáu. Sau đó đặt đường truyền trung tâm."),
  ],
  [  # 11 Ôn tập
    ("Norepinephrine → + Vasopressin → + Epinephrine", "Ôn tập bậc thang: nô ơ e pi nê phrin, thêm va sô prét xin, rồi thêm e pi nê phrin."),
    ("Bắt đầu sớm · ngoại vi được · đích MAP 65", "Bắt đầu sớm, ngoại vi được, và đích huyết áp trung bình sáu mươi lăm."),
    ("Bài 6: sốc tim", "Bài sau: sốc tim, khi cái bơm hỏng."),
  ],
]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
