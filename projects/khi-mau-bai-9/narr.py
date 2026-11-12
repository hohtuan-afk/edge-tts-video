# Giải mã khí máu · Bài 9: Tiếp cận Stewart (10 cảnh)
NARR = [
  [  # 1 Mở đầu
    ("Hai cách nhìn toan kiềm", "Có hai cách nhìn rối loạn toan kiềm."),
    ("Truyền thống: HCO₃⁻, AG · Stewart: hoá lý", "Cách truyền thống dựa vào bi các bô nát và khoảng trống a ni on. Cách của xtiu vớt dựa vào hoá lý."),
    ("Stewart giải thích rõ: dịch truyền, albumin", "Cách xtiu vớt đặc biệt hữu ích để hiểu toan do dịch truyền, và vai trò của an bu min."),
  ],
  [  # 2 Nguyên lý
    ("Dung dịch luôn trung hoà điện tích", "Nguyên lý: mọi dung dịch trong cơ thể luôn trung hoà điện tích."),
    ("H⁺ và HCO₃⁻ là biến PHỤ THUỘC", "Theo xtiu vớt, hát cộng và bi các bô nát chỉ là biến phụ thuộc. Chúng thay đổi theo các yếu tố khác."),
    ("3 biến ĐỘC LẬP: PaCO₂ · SID · A_TOT", "Có ba biến độc lập quyết định pê hát: pê a xê ô hai, hiệu số i on mạnh, và tổng a xít yếu."),
  ],
  [  # 3 SID
    ("SID: hiệu số ion mạnh", "Hiệu số i on mạnh, viết tắt ét ai đi, là tổng cation mạnh trừ tổng anion mạnh."),
    ("Tại giường: SID ≈ Na⁺ − Cl⁻ · bình thường ≈ 35", "Tại giường, có thể ước tính đơn giản bằng na tri trừ clo. Bình thường khoảng ba mươi lăm."),
    ("SID giảm → toan · SID tăng → kiềm", "Ét ai đi giảm gây toan. Ét ai đi tăng gây kiềm."),
  ],
  [  # 4 Dịch truyền
    ("NaCl 0,9%: Na⁺ 154 · Cl⁻ 154 → SID = 0", "Na tri clo rua không phẩy chín phần trăm có na tri và clo đều một trăm năm mươi tư, nên ét ai đi bằng không."),
    ("Truyền nhiều → kéo SID máu giảm → toan tăng Clo", "Truyền nhiều sẽ kéo ét ai đi của máu giảm xuống, gây toan tăng clo."),
    ("Ringer lactat: SID hiệu dụng ≈ 28 → ít gây toan hơn", "Ring gơ lắc tát có ét ai đi hiệu dụng khoảng hai mươi tám, nên ít gây toan hơn."),
  ],
  [  # 5 A_TOT, albumin
    ("A_TOT: tổng acid yếu · chủ yếu là albumin", "Tổng a xít yếu, chủ yếu là an bu min và phốt phát."),
    ("Albumin giảm → KIỀM", "An bu min là một a xít yếu. Khi an bu min giảm, máu có xu hướng kiềm."),
    ("Albumin thấp có thể CHE GIẤU toan chuyển hoá", "Vì vậy, an bu min thấp có thể che giấu một toan chuyển hoá. Rất hay gặp ở hồi sức."),
  ],
  [  # 6 Phương pháp Story
    ("Phương pháp Story: tách kiềm dư (BE) thành từng phần", "Phương pháp đơn giản của Xtô ri tách kiềm dư thành từng phần."),
    ("Na–Cl: (Na⁺ − Cl⁻) − 35", "Phần na tri clo bằng na tri trừ clo, trừ ba mươi lăm."),
    ("Albumin: 0,25 × (42 − albumin g/L)", "Phần an bu min bằng không phẩy hai lăm nhân bốn mươi hai trừ an bu min tính bằng gam trên lít."),
    ("Lactate: 1 − lactate", "Phần lắc tát bằng một trừ lắc tát."),
    ("Còn lại = anion không đo được", "Phần còn lại chính là a ni on không đo được."),
  ],
  [  # 7 Ca số 1
    ("Ca số 1: hồi sức, đã truyền nhiều NaCl 0,9%", "Ca số một: bệnh nhân hồi sức, đã truyền nhiều na tri clo rua không phẩy chín phần trăm."),
    ("pH 7,32 · PaCO₂ 30 · HCO₃⁻ 15 · BE −10", "Pê hát bảy phẩy ba hai, pê a xê ô hai ba mươi, bi các bô nát mười lăm, kiềm dư trừ mười."),
    ("Na⁺ 140 · Cl⁻ 115 · albumin 22 g/L · lactate 3", "Na tri một trăm bốn mươi, clo một trăm mười lăm, an bu min hai mươi hai, lắc tát ba."),
  ],
  [  # 8 Giải ca
    ("Na–Cl: 140 − 115 − 35 = −10", "Phần na tri clo: một trăm bốn mươi trừ một trăm mười lăm trừ ba mươi lăm, bằng trừ mười."),
    ("Albumin: 0,25 × (42 − 22) = +5", "Phần an bu min: không phẩy hai lăm nhân hai mươi, bằng cộng năm."),
    ("Lactate: 1 − 3 = −2", "Phần lắc tát: một trừ ba, bằng trừ hai."),
    ("Còn lại: −10 − (−10 + 5 − 2) = −3", "Phần còn lại: trừ mười, trừ đi tổng trừ bảy, bằng trừ ba."),
    ("Toan tăng Clo là chính · albumin thấp che bớt", "Kết luận: toan chủ yếu do tăng clo từ dịch truyền, an bu min thấp đã che bớt một phần."),
  ],
  [  # 9 So sánh
    ("Truyền thống: đơn giản, đủ dùng hằng ngày", "So sánh: cách truyền thống đơn giản, đủ dùng trong phần lớn tình huống."),
    ("AG hiệu chỉnh albumin ≈ bổ sung phần lớn điểm mạnh của Stewart", "Khoảng trống a ni on có hiệu chỉnh an bu min đã bổ sung phần lớn điểm mạnh của xtiu vớt."),
    ("Stewart: giúp hiểu dịch truyền, albumin ở hồi sức", "Cách xtiu vớt giúp hiểu rõ ảnh hưởng của dịch truyền và an bu min ở hồi sức."),
  ],
  [  # 10 Kết chuỗi
    ("Stewart: PaCO₂ · SID · A_TOT", "Ôn tập: theo xtiu vớt, pê hát do ba yếu tố quyết định: pê a xê ô hai, ét ai đi, và tổng a xít yếu."),
    ("Hết chuỗi \"Giải mã khí máu\" · 9 bài", "Đây là bài cuối của chuỗi Giải mã khí máu."),
    ("Cảm ơn bạn đã theo dõi! Lưu lại để ôn tập", "Cảm ơn bạn đã theo dõi. Hãy lưu lại cả chuỗi để ôn tập nhé!"),
  ],
]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
