# Giải mã khí máu · Bài 7: Rối loạn toan kiềm hỗn hợp (10 cảnh)
NARR = [
  [  # 1 Mở đầu
    ("Một bệnh nhân · có thể nhiều rối loạn cùng lúc", "Một bệnh nhân có thể mang hai, thậm chí ba rối loạn toan kiềm cùng lúc."),
    ("pH bình thường ≠ không có rối loạn", "Và pê hát bình thường không có nghĩa là không có rối loạn."),
    ("Bài này: 4 manh mối · 3 ca bệnh", "Bài này sẽ cho bạn bốn manh mối, và giải ba ca bệnh."),
  ],
  [  # 2 Manh mối 1
    ("Manh mối 1: bù trừ không đúng dự kiến", "Manh mối một: bù trừ không khớp với công thức dự kiến."),
    ("Bù ít hơn hoặc nhiều hơn → có rối loạn thứ hai", "Bù ít hơn hay nhiều hơn dự kiến đều có nghĩa là có thêm một rối loạn thứ hai."),
    ("Bù trừ hiếm khi đưa pH về hẳn bình thường", "Nhớ rằng bù trừ hiếm khi đưa pê hát về hẳn bình thường."),
  ],
  [  # 3 Manh mối 2
    ("Manh mối 2: PaCO₂ và HCO₃⁻ đi ngược chiều", "Manh mối hai: pê a xê ô hai và bi các bô nát đi ngược chiều nhau."),
    ("Bù trừ luôn đi CÙNG chiều", "Bù trừ bình thường luôn làm hai chỉ số đi cùng chiều."),
    ("PaCO₂ ↑ + HCO₃⁻ ↓ → toan hô hấp + toan chuyển hoá", "Pê a xê ô hai tăng mà bi các bô nát giảm: toan hô hấp cộng toan chuyển hoá."),
    ("PaCO₂ ↓ + HCO₃⁻ ↑ → kiềm hô hấp + kiềm chuyển hoá", "Pê a xê ô hai giảm mà bi các bô nát tăng: kiềm hô hấp cộng kiềm chuyển hoá."),
  ],
  [  # 4 Manh mối 3, 4
    ("Manh mối 3: luôn tính AG, kể cả khi pH bình thường", "Manh mối ba: luôn tính khoảng trống a ni on, kể cả khi pê hát bình thường."),
    ("Manh mối 4: delta–delta khi AG tăng", "Manh mối bốn: tính tỉ số đen ta đen ta khi khoảng trống a ni on tăng."),
    ("< 1: thêm toan AG bình thường · > 2: thêm kiềm chuyển hoá", "Dưới một: có thêm toan khoảng trống a ni on bình thường. Trên hai: có thêm kiềm chuyển hoá."),
  ],
  [  # 5 Ca 1
    ("Ca số 1: vừa hồi sức ngưng tim", "Ca số một: bệnh nhân vừa được hồi sức ngưng tim."),
    ("pH 7,04 · PaCO₂ 50 · HCO₃⁻ 13", "Pê hát bảy phẩy không bốn, pê a xê ô hai năm mươi, bi các bô nát mười ba."),
    ("PaCO₂ ↑ và HCO₃⁻ ↓ → ngược chiều!", "Pê a xê ô hai tăng, bi các bô nát giảm. Hai chỉ số đi ngược chiều."),
    ("Winter: 1,5 × 13 + 8 ≈ 27,5 ± 2 · PaCO₂ thật 50", "Theo công thức Uyn-tơ, pê a xê ô hai dự kiến khoảng hai mươi bảy. Pê a xê ô hai thật là năm mươi."),
    ("→ toan chuyển hoá + toan hô hấp", "Kết luận: toan chuyển hoá cộng toan hô hấp. Hai rối loạn cộng dồn, nên pê hát rất thấp."),
  ],
  [  # 6 Ca 2
    ("Ca số 2: sốt, lơ mơ, thở nhanh", "Ca số hai: sốt, lơ mơ, thở rất nhanh."),
    ("pH 7,44 · PaCO₂ 20 · HCO₃⁻ 13 · AG 23", "Pê hát bảy phẩy bốn bốn, pê a xê ô hai hai mươi, bi các bô nát mười ba, khoảng trống a ni on hai mươi ba."),
    ("pH bình thường, nhưng HCO₃⁻ và PaCO₂ đều rất thấp", "Pê hát bình thường, nhưng bi các bô nát và pê a xê ô hai đều rất thấp."),
    ("AG 23 → toan chuyển hoá tăng AG", "Khoảng trống a ni on hai mươi ba: có toan chuyển hoá tăng khoảng trống a ni on."),
    ("Winter ≈ 27,5 ± 2 · PaCO₂ thật 20 → thêm kiềm hô hấp", "Pê a xê ô hai dự kiến khoảng hai mươi bảy, thật là hai mươi, thấp hơn nhiều. Có thêm kiềm hô hấp."),
    ("Nghĩ: nhiễm khuẩn huyết, ngộ độc salicylate", "Bệnh cảnh này gợi ý nhiễm khuẩn huyết, hoặc ngộ độc sa li xy lát."),
  ],
  [  # 7 Ca 3
    ("Ca số 3: đái tháo đường, nôn ói nhiều ngày", "Ca số ba: đái tháo đường, nôn ói nhiều ngày."),
    ("pH 7,40 · PaCO₂ 40 · HCO₃⁻ 24", "Pê hát bảy phẩy bốn, pê a xê ô hai bốn mươi, bi các bô nát hai mươi tư."),
    ("Khí máu \"hoàn hảo\"?", "Một phiếu khí máu tưởng như hoàn hảo."),
    ("Na⁺ 140 · Cl⁻ 90 → AG = 140 − (90 + 24) = 26", "Nhưng na tri một trăm bốn mươi, clo chín mươi. Khoảng trống a ni on bằng hai mươi sáu, tăng."),
  ],
  [  # 8 Giải ca 3
    ("Δ/Δ = (26 − 12) ÷ (24 − 24) → rất lớn", "Tỉ số đen ta đen ta: khoảng trống a ni on tăng mười bốn, mà bi các bô nát không giảm. Tỉ số rất lớn."),
    ("→ toan ceton + kiềm chuyển hoá do nôn", "Kết luận: nhiễm toan xê tôn, cộng kiềm chuyển hoá do nôn. Hai rối loạn triệt tiêu nhau, nên pê hát bình thường."),
    ("Không tính AG → bỏ sót cả hai", "Nếu không tính khoảng trống a ni on, ta đã bỏ sót cả hai rối loạn."),
  ],
  [  # 9 Tổng kết 3 ca
    ("Ca 1: hai rối loạn CỘNG DỒN → pH rất thấp", "Tổng kết. Ca số một: hai rối loạn cộng dồn, pê hát rất thấp."),
    ("Ca 2, ca 3: hai rối loạn TRIỆT TIÊU → pH bình thường", "Ca số hai và ca số ba: hai rối loạn triệt tiêu nhau, pê hát lại bình thường."),
    ("pH bình thường vẫn phải đọc đủ 6 bước", "Vì vậy, pê hát bình thường vẫn phải đọc đủ sáu bước."),
  ],
  [  # 10 Ôn tập
    ("Bù trừ đúng dự kiến? · PaCO₂ và HCO₃⁻ ngược chiều?", "Ôn lại bốn manh mối: bù trừ có đúng dự kiến không, pê a xê ô hai và bi các bô nát có đi ngược chiều không,"),
    ("Luôn tính AG · delta–delta", "luôn tính khoảng trống a ni on, và tính tỉ số đen ta đen ta."),
    ("Bài 8: Khí máu trong hồi sức", "Bài sau: khí máu trong hồi sức."),
  ],
]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
