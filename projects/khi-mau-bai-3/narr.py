# Giải mã khí máu · Bài 3: Đánh giá oxy hoá — PaO₂, P/F và chênh lệch A–a (10 cảnh)
NARR = [
  [  # 1 Mở đầu
    ("Hai bệnh nhân, cùng PaO₂ 55 mmHg", "Hai bệnh nhân, cùng có pê a ô hai năm mươi lăm mi li mét thuỷ ngân."),
    ("Một người phổi bị tổn thương, một người chỉ thở yếu", "Một người có phổi bị tổn thương, người kia chỉ đơn giản là thở yếu."),
    ("Làm sao phân biệt chỉ bằng một phiếu khí máu?", "Làm sao phân biệt hai người này, chỉ bằng một phiếu khí máu?"),
  ],
  [  # 2 PaO₂
    ("PaO₂: áp lực oxy hoà tan trong máu động mạch", "Pê a ô hai là áp lực của ô xy hoà tan trong máu động mạch."),
    ("Oxy đi từ phế nang, qua màng mỏng, vào máu", "Ô xy đi từ phế nang, qua một lớp màng rất mỏng, rồi vào máu."),
    ("Bình thường 80–100 mmHg khi thở khí trời", "Khi thở khí trời, pê a ô hai bình thường khoảng tám mươi đến một trăm."),
    ("PaO₂ giảm dần theo tuổi", "Con số này giảm dần theo tuổi, nên người cao tuổi có pê a ô hai thấp hơn một chút vẫn có thể là bình thường."),
  ],
  [  # 3 Đường cong phân ly
    ("Phần lớn oxy được chở bởi hemoglobin: SaO₂", "Phần lớn ô xy trong máu được chở bởi hê mô glô bin. Tỉ lệ bão hoà đó gọi là ét a ô hai."),
    ("PaO₂ và SaO₂ liên hệ theo đường cong hình chữ S", "Pê a ô hai và ét a ô hai liên hệ với nhau theo một đường cong hình chữ S."),
    ("PaO₂ 60 ≈ SaO₂ 90%", "Mốc cần nhớ: pê a ô hai sáu mươi, tương ứng ét a ô hai khoảng chín mươi phần trăm."),
    ("Dưới mốc này, SaO₂ tụt rất nhanh: \"mép vực\"", "Dưới mốc này, đường cong dốc xuống, độ bão hoà tụt rất nhanh. Hãy nhớ: sáu mươi, chín mươi là mép vực."),
  ],
  [  # 4 Giảm oxy máu
    ("PaO₂ < 80 mmHg: giảm oxy máu", "Khi thở khí trời, pê a ô hai dưới tám mươi là giảm ô xy máu."),
    ("PaO₂ < 60 mmHg: giảm oxy máu đáng kể, nghĩ suy hô hấp", "Dưới sáu mươi là giảm ô xy máu đáng kể, cần nghĩ đến suy hô hấp."),
  ],
  [  # 5 P/F
    ("PaO₂ phải đọc cùng FiO₂: oxy bệnh nhân đang thở", "Nhưng pê a ô hai phải luôn đọc cùng phi ô hai, tức là nồng độ ô xy bệnh nhân đang thở."),
    ("Khí trời: FiO₂ = 21% (0,21)", "Khí trời có phi ô hai là hai mươi mốt phần trăm, tức không phẩy hai mốt."),
    ("Tỉ số P/F = PaO₂ ÷ FiO₂", "Tỉ số pê ép bằng pê a ô hai chia cho phi ô hai."),
    ("PaO₂ 90, khí trời: P/F ≈ 430 · bình thường", "Pê a ô hai chín mươi khi thở khí trời, pê ép khoảng bốn trăm ba mươi. Bình thường."),
    ("PaO₂ 90, oxy 100%: P/F = 90 · rất nặng", "Cũng pê a ô hai chín mươi, nhưng đang thở ô xy một trăm phần trăm, pê ép chỉ còn chín mươi. Rất nặng."),
  ],
  [  # 6 P/F và ARDS
    ("P/F bình thường khoảng 400–500", "Tỉ số pê ép bình thường khoảng bốn trăm đến năm trăm."),
    ("ARDS: nhẹ 200–300 · vừa 100–200 · nặng ≤ 100", "Trong hội chứng suy hô hấp cấp tiến triển, pê ép từ hai trăm đến ba trăm là nhẹ, từ một trăm đến hai trăm là vừa, dưới một trăm là nặng."),
    ("Khi thở máy: tính với PEEP ≥ 5 cmH₂O", "Ở bệnh nhân thở máy, tỉ số này được tính khi pi pờ ít nhất là năm xen ti mét nước."),
    ("Định nghĩa toàn cầu 2024: dùng được SpO₂/FiO₂ khi chưa có khí máu", "Định nghĩa toàn cầu năm hai nghìn không trăm hai mươi tư cho phép dùng ét pê ô hai chia phi ô hai khi chưa có khí máu."),
  ],
  [  # 7 PAO₂
    ("PAO₂: lượng oxy trong phế nang", "Tiếp theo, ta cần biết trong phế nang có bao nhiêu ô xy. Gọi là ô xy phế nang, viết tắt pê A ô hai."),
    ("Thở khí trời: PAO₂ ≈ 150 − 1,25 × PaCO₂", "Khi thở khí trời ở mặt nước biển, ô xy phế nang xấp xỉ một trăm năm mươi, trừ một phẩy hai lăm lần pê a xê ô hai."),
    ("CO₂ trong phế nang càng nhiều, chỗ cho oxy càng ít", "Xê ô hai trong phế nang càng nhiều, chỗ dành cho ô xy càng ít."),
    ("PaCO₂ 40 → PAO₂ ≈ 100", "Ví dụ pê a xê ô hai bốn mươi, ô xy phế nang khoảng một trăm."),
  ],
  [  # 8 A–a
    ("Chênh lệch A–a = PAO₂ − PaO₂", "Chênh lệch A a bằng ô xy trong phế nang, trừ ô xy trong máu động mạch."),
    ("Người trẻ: A–a < 10–15 mmHg", "Ở người trẻ, chênh lệch này thường dưới mười đến mười lăm."),
    ("Ước tính theo tuổi: tuổi ÷ 4 + 4", "Có thể ước tính giới hạn trên theo tuổi: lấy tuổi chia bốn, cộng bốn."),
    ("A–a tăng: oxy không qua được phổi vào máu", "Chênh lệch A a tăng nghĩa là ô xy có trong phế nang, nhưng không đi được vào máu. Vấn đề nằm ở phổi."),
  ],
  [  # 9 5 cơ chế
    ("5 cơ chế gây giảm oxy máu", "Có năm cơ chế gây giảm ô xy máu."),
    ("A–a bình thường: thiếu oxy khí thở (độ cao) · giảm thông khí", "Chênh lệch A a bình thường gặp ở hai cơ chế: khí thở thiếu ô xy, như khi lên vùng cao, và giảm thông khí."),
    ("A–a tăng: bất xứng V/Q · shunt · rối loạn khuếch tán", "Chênh lệch A a tăng gặp ở ba cơ chế: bất xứng thông khí tưới máu, shunt, và rối loạn khuếch tán."),
    ("Bất xứng V/Q: thường gặp nhất, đáp ứng tốt với oxy", "Bất xứng thông khí tưới máu là cơ chế thường gặp nhất, và đáp ứng tốt với ô xy."),
    ("Shunt: máu đi qua vùng phổi không có khí, thở oxy ít cải thiện", "Shunt là máu đi qua vùng phổi không có khí, nên thở thêm ô xy cải thiện rất ít."),
  ],
  [  # 10 Giải đố + ôn tập
    ("BN 1: PaO₂ 55, PaCO₂ 70 → PAO₂ ≈ 62 → A–a ≈ 8", "Quay lại câu đố. Bệnh nhân một: pê a ô hai năm mươi lăm, pê a xê ô hai bảy mươi. Pê A ô hai khoảng sáu mươi hai, chênh lệch A a chỉ khoảng tám."),
    ("A–a bình thường → giảm thông khí (vd: quá liều thuốc an thần)", "Chênh lệch bình thường, vậy đây là giảm thông khí, ví dụ quá liều thuốc an thần."),
    ("BN 2: PaO₂ 55, PaCO₂ 30 → PAO₂ ≈ 112 → A–a ≈ 58", "Bệnh nhân hai: pê a ô hai năm mươi lăm, pê a xê ô hai ba mươi. Pê A ô hai khoảng một trăm mười hai, chênh lệch A a khoảng năm mươi tám."),
    ("A–a tăng → bệnh tại phổi (vd: viêm phổi, thuyên tắc phổi)", "Chênh lệch tăng, vậy vấn đề nằm ở phổi, ví dụ viêm phổi hay thuyên tắc phổi."),
    ("Ôn tập: PaO₂ bao nhiêu? · P/F bao nhiêu? · A–a bình thường hay tăng?", "Tóm lại, đánh giá ô xy hoá qua ba câu hỏi: pê a ô hai bao nhiêu, pê ép bao nhiêu, và chênh lệch A a bình thường hay tăng."),
    ("Bài 4: Quy trình đọc khí máu 6 bước", "Bài sau, ta sẽ ghép tất cả lại thành quy trình đọc khí máu sáu bước."),
  ],
]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
