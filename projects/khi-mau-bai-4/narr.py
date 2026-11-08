# Giải mã khí máu · Bài 4: Quy trình đọc khí máu 6 bước (10 cảnh)
NARR = [
  [  # 1 Mở đầu
    ("Một phiếu khí máu đầy số: đọc từ đâu?", "Một phiếu khí máu đầy những con số. Nên đọc từ đâu?"),
    ("Ca bệnh: ĐTĐ, nôn ói, thở nhanh sâu", "Hãy cùng giải một ca bệnh: người bệnh đái tháo đường, nôn ói, thở nhanh và sâu."),
    ("pH 7,28 · PaCO₂ 26 · HCO₃⁻ 12 · Na⁺ 135 · Cl⁻ 98", "Pê hát bảy phẩy hai tám, pê a xê ô hai hai mươi sáu, bi các bô nát mười hai, na tri một trăm ba mươi lăm, clo chín mươi tám."),
    ("6 bước · mỗi bước trả lời một câu hỏi", "Ta sẽ đọc theo sáu bước, mỗi bước trả lời một câu hỏi."),
  ],
  [  # 2 Bước 1
    ("Bước 1: phiếu có đáng tin không?", "Bước một: phiếu này có đáng tin không?"),
    ("H⁺ = 24 × PaCO₂ ÷ HCO₃⁻", "pê hát, pê a xê ô hai và bi các bô nát phải khớp nhau theo công thức: hát cộng bằng hai mươi tư nhân pê a xê ô hai, chia bi các bô nát."),
    ("Mẹo (pH 7,2–7,5): H⁺ ≈ 80 − hai số lẻ của pH", "Mẹo nhanh, khi pê hát từ bảy phẩy hai đến bảy phẩy năm: hát cộng xấp xỉ tám mươi, trừ hai số lẻ của pê hát."),
    ("24 × 26 ÷ 12 = 52 · pH 7,28 → 80 − 28 = 52 ✓", "Ở ca này, hai mươi tư nhân hai mươi sáu chia mười hai bằng năm mươi hai. Pê hát bảy phẩy hai tám cho tám mươi trừ hai mươi tám, cũng là năm mươi hai. Khớp, phiếu đáng tin."),
  ],
  [  # 3 Bước 2
    ("Bước 2: toan máu hay kiềm máu?", "Bước hai: toan máu hay kiềm máu?"),
    ("pH < 7,35: toan máu · pH > 7,45: kiềm máu", "Pê hát dưới bảy phẩy ba lăm là toan máu, trên bảy phẩy bốn lăm là kiềm máu."),
    ("pH 7,28 → TOAN MÁU", "Pê hát bảy phẩy hai tám, đây là toan máu."),
  ],
  [  # 4 Bước 3
    ("Bước 3: hô hấp hay chuyển hoá?", "Bước ba: nguyên nhân do hô hấp hay chuyển hoá?"),
    ("Tìm chỉ số giải thích được hướng của pH", "Hãy tìm chỉ số giải thích được hướng thay đổi của pê hát."),
    ("Toan: PaCO₂ ↑ (hô hấp) hoặc HCO₃⁻ ↓ (chuyển hoá)", "Toan máu do pê a xê ô hai tăng là toan hô hấp, do bi các bô nát giảm là toan chuyển hoá."),
    ("HCO₃⁻ 12 ↓ → TOAN CHUYỂN HOÁ", "Ở ca này, bi các bô nát giảm còn mười hai. Đây là toan chuyển hoá."),
  ],
  [  # 5 Bước 4
    ("Bước 4: bù trừ có đủ không?", "Bước bốn: cơ thể bù trừ có đủ không?"),
    ("Toan chuyển hoá: công thức Winter", "Với toan chuyển hoá, dùng công thức Uyn-tơ."),
    ("PaCO₂ dự kiến = 1,5 × HCO₃⁻ + 8 ± 2", "Pê a xê ô hai dự kiến bằng một phẩy năm nhân bi các bô nát, cộng tám, cộng trừ hai."),
    ("1,5 × 12 + 8 = 26 · PaCO₂ thật 26 ✓ bù đủ", "Một phẩy năm nhân mười hai, cộng tám, bằng hai mươi sáu. Pê a xê ô hai thật cũng là hai mươi sáu. Bù đủ."),
    ("Lệch khỏi dự kiến → có thêm rối loạn hô hấp", "Nếu pê a xê ô hai lệch khỏi khoảng dự kiến, bệnh nhân có thêm một rối loạn hô hấp đi kèm."),
  ],
  [  # 6 Công thức bù khác
    ("Các rối loạn khác cũng có công thức bù", "Các rối loạn khác cũng có công thức bù riêng."),
    ("Kiềm chuyển hoá: HCO₃⁻ ↑ 1 → PaCO₂ ↑ ≈ 0,7", "Kiềm chuyển hoá: bi các bô nát tăng một, pê a xê ô hai tăng khoảng không phẩy bảy."),
    ("Toan hô hấp: PaCO₂ ↑ 10 → HCO₃⁻ ↑ 1 (cấp) · 3,5–4 (mạn)", "Toan hô hấp: pê a xê ô hai tăng mười, bi các bô nát tăng một nếu cấp, ba phẩy năm đến bốn nếu mạn."),
    ("Kiềm hô hấp: PaCO₂ ↓ 10 → HCO₃⁻ ↓ 2 (cấp) · 4–5 (mạn)", "Kiềm hô hấp: pê a xê ô hai giảm mười, bi các bô nát giảm hai nếu cấp, bốn đến năm nếu mạn."),
  ],
  [  # 7 Bước 5
    ("Bước 5: khoảng trống anion (AG)", "Bước năm: tính khoảng trống an i on."),
    ("AG = Na⁺ − (Cl⁻ + HCO₃⁻) · bình thường ≈ 12", "Khoảng trống an i on bằng na tri trừ tổng clo và bi các bô nát. Bình thường khoảng mười hai, tuỳ phòng xét nghiệm."),
    ("135 − (98 + 12) = 25 → AG TĂNG", "Ở ca này: một trăm ba mươi lăm trừ một trăm mười, bằng hai mươi lăm. Khoảng trống an i on tăng."),
    ("Albumin giảm 1 g/dL → cộng thêm ≈ 2,5", "Lưu ý: an bu min thấp làm khoảng trống an i on thấp giả. Mỗi gam trên đề xi lít an bu min giảm, cộng thêm khoảng hai phẩy năm."),
  ],
  [  # 8 Bước 6
    ("Bước 6: delta–delta", "Bước sáu: tỉ số đen ta đen ta, khi khoảng trống an i on tăng."),
    ("Δ/Δ = (AG − 12) ÷ (24 − HCO₃⁻)", "Lấy phần khoảng trống an i on tăng thêm, chia cho phần bi các bô nát giảm đi."),
    ("< 1: thêm toan AG bình thường · 1–2: đơn thuần · > 2: thêm kiềm chuyển hoá", "Dưới một: có thêm toan chuyển hoá khoảng trống an i on bình thường. Từ một đến hai: đơn thuần. Trên hai: có thêm kiềm chuyển hoá."),
    ("(25 − 12) ÷ (24 − 12) = 13 ÷ 12 ≈ 1,1 → đơn thuần", "Ở ca này, mười ba chia mười hai, khoảng một phẩy một. Toan tăng khoảng trống an i on đơn thuần."),
  ],
  [  # 9 Kết luận
    ("Kết luận: toan chuyển hoá tăng AG, bù hô hấp đủ", "Kết luận: toan chuyển hoá tăng khoảng trống an i on, bù hô hấp đủ."),
    ("Phù hợp: nhiễm toan ceton đái tháo đường", "Bệnh cảnh này phù hợp với nhiễm toan xê tôn do đái tháo đường."),
    ("Đừng quên đánh giá oxy hoá (Bài 3)", "Và đừng quên đánh giá ô xy hoá như ở bài ba."),
  ],
  [  # 10 Ôn tập
    ("1 Tin được? · 2 Toan/kiềm? · 3 Hô hấp/chuyển hoá?", "Ôn lại sáu câu hỏi: tin được không, toan hay kiềm, hô hấp hay chuyển hoá,"),
    ("4 Bù đủ? · 5 AG? · 6 Delta–delta?", "bù có đủ không, khoảng trống an i on bao nhiêu, và tỉ số đen ta đen ta."),
    ("Bài 5: Toan chuyển hoá tăng AG", "Bài sau, ta đi sâu vào toan chuyển hoá tăng khoảng trống an i on."),
  ],
]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
