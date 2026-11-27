# Giải mã sốc · Bài 8: Ca tổng hợp (11 cảnh)
NARR = [
  [  # 1 Mở đầu
    ("Bà 68 tuổi · sốt · vàng da · đau hạ sườn phải", "Bà sáu mươi tám tuổi, sốt, vàng da, và đau hạ sườn phải. Đây là tam chứng Sác cô."),
    ("HA 84/48 · mạch 122 · thở 26 · lú lẫn", "Huyết áp tám mươi tư trên bốn mươi tám, mạch một trăm hai mươi hai, thở hai mươi sáu lần, và lú lẫn."),
    ("NEWS 11 → báo động", "Điểm cảnh báo sớm Niu mười một. Hãy đi qua từng bước của cả chuỗi."),
  ],
  [  # 2 Có sốc?
    ("① CÓ SỐC KHÔNG? (Bài 1)", "Câu hỏi một: có sốc không?"),
    ("MAP 60 · chỉ số sốc ≈ 1,45", "Huyết áp trung bình sáu mươi, chỉ số sốc khoảng một phẩy bốn lăm."),
    ("Da nổi bông · CRT 4 giây · lactate 4,8 · nước tiểu ít", "Da nổi bông, thời gian đổ đầy mao mạch bốn giây, lắc tát bốn phẩy tám, nước tiểu ít. Có sốc."),
  ],
  [  # 3 Kiểu gì?
    ("② KIỂU GÌ? (Bài 2) · siêu âm tại giường", "Câu hỏi hai: sốc kiểu gì? Siêu âm tại giường."),
    ("Tim tăng động · TM chủ dưới xẹp · phổi sạch · đường mật GIÃN", "Tim co bóp mạnh, tĩnh mạch chủ dưới xẹp, phổi sạch, và đường mật giãn."),
    ("→ PHÂN BỐ + thiếu thể tích · ổ: ĐƯỜNG MẬT", "Đây là sốc phân bố kèm thiếu thể tích, ổ nhiễm ở đường mật."),
  ],
  [  # 4 Giờ đầu
    ("Cấy máu 2 bộ → kháng sinh TRONG 1 GIỜ (Bài 7)", "Ngay trong giờ đầu: cấy máu hai bộ, rồi kháng sinh phổ rộng trong vòng một giờ."),
    ("Beta-lactam truyền KÉO DÀI", "Bê ta lắc tam được truyền kéo dài."),
  ],
  [  # 5 Dịch
    ("③ DỊCH HAY VẬN MẠCH? · Ringer lactate 500 mL/lần (Bài 4)", "Câu hỏi ba: dịch hay vận mạch? Truyền Ringer lắc tát từng liều năm trăm mi li lít, đánh giá lại sau mỗi liều."),
    ("Sau 1,5 lít · nâng chân: VTI +12% → thêm", "Sau một phẩy năm lít, nâng chân thụ động, tích phân vận tốc tăng mười hai phần trăm, nên truyền thêm."),
    ("Lần sau: +3% → NGỪNG dịch", "Lần sau chỉ tăng ba phần trăm. Ngừng dịch."),
  ],
  [  # 6 Vận mạch
    ("Norepinephrine NGOẠI VI · sớm (Bài 5)", "Bắt đầu nô ơ e pi nê phrin qua tĩnh mạch ngoại vi từ sớm."),
    ("0,3 µg/kg/phút → + vasopressin", "Khi liều lên không phẩy ba, thêm va sô prét xin."),
    ("Đích MAP 65 · ≥ 65 tuổi: 60–65 chấp nhận", "Đích huyết áp trung bình sáu mươi lăm. Bà trên sáu mươi lăm tuổi, nên sáu mươi đến sáu mươi lăm cũng chấp nhận được."),
  ],
  [  # 7 Theo dõi tưới máu
    ("④ TƯỚI MÁU CẢI THIỆN? (Bài 3) · sau 2 giờ", "Câu hỏi bốn: tưới máu có cải thiện không? Sau hai giờ:"),
    ("CRT 4 → 2,5 giây · lactate 4,8 → 3,6 (giảm 25%)", "Thời gian đổ đầy mao mạch giảm từ bốn xuống hai phẩy năm giây. Lắc tát giảm hai mươi lăm phần trăm."),
    ("Sau 6 giờ: lactate 2,1 · nước tiểu tốt", "Sau sáu giờ, lắc tát hai phẩy một, nước tiểu tốt. Đang đáp ứng."),
  ],
  [  # 8 Kiểm soát ổ
    ("⑤ NGUYÊN NHÂN: dẫn lưu đường mật (ERCP)", "Câu hỏi năm: nguyên nhân đã sửa chưa? Dẫn lưu đường mật qua nội soi mật tụy ngược dòng."),
    ("Càng SỚM càng tốt khi huyết động cho phép (Tokyo 2018)", "Làm càng sớm càng tốt khi huyết động cho phép, theo hướng dẫn Tô ki ô hai nghìn không trăm mười tám."),
    ("+ Hydrocortisone vì vẫn cần vận mạch", "Thêm hy đrô cóc ti xôn vì vẫn cần vận mạch."),
  ],
  [  # 9 Ngày 2–3
    ("Ngày 2–3: GIẢM DẦN vận mạch", "Ngày hai đến ngày ba, giảm dần vận mạch."),
    ("Cân bằng dịch +4 lít · phổi đường B → RÚT DỊCH", "Cân bằng dịch dương bốn lít, siêu âm phổi có đường B. Đến lúc chủ động rút dịch bằng lợi tiểu."),
    ("Cấy: E. coli → XUỐNG THANG kháng sinh", "Cấy máu mọc ê co li. Xuống thang kháng sinh."),
  ],
  [  # 10 Khung 5 câu hỏi
    ("5 CÂU HỎI cho mọi ca sốc", "Tóm lại, trước mọi ca sốc, hãy hỏi năm câu."),
    ("Có sốc? · Kiểu gì? · Dịch hay vận mạch?", "Có sốc không? Sốc kiểu gì? Cần dịch hay vận mạch?"),
    ("Tưới máu cải thiện? · Nguyên nhân đã sửa?", "Tưới máu có cải thiện không? Và nguyên nhân đã được sửa chưa?"),
  ],
  [  # 11 Kết chuỗi
    ("Giải mã sốc · 8 bài", "Chuỗi Giải mã sốc đến đây là kết thúc."),
    ("Sốc = tế bào thiếu oxy · sửa NGUYÊN NHÂN", "Hãy nhớ: sốc là tế bào thiếu oxy, và luôn phải sửa nguyên nhân."),
    ("Cảm ơn bạn đã theo dõi!", "Cảm ơn bạn đã theo dõi trọn chuỗi tám bài."),
  ],
]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
