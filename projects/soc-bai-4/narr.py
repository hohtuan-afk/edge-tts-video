# Giải mã sốc · Bài 4: Truyền dịch đúng (11 cảnh)
NARR = [
  [  # 1 Mở đầu
    ("Ông 70 kg · đã truyền 1,5 lít · MAP vẫn 60", "Ông bảy mươi tuổi, nặng bảy mươi ký, đã truyền một phẩy năm lít, nhưng huyết áp trung bình vẫn sáu mươi."),
    ("Thêm dịch hay KHÔNG?", "Có nên truyền thêm dịch không?"),
    ("Dịch là THUỐC: có liều, có tác dụng phụ", "Hãy nhớ: dịch là thuốc, có liều dùng, và có tác dụng phụ."),
  ],
  [  # 2 ROSE
    ("4 giai đoạn: Hồi sức · Tối ưu · Ổn định · Rút dịch", "Truyền dịch trong sốc đi qua bốn giai đoạn: hồi sức, tối ưu, ổn định, và rút dịch."),
    ("Đầu: cứu sống · Cuối: rút dịch thừa", "Giai đoạn đầu để cứu sống. Giai đoạn cuối là lấy bớt dịch thừa ra."),
  ],
  [  # 3 Liều đầu
    ("SSC 2026: ≥ 30 mL/kg trong 3 giờ · có điều kiện · cá thể hóa", "Hướng dẫn Xơ vai vinh Xép xít năm hai nghìn không trăm hai mươi sáu gợi ý ít nhất ba mươi mi li lít mỗi ký trong ba giờ đầu, nhưng là khuyến cáo có điều kiện, cần cá thể hóa."),
    ("BMI > 30: dùng cân nặng lý tưởng / điều chỉnh", "Người béo phì có chỉ số khối cơ thể trên ba mươi thì tính theo cân nặng lý tưởng hoặc cân nặng điều chỉnh."),
    ("Bolus 250–500 mL · đánh giá lại sau mỗi liều", "Truyền từng liều hai trăm năm mươi đến năm trăm mi li lít, và đánh giá lại sau mỗi liều."),
  ],
  [  # 4 Dịch gì
    ("Đầu tay: dịch TINH THỂ", "Lựa chọn đầu tay là dịch tinh thể."),
    ("Ưu tiên dịch CÂN BẰNG hơn NaCl 0,9%", "Ưu tiên dịch cân bằng như Ringer lắc tát hay Plasma Lai, hơn là nước muối không phẩy chín phần trăm, vì nước muối nhiều clo gây toan và có thể hại thận."),
    ("Không starch · không thêm albumin thường quy", "Không dùng dung dịch tinh bột, và không thêm albumin một cách thường quy."),
  ],
  [  # 5 Bằng chứng
    ("SMART 2018: 15.802 bệnh nhân · biến cố thận 14,3% so với 15,4%", "Nghiên cứu Smart năm hai nghìn không trăm mười tám trên hơn mười lăm nghìn bệnh nhân: dịch cân bằng giảm biến cố thận, mười bốn phẩy ba so với mười lăm phẩy bốn phần trăm."),
    ("BaSICS · PLUS: chưa khác biệt có ý nghĩa", "Hai nghiên cứu lớn sau đó là Ba xích và Plắt chưa thấy khác biệt có ý nghĩa."),
    ("Lợi ích NHỎ · nhưng gần như không hại", "Lợi ích nhỏ, nhưng dịch cân bằng gần như không gây hại."),
  ],
  [  # 6 Frank–Starling
    ("Frank–Starling: đoạn DỐC → thêm dịch, tim bơm nhiều hơn", "Theo đường cong Phrăng Sta linh, ở đoạn dốc, thêm dịch thì tim bơm được nhiều hơn."),
    ("Đoạn PHẲNG → thêm dịch chỉ gây PHÙ", "Ở đoạn phẳng, thêm dịch không tăng cung lượng tim, chỉ gây phù."),
    ("Chỉ ~50% bệnh nhân sốc còn đáp ứng dịch", "Chỉ khoảng một nửa bệnh nhân sốc còn đáp ứng với dịch."),
  ],
  [  # 7 Nâng chân
    ("Nâng chân thụ động: nửa ngồi → nâng chân 45°", "Cách kiểm tra đơn giản là nâng chân thụ động: từ tư thế nửa ngồi, hạ thân và nâng hai chân bốn mươi lăm độ."),
    ("~300 mL máu dồn về tim · tự đảo ngược", "Khoảng ba trăm mi li lít máu từ chân dồn về tim, như một liều dịch có thể đảo ngược."),
    ("Đo cung lượng tim / VTI trong 1 phút: tăng ≥ 10% → CÒN ĐÁP ỨNG", "Đo cung lượng tim hoặc tích phân vận tốc dòng chảy trong một phút. Tăng từ mười phần trăm trở lên là còn đáp ứng."),
    ("Phải đo LƯU LƯỢNG, không dựa vào huyết áp", "Phải đo lưu lượng, không dựa vào huyết áp."),
  ],
  [  # 8 CLASSIC · CLOVERS
    ("CLASSIC 2022: hạn chế dịch · tử vong 42,3% so với 42,1%", "Nghiên cứu Cờ lát xích năm hai nghìn không trăm hai mươi hai so sánh hạn chế dịch với thông thường: tử vong bốn mươi hai phẩy ba so với bốn mươi hai phẩy một phần trăm."),
    ("CLOVERS 2023: vận mạch sớm · 14,0% so với 14,9%", "Nghiên cứu Clô vơ năm hai nghìn không trăm hai mươi ba, ưu tiên vận mạch sớm: mười bốn so với mười bốn phẩy chín phần trăm."),
    ("Không có MỘT con số cho tất cả", "Cả hai chiến lược đều an toàn. Không có một con số đúng cho mọi bệnh nhân."),
  ],
  [  # 9 Quá tải và rút dịch
    ("Quá tải dịch: phù phổi · phù thận · phù ruột", "Dịch thừa gây phù phổi, phù thận, và phù ruột."),
    ("Cân bằng dịch dương kéo dài → tử vong cao hơn", "Cân bằng dịch dương kéo dài liên quan đến tử vong cao hơn."),
    ("SSC 2026 (mới): chủ động RÚT DỊCH khi ổn định", "Khuyến cáo mới của Xơ vai vinh Xép xít: khi đã ổn định, chủ động rút dịch bằng lợi tiểu hoặc lọc máu."),
  ],
  [  # 10 Giải ca
    ("Nâng chân lần 1: VTI tăng 15% → thêm 500 mL", "Quay lại ca bệnh. Nâng chân lần một, tích phân vận tốc tăng mười lăm phần trăm, nên truyền thêm năm trăm mi li lít."),
    ("Nâng chân lần 2: VTI tăng 4% → NGỪNG dịch", "Nâng chân lần hai, chỉ tăng bốn phần trăm. Đã hết đáp ứng, ngừng dịch."),
    ("MAP vẫn thấp → norepinephrine (Bài 5)", "Huyết áp vẫn thấp, nên bắt đầu nô ơ e pi nê phrin, sẽ học ở bài năm."),
  ],
  [  # 11 Ôn tập
    ("Liều nhỏ · đánh giá lại · ưu tiên dịch cân bằng", "Ôn tập: truyền liều nhỏ, đánh giá lại, ưu tiên dịch cân bằng."),
    ("Nâng chân trước khi thêm · rút dịch khi ổn định", "Nâng chân trước khi thêm dịch, và rút dịch khi đã ổn định."),
    ("Bài 5: vận mạch", "Bài sau: thuốc vận mạch, chọn thuốc nào và theo thứ tự nào."),
  ],
]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
