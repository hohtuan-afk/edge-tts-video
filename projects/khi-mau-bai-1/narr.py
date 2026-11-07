# Giải mã khí máu · Bài 1: Khí máu động mạch — chỉ định và lấy mẫu đúng (9 cảnh)
NARR = [
  [  # 1 Vì sao
    ("Cùng một bệnh nhân, cùng thời điểm, nhưng hai phiếu khí máu lại khác nhau", "Cùng một bệnh nhân, cùng một thời điểm, nhưng hai phiếu khí máu lại cho hai kết quả khác nhau."),
    ("Bệnh nhân không đổi. Thứ thay đổi là cách lấy và xử lý mẫu", "Bệnh nhân không thay đổi. Thứ thay đổi là cách lấy và xử lý mẫu máu."),
    ("Muốn đọc đúng khí máu, trước hết phải có một mẫu đáng tin", "Vì vậy, muốn đọc đúng khí máu, trước hết phải có một mẫu đáng tin."),
  ],
  [  # 2 Đọc gì
    ("Khí máu động mạch trả lời ba câu hỏi lớn", "Khí máu động mạch giúp trả lời ba câu hỏi lớn."),
    ("① Máu có đủ O₂ không?", "Một, máu có đủ ô xy không?"),
    ("② Phổi có thải CO₂ phù hợp không?", "Hai, phổi có thải cê ô hai phù hợp không?"),
    ("③ Cơ thể đang toan hay kiềm?", "Ba, cơ thể đang toan hay kiềm?"),
    ("Đọc phiếu: pH · PaCO₂ · HCO₃⁻ · PaO₂", "Khi đọc phiếu, ta thường nhìn vào pê hát, áp suất riêng phần của cê ô hai, bi các bô nát, và áp suất riêng phần của ô xy."),
  ],
  [  # 3 Khi nào
    ("Khi nào cần làm khí máu động mạch?", "Vậy khi nào cần làm khí máu động mạch?"),
    ("① Suy hô hấp: cần biết oxy hoá và thông khí", "Một, khi bệnh nhân suy hô hấp, cần biết cả ô xy hoá lẫn thông khí."),
    ("② Rối loạn toan kiềm nặng: sốc, nhiễm toan ceton, ngộ độc", "Hai, khi nghi rối loạn toan kiềm nặng, như sốc, nhiễm toan xê tôn, hay ngộ độc."),
    ("③ Theo dõi và chỉnh máy thở", "Ba, khi theo dõi và điều chỉnh máy thở."),
    ("Nghi ngộ độc CO: đo bão hoà oxy trực tiếp trên mẫu máu", "Và khi nghi ngộ độc khí các bon mô nô xít, cần đo độ bão hoà ô xy trực tiếp trên mẫu máu, vì máy đo kẹp ngón có thể báo cao giả."),
  ],
  [  # 4 Lấy máu
    ("Vị trí thường dùng nhất: động mạch quay ở cổ tay", "Vị trí thường dùng nhất là động mạch quay ở cổ tay."),
    ("Trước khi chọc: kiểm tra tuần hoàn bàn tay, ví dụ nghiệm pháp Allen", "Trước khi chọc, ta kiểm tra tuần hoàn bàn tay, ví dụ bằng nghiệm pháp A-len."),
    ("Rút kim: đè chặt ít nhất 2 phút; lâu hơn nếu dùng chống đông, kháng tiểu cầu", "Sau khi rút kim, đè chặt ít nhất hai phút. Nếu bệnh nhân đang dùng thuốc chống đông hoặc kháng tiểu cầu, cần đè lâu hơn."),
  ],
  [  # 5 Phá mẫu
    ("① Bọt khí: trao đổi khí với máu → CO₂ giảm, O₂ tăng giả", "Kẻ thứ nhất là bọt khí. Bọt khí trao đổi khí với máu, làm cê ô hai giảm và ô xy tăng giả."),
    ("② Heparin thừa: đẩy bớt heparin lỏng và bọt khí khỏi ống tiêm", "Kẻ thứ hai là hê pa rin thừa. Vì vậy, cần đẩy bớt hê pa rin lỏng và bọt khí khỏi ống tiêm."),
    ("③ Thời gian: tế bào máu vẫn chuyển hoá trong ống", "Kẻ thứ ba là thời gian. Tế bào máu vẫn chuyển hoá trong ống, nên mẫu để lâu sẽ không còn phản ánh đúng bệnh nhân."),
  ],
  [  # 6 Gửi mẫu
    ("Lấy xong: đuổi hết bọt khí, đậy nắp, lăn nhẹ ống để trộn đều", "Lấy máu xong, đuổi hết bọt khí, đậy nắp kín, rồi lăn nhẹ ống để máu trộn đều."),
    ("Ghi FiO₂, chế độ thở và nhiệt độ lên phiếu", "Ghi rõ nồng độ ô xy khí thở vào, chế độ thở, và nhiệt độ bệnh nhân lên phiếu xét nghiệm."),
    ("Ống nhựa: để nhiệt độ phòng, phân tích trong vòng 30 phút", "Ống tiêm nhựa để ở nhiệt độ phòng, và phân tích càng sớm càng tốt, trong vòng ba mươi phút."),
  ],
  [  # 7 Tĩnh mạch
    ("Không phải lúc nào cũng cần máu động mạch", "Không phải lúc nào cũng cần máu động mạch."),
    ("Chủ yếu cần pH và HCO₃⁻? Khí máu tĩnh mạch thường đủ dùng", "Nếu chủ yếu cần pê hát và bi các bô nát, ví dụ khi theo dõi nhiễm toan xê tôn, khí máu tĩnh mạch thường đủ dùng."),
    ("pH tĩnh mạch thấp hơn động mạch khoảng 0,03–0,04", "Pê hát tĩnh mạch chỉ thấp hơn động mạch một chút, khoảng không phẩy không ba đến không phẩy không bốn."),
    ("Nhưng PCO₂ dao động rộng; PO₂ không dùng để đánh giá oxy hoá", "Nhưng cê ô hai tĩnh mạch dao động rộng, còn ô xy tĩnh mạch không dùng để đánh giá ô xy hoá."),
  ],
  [  # 8 Lẫn mẫu
    ("Làm sao biết mẫu lấy nhầm máu tĩnh mạch?", "Làm sao biết mẫu vô tình lấy phải máu tĩnh mạch?"),
    ("Máu động mạch thường tự dâng vào ống theo nhịp mạch", "Máu động mạch thường tự dâng vào ống theo từng nhịp mạch."),
    ("So SaO₂ trên phiếu với SpO₂ trên monitor: lệch nhiều → nghi mẫu tĩnh mạch", "Hãy so độ bão hoà ô xy trên phiếu với chỉ số trên máy đo kẹp ngón cùng lúc. Nếu số trên phiếu thấp hơn hẳn, hãy nghĩ tới mẫu tĩnh mạch."),
    ("Màu máu không đủ tin cậy để phân biệt", "Còn màu máu đỏ tươi hay sẫm thì không đủ tin cậy để phân biệt."),
  ],
  [  # 9 Ôn tập
    ("Biết khi nào làm · lấy đúng động mạch quay · đè đủ lâu", "Tóm lại, biết khi nào cần làm khí máu, lấy đúng ở động mạch quay, và đè đủ lâu."),
    ("Tránh bọt khí, heparin thừa, chờ lâu · kiểm tra mẫu", "Tránh bọt khí, hê pa rin thừa và chờ lâu, rồi kiểm tra mẫu có thật là máu động mạch."),
    ("Bài sau: cơ thể giữ pH 7,40 bằng cách nào?", "Bài sau, ta cùng tìm hiểu, cơ thể giữ pê hát bảy phẩy bốn mươi bằng cách nào."),
  ],
]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
