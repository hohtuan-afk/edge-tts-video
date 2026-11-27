# Giải mã sốc · Bài 7: Sốc nhiễm khuẩn theo SSC 2026 (11 cảnh)
NARR = [
  [  # 1 Mở đầu
    ("SSC 2026 · công bố 23/3/2026", "Hướng dẫn Xơ vai vinh Xép xít năm hai nghìn không trăm hai mươi sáu được công bố ngày hai mươi ba tháng ba."),
    ("129 khuyến cáo · 46 mới hoặc sửa đổi · 17 khuyến cáo mạnh", "Gồm một trăm hai mươi chín khuyến cáo, bốn mươi sáu khuyến cáo mới hoặc sửa đổi, và mười bảy khuyến cáo mạnh."),
    ("Trọng tâm: GIỜ ĐẦU", "Bài này tập trung vào giờ đầu tiên."),
  ],
  [  # 2 Sàng lọc
    ("Sàng lọc: NEWS · MEWS · SIRS", "Bước đầu là sàng lọc, bằng thang điểm cảnh báo sớm Niu, Miu, hoặc tiêu chuẩn Xơ."),
    ("KHÔNG dùng riêng qSOFA (khuyến cáo mạnh)", "Không dùng riêng quích Sô pha để sàng lọc, vì bỏ sót nhiều ca. Đây là khuyến cáo mạnh."),
  ],
  [  # 3 Cấy máu
    ("Cấy máu ≥ 2 bộ TRƯỚC kháng sinh", "Cấy máu ít nhất hai bộ trước khi cho kháng sinh,"),
    ("…nếu KHÔNG làm chậm kháng sinh", "nhưng chỉ khi việc đó không làm chậm kháng sinh."),
    ("Đo lactate cùng lúc", "Đo lắc tát cùng lúc."),
  ],
  [  # 4 Kháng sinh đúng giờ
    ("Sốc / nhiều khả năng nhiễm khuẩn huyết: trong 1 GIỜ", "Có sốc, hoặc nhiều khả năng nhiễm khuẩn huyết: cho kháng sinh trong vòng một giờ."),
    ("Có thể nhiễm khuẩn huyết, chưa sốc: đánh giá nhanh · trong 3 GIỜ", "Chỉ có thể nhiễm khuẩn huyết và chưa sốc: đánh giá nhanh, cho kháng sinh trong vòng ba giờ nếu vẫn nghi ngờ."),
    ("Mỗi giờ chậm trễ → tử vong TĂNG (NEJM 2017)", "Mỗi giờ chậm trễ đều làm tăng tử vong."),
  ],
  [  # 5 Chọn kháng sinh
    ("Phổ rộng · theo Ổ NHIỄM và NGUY CƠ", "Chọn kháng sinh phổ rộng, theo ổ nhiễm và yếu tố nguy cơ của bệnh nhân."),
    ("MRSA · đa kháng: chỉ khi nguy cơ CAO", "Chỉ phủ tụ cầu vàng kháng mê thi xi lin hay vi khuẩn đa kháng khi nguy cơ cao."),
  ],
  [  # 6 Beta-lactam kéo dài
    ("Beta-lactam TRUYỀN KÉO DÀI (khuyến cáo mạnh)", "Với nhóm bê ta lắc tam, hướng dẫn khuyến cáo mạnh truyền kéo dài thay vì tiêm ngắt quãng."),
    ("Giữ nồng độ thuốc TRÊN MIC lâu hơn", "Cách này giữ nồng độ thuốc trên nồng độ ức chế tối thiểu lâu hơn."),
    ("BLING III 2024 · phân tích gộp: giảm tử vong ~14%", "Nghiên cứu Bờ linh ba năm hai nghìn không trăm hai mươi tư chưa có ý nghĩa thống kê, nhưng phân tích gộp cho thấy giảm tử vong khoảng mười bốn phần trăm."),
  ],
  [  # 7 Kiểm soát ổ
    ("KIỂM SOÁT Ổ NHIỄM càng sớm càng tốt", "Kiểm soát ổ nhiễm càng sớm càng tốt."),
    ("Dẫn lưu · rút catheter nhiễm · phẫu thuật", "Dẫn lưu ổ mủ, rút ống thông bị nhiễm, hoặc phẫu thuật."),
    ("Kháng sinh KHÔNG thay được kiểm soát ổ", "Kháng sinh không thay được việc loại bỏ ổ nhiễm."),
  ],
  [  # 8 Corticoid
    ("Hydrocortisone ~200 mg/ngày (có điều kiện)", "Khi cần vận mạch kéo dài, gợi ý dùng hy đrô cóc ti xôn khoảng hai trăm mi li gam mỗi ngày."),
    ("ADRENAL · APROCCHSS 2018: hết sốc NHANH hơn", "Hai nghiên cứu năm hai nghìn không trăm mười tám cho thấy hết sốc nhanh hơn."),
    ("Fludrocortisone: KHÔNG có khuyến cáo", "Hướng dẫn mới không đưa ra khuyến cáo về phờ lu đrô cóc ti xôn."),
  ],
  [  # 9 Xuống thang
    ("XUỐNG THANG khi có kết quả cấy (khuyến cáo mạnh)", "Khi có kết quả cấy, xuống thang kháng sinh. Đây là khuyến cáo mạnh."),
    ("Thời gian NGẮN khi đã kiểm soát ổ", "Và dùng thời gian ngắn khi đã kiểm soát được ổ nhiễm."),
  ],
  [  # 10 Giải ca
    ("0' NEWS 9 · 15' cấy máu + lactate · 30' kháng sinh", "Quay lại ông bảy mươi tuổi viêm phổi. Phút không: Niu chín điểm. Phút mười lăm: cấy máu và lắc tát. Phút ba mươi: kháng sinh."),
    ("45' dịch · 60' norepinephrine", "Phút bốn mươi lăm: truyền dịch. Phút sáu mươi: nô ơ e pi nê phrin."),
    ("Sau đó: hydrocortisone · xuống thang khi có cấy", "Sau đó thêm hy đrô cóc ti xôn vì vẫn cần vận mạch, và xuống thang khi có kết quả cấy."),
  ],
  [  # 11 Ôn tập
    ("Sàng lọc → Cấy → Kháng sinh → Kiểm soát ổ", "Ôn tập: sàng lọc, cấy máu, kháng sinh đúng giờ, kiểm soát ổ nhiễm."),
    ("ĐÁNH GIÁ LẠI · xuống thang", "Rồi đánh giá lại và xuống thang."),
    ("Bài 8: ca tổng hợp", "Bài cuối: một ca tổng hợp, ghép tất cả lại."),
  ],
]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
