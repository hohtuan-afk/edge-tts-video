# Giải mã khí máu · Bài 8: Khí máu trong hồi sức (11 cảnh)
NARR = [
  [  # 1 Mở đầu
    ("Ở hồi sức: khí máu để RA QUYẾT ĐỊNH", "Ở hồi sức, khí máu không chỉ để chẩn đoán, mà để ra quyết định điều trị."),
    ("Theo dõi XU HƯỚNG quan trọng hơn một con số", "Và xu hướng qua nhiều lần đo quan trọng hơn một con số đơn lẻ."),
    ("4 chủ đề: lactate · tưới máu · máy thở · bicarbonate", "Bài này gồm bốn chủ đề: lắc tát, tưới máu mô, chỉnh máy thở, và bi các bô nát."),
  ],
  [  # 2 Lactate
    ("Lactate: dấu hiệu giảm tưới máu mô", "Lắc tát là dấu hiệu sớm của giảm tưới máu mô."),
    ("Sốc nhiễm khuẩn: cần vận mạch giữ HATB ≥ 65 + lactate > 2 mmol/L", "Theo định nghĩa sép xít ba, sốc nhiễm khuẩn là cần thuốc vận mạch để giữ huyết áp trung bình từ sáu mươi lăm, kèm lắc tát trên hai mi li mol trên lít, dù đã bù đủ dịch."),
    ("Đo lại sau 2–4 giờ: lactate giảm = đáp ứng điều trị", "Hãy đo lại sau hai đến bốn giờ. Lắc tát giảm dần là dấu hiệu đáp ứng điều trị."),
  ],
  [  # 3 ScvO₂ và chênh CO₂
    ("Thêm khí máu tĩnh mạch trung tâm", "Khi có ca te te tĩnh mạch trung tâm, hãy lấy thêm khí máu tĩnh mạch trung tâm."),
    ("ScvO₂ < 70%: cung cấp oxy chưa đủ", "Độ bão hoà ô xy tĩnh mạch trung tâm dưới bảy mươi phần trăm gợi ý cung cấp ô xy chưa đủ."),
    ("PCO₂ tĩnh mạch − PCO₂ động mạch > 6 mmHg: dòng máu chưa đủ", "Chênh lệch pê xê ô hai tĩnh mạch trừ động mạch trên sáu gợi ý cung lượng tim chưa đủ để rửa xê ô hai khỏi mô."),
  ],
  [  # 4 Máy thở: CO₂
    ("Máy thở: PaCO₂ do thông khí phút quyết định", "Với bệnh nhân thở máy, pê a xê ô hai do thông khí phút quyết định."),
    ("PaCO₂ cao → tăng tần số hoặc thể tích khí lưu thông", "Pê a xê ô hai cao: tăng tần số thở hoặc tăng thể tích khí lưu thông."),
    ("Tần số mới ≈ tần số cũ × PaCO₂ hiện tại ÷ PaCO₂ mục tiêu", "Công thức nhanh: tần số mới xấp xỉ tần số cũ, nhân pê a xê ô hai hiện tại, chia pê a xê ô hai mục tiêu."),
  ],
  [  # 5 Máy thở: O₂ và bảo vệ phổi
    ("PaO₂ thấp → tăng FiO₂ hoặc PEEP", "Pê a ô hai thấp: tăng ép i ô hai hoặc tăng bíp."),
    ("Thông khí bảo vệ phổi: Vt 6 mL/kg cân nặng lý tưởng", "Trong suy hô hấp cấp tiến triển, thông khí bảo vệ phổi với thể tích khí lưu thông sáu mi li lít trên ki lô gam cân nặng lý tưởng."),
    ("Chấp nhận tăng CO₂ nếu pH không quá thấp (≈ ≥ 7,20)", "Khi đó có thể chấp nhận pê a xê ô hai tăng, miễn pê hát không quá thấp, thường từ bảy phẩy hai trở lên."),
  ],
  [  # 6 Bicarbonate
    ("Toan chuyển hoá nặng: có nên truyền bicarbonate?", "Toan chuyển hoá nặng: có nên truyền bi các bô nát không?"),
    ("Điều trị NGUYÊN NHÂN là chính", "Nguyên tắc: điều trị nguyên nhân là chính."),
    ("BICAR-ICU (2018): không giảm tử vong chung · gợi ý lợi ích khi có tổn thương thận cấp", "Nghiên cứu bi ca i xi u năm hai nghìn không trăm mười tám: không giảm tử vong chung, nhưng gợi ý có lợi ở nhóm tổn thương thận cấp."),
    ("BICARICU-2 (2025): không giảm tử vong 90 ngày · giảm nhu cầu lọc máu (35% so với 50%)", "Nghiên cứu bi ca i xi u hai năm hai nghìn không trăm hai mươi lăm, trên nhóm tổn thương thận cấp vừa đến nặng: không giảm tử vong chín mươi ngày, nhưng giảm nhu cầu lọc máu, ba mươi lăm so với năm mươi phần trăm."),
    ("pH ≤ 7,20 + tổn thương thận cấp → có thể cân nhắc NaHCO₃", "Vì vậy, khi pê hát từ bảy phẩy hai trở xuống kèm tổn thương thận cấp, có thể cân nhắc truyền na tri bi các bô nát, chủ yếu để giảm nhu cầu lọc máu."),
  ],
  [  # 7 Lưu ý khi truyền bicarbonate
    ("Bicarbonate sinh thêm CO₂ → cần tăng thông khí", "Lưu ý: bi các bô nát sinh thêm xê ô hai, nên cần đủ thông khí để thải ra."),
    ("Theo dõi canxi ion hoá, natri, quá tải dịch", "Theo dõi can xi ion hoá, na tri và nguy cơ quá tải dịch."),
  ],
  [  # 8 Dịch truyền
    ("Truyền nhiều NaCl 0,9% → toan tăng Clo", "Truyền nhiều na tri clo rua không phẩy chín phần trăm gây toan tăng clo."),
    ("Dịch cân bằng: ít biến chứng thận hơn (SMART 2018)", "Nghiên cứu smát năm hai nghìn không trăm mười tám cho thấy dịch tinh thể cân bằng ít biến chứng thận hơn."),
  ],
  [  # 9 Ca số 1
    ("Ca số 1: sốc nhiễm khuẩn, đang thở máy, thiểu niệu", "Ca số một: sốc nhiễm khuẩn, đang thở máy, thiểu niệu."),
    ("pH 7,19 · PaCO₂ 38 · HCO₃⁻ 14 · lactate 6", "Pê hát bảy phẩy một chín, pê a xê ô hai ba mươi tám, bi các bô nát mười bốn, lắc tát sáu."),
    ("Toan chuyển hoá tăng AG do lactate", "Toan chuyển hoá tăng khoảng trống a ni on do lắc tát."),
    ("Winter: 1,5 × 14 + 8 = 29 ± 2 · PaCO₂ 38 → bù chưa đủ", "Pê a xê ô hai dự kiến khoảng hai mươi chín. Thực tế ba mươi tám, nghĩa là máy thở chưa bù đủ."),
  ],
  [  # 10 Xử trí ca
    ("1 · Hồi sức tưới máu, kiểm soát nhiễm khuẩn", "Xử trí: một, hồi sức tưới máu và kiểm soát nguồn nhiễm khuẩn."),
    ("2 · Tăng tần số máy thở: × 38 ÷ 29", "Hai, tăng tần số máy thở, theo tỉ lệ ba mươi tám chia hai mươi chín."),
    ("3 · pH ≤ 7,20 + tổn thương thận cấp → có thể cân nhắc bicarbonate", "Ba, pê hát dưới bảy phẩy hai kèm tổn thương thận cấp: có thể cân nhắc truyền bi các bô nát."),
    ("4 · Đo lại khí máu và lactate sau 2–4 giờ", "Bốn, đo lại khí máu và lắc tát sau hai đến bốn giờ."),
  ],
  [  # 11 Ôn tập
    ("Lactate: chẩn đoán sốc, theo dõi xu hướng", "Ôn tập. Lắc tát để chẩn đoán sốc và theo dõi đáp ứng."),
    ("ScvO₂, chênh CO₂: đánh giá tưới máu", "Độ bão hoà ô xy tĩnh mạch trung tâm và chênh lệch xê ô hai để đánh giá tưới máu."),
    ("Máy thở: CO₂ theo thông khí phút · O₂ theo FiO₂, PEEP", "Máy thở: xê ô hai chỉnh bằng thông khí phút, ô xy chỉnh bằng ép i ô hai và bíp."),
    ("Bài 9: Tiếp cận Stewart", "Bài cuối: tiếp cận Xtiu-ớt."),
  ],
]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
