# Giải mã khí máu · Tập 0: Khí máu là gì, lấy mẫu thế nào — bản thử 4 cảnh đầu
NARR = [
  [
    ("Cùng một bệnh nhân, cùng thời điểm, nhưng hai phiếu khí máu lại khác nhau", "Cùng một bệnh nhân, cùng một thời điểm, nhưng hai phiếu khí máu lại cho hai kết quả khác nhau."),
    ("Bệnh nhân không đổi. Thứ thay đổi là cách lấy và xử lý mẫu", "Bệnh nhân không thay đổi. Thứ thay đổi là cách lấy và xử lý mẫu máu."),
    ("Muốn đọc đúng khí máu, trước hết phải có một mẫu đáng tin", "Vì vậy, muốn đọc đúng khí máu, trước hết phải có một mẫu đáng tin."),
  ],
  [
    ("Khí máu động mạch trả lời ba câu hỏi lớn", "Khí máu động mạch giúp trả lời ba câu hỏi lớn."),
    ("① Máu có đủ O₂ không?", "Một, máu có đủ ô xy không?"),
    ("② Phổi có thải CO₂ phù hợp không?", "Hai, phổi có thải cê ô hai phù hợp không?"),
    ("③ Cơ thể đang toan hay kiềm?", "Ba, cơ thể đang toan hay kiềm?"),
    ("Đọc phiếu: pH · PaCO₂ · HCO₃⁻ · PaO₂", "Khi đọc phiếu, ta thường nhìn vào pê hát, áp suất riêng phần của cê ô hai, bi các bô nát, và áp suất riêng phần của ô xy."),
  ],
  [
    ("Vị trí thường dùng nhất: động mạch quay ở cổ tay", "Vị trí thường dùng nhất là động mạch quay ở cổ tay."),
    ("Trước khi chọc: kiểm tra tuần hoàn bàn tay, ví dụ nghiệm pháp Allen", "Trước khi chọc, ta kiểm tra tuần hoàn bàn tay, ví dụ bằng nghiệm pháp A-len."),
    ("Rút kim: đè chặt ít nhất 2 phút; lâu hơn nếu dùng chống đông, kháng tiểu cầu", "Sau khi rút kim, đè chặt ít nhất hai phút. Nếu bệnh nhân đang dùng thuốc chống đông hoặc kháng tiểu cầu, cần đè lâu hơn."),
  ],
  [
    ("① Bọt khí: trao đổi khí với máu → CO₂ giảm, O₂ tăng giả", "Kẻ thứ nhất là bọt khí. Bọt khí trao đổi khí với máu, làm cê ô hai giảm và ô xy tăng giả."),
    ("② Heparin thừa: đẩy bớt heparin lỏng và bọt khí khỏi ống tiêm", "Kẻ thứ hai là hê pa rin thừa. Vì vậy, cần đẩy bớt hê pa rin lỏng và bọt khí khỏi ống tiêm."),
    ("③ Thời gian: tế bào máu vẫn chuyển hoá trong ống", "Kẻ thứ ba là thời gian. Tế bào máu vẫn chuyển hoá trong ống, nên mẫu để lâu sẽ không còn phản ánh đúng bệnh nhân."),
  ],
]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
