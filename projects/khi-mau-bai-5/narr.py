# Giải mã khí máu · Bài 5: Toan chuyển hoá — thêm acid hay mất bicarbonate? (11 cảnh)
NARR = [
  [  # 1 Mở đầu
    ("Hai bệnh nhân · cùng pH 7,24 · cùng HCO₃⁻ 12", "Hai bệnh nhân, cùng pê hát bảy phẩy hai tư, cùng bi các bô nát mười hai."),
    ("A: sốc nhiễm khuẩn · B: tiêu chảy nhiều ngày", "Người A bị sốc nhiễm khuẩn. Người B bị tiêu chảy nhiều ngày."),
    ("Cùng toan chuyển hoá, nguyên nhân khác hẳn", "Cả hai cùng toan chuyển hoá, nhưng nguyên nhân hoàn toàn khác nhau. Chìa khoá nằm ở khoảng trống a ni on."),
  ],
  [  # 2 Ngã ba AG
    ("AG = Na⁺ − (Cl⁻ + HCO₃⁻) · bình thường ≈ 12", "Nhắc lại: khoảng trống a ni on bằng na tri trừ tổng clo và bi các bô nát, bình thường khoảng mười hai."),
    ("A: 138 − (100 + 12) = 26 → AG TĂNG", "Người A: một trăm ba mươi tám trừ một trăm mười hai, bằng hai mươi sáu. Tăng."),
    ("B: 138 − (114 + 12) = 12 → AG BÌNH THƯỜNG", "Người B: một trăm ba mươi tám trừ một trăm hai mươi sáu, bằng mười hai. Bình thường."),
    ("AG tăng: THÊM ACID · AG bình thường: MẤT BICARBONATE", "Từ đây chia hai nhánh. Khoảng trống a ni on tăng là thêm a xít. Bình thường là mất bi các bô nát."),
  ],
  [  # 3 Cơ chế tăng AG
    ("Acid lạ vào máu → HCO₃⁻ bị dùng để đệm", "Nhánh một. Khi có a xít lạ vào máu, bi các bô nát bị tiêu hao để đệm."),
    ("Gốc acid ở lại: anion không đo được", "Phần gốc a xít ở lại trong máu, là a ni on mà phiếu xét nghiệm không đo."),
    ("→ khoảng trống anion tăng", "Vì vậy khoảng trống a ni on tăng lên."),
  ],
  [  # 4 GOLDMARK
    ("Nguyên nhân tăng AG: nhớ GOLDMARK", "Nguyên nhân tăng khoảng trống a ni on có thể nhớ bằng chữ gôn mác."),
    ("Glycol · Oxoproline · L-lactate · D-lactate", "Gờ là gly côn. Ô là ô xô prô lin, gặp khi dùng pa ra xê ta mon kéo dài. Lờ là lắc tát. Đê là đê lắc tát."),
    ("Methanol · Aspirin · Renal (suy thận) · Ketoacidosis", "Mờ là mê ta nôn. A là át pi rin. Rờ là suy thận. Ca là nhiễm toan xê tôn."),
    ("Hay gặp: lactic · ceton · suy thận · ngộ độc", "Trên lâm sàng, hay gặp nhất là bốn nhóm: lắc tát, xê tôn, suy thận, và ngộ độc."),
  ],
  [  # 5 Lactic
    ("Toan lactic: hay gặp nhất ở hồi sức", "Toan lắc tát là nguyên nhân hay gặp nhất ở hồi sức."),
    ("Sốc → tưới máu mô kém → chuyển hoá yếm khí", "Khi sốc, mô thiếu tưới máu, tế bào chuyển sang chuyển hoá yếm khí và sinh ra lắc tát."),
    ("Lactate > 2 mmol/L: tăng", "Lắc tát trên hai mi li mol trên lít là tăng."),
  ],
  [  # 6 Ceton
    ("Nhiễm toan ceton: đái tháo đường · nhịn đói · rượu", "Nhiễm toan xê tôn gặp trong đái tháo đường, nhịn đói kéo dài, hoặc do rượu."),
    ("Thiếu insulin → cơ thể đốt mỡ → thể ceton", "Thiếu in su lin, cơ thể đốt mỡ thay đường, tạo ra thể xê tôn."),
    ("Nên đo β-hydroxybutyrate trong máu", "Nên đo bê ta hy đrô xy bu ty rát trong máu để chẩn đoán và theo dõi."),
  ],
  [  # 7 Khoảng trống thẩm thấu
    ("Nghi ngộ độc rượu độc? Tính khoảng trống thẩm thấu", "Khi nghi ngộ độc rượu độc, hãy tính khoảng trống áp lực thẩm thấu."),
    ("ALTT tính = 2 × Na⁺ + glucose + urê (mmol/L)", "Áp lực thẩm thấu tính bằng hai lần na tri, cộng glu cô, cộng u rê, đơn vị mi li mol trên lít."),
    ("Đo − tính > 10 → nghi methanol, ethylene glycol", "Lấy áp lực thẩm thấu đo được trừ áp lực tính. Chênh trên mười, nghi ngộ độc mê ta nôn hoặc ê ty len gly côn."),
  ],
  [  # 8 Cơ chế AG bình thường
    ("Nhánh 2: AG bình thường · không có acid lạ", "Nhánh hai: khoảng trống a ni on bình thường. Không có a xít lạ nào cả."),
    ("Cơ thể MẤT HCO₃⁻ · Cl⁻ tăng lên bù chỗ", "Cơ thể mất bi các bô nát, và clo tăng lên để bù vào chỗ trống."),
    ("AG giữ nguyên → gọi là toan tăng Clo", "Khoảng trống a ni on giữ nguyên, nên còn gọi là toan tăng clo."),
  ],
  [  # 9 Nguyên nhân AG bình thường
    ("Mất qua ruột: tiêu chảy, dò tiêu hoá", "Nguyên nhân thứ nhất: mất bi các bô nát qua ruột, như tiêu chảy hay dò tiêu hoá."),
    ("Mất qua thận: toan hoá ống thận", "Thứ hai: mất qua thận, gọi là toan hoá ống thận."),
    ("Do điều trị: truyền nhiều NaCl 0,9%", "Thứ ba: do điều trị, khi truyền nhiều na tri clo rua không phẩy chín phần trăm."),
  ],
  [  # 10 AG niệu
    ("Ruột hay thận? Tính AG niệu", "Mất qua ruột hay qua thận? Hãy tính khoảng trống a ni on niệu."),
    ("AG niệu = Na⁺ niệu + K⁺ niệu − Cl⁻ niệu", "Khoảng trống a ni on niệu bằng na tri niệu cộng ka li niệu, trừ clo niệu."),
    ("ÂM → mất qua ruột (thận vẫn thải acid tốt)", "Nếu âm, thận vẫn thải a xít tốt, vậy bi các bô nát mất qua ruột."),
    ("DƯƠNG → toan hoá ống thận", "Nếu dương, thận không thải được a xít, nghĩ toan hoá ống thận."),
  ],
  [  # 11 Giải ca + ôn tập
    ("A: AG 26 → thêm acid → toan lactic do sốc", "Quay lại hai bệnh nhân. Người A, khoảng trống a ni on hai mươi sáu: thêm a xít, toan lắc tát do sốc."),
    ("B: AG 12 → mất HCO₃⁻ qua tiêu chảy", "Người B, khoảng trống a ni on mười hai: mất bi các bô nát qua tiêu chảy."),
    ("Toan chuyển hoá → tính AG → tăng: thêm acid · bình thường: mất HCO₃⁻", "Tóm lại: gặp toan chuyển hoá, hãy tính khoảng trống a ni on. Tăng là thêm a xít, bình thường là mất bi các bô nát."),
    ("Bài 6: Kiềm chuyển hoá", "Bài sau: kiềm chuyển hoá."),
  ],
]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
