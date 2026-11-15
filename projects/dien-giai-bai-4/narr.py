# Giải mã điện giải · Bài 4: Tăng natri máu (11 cảnh)
NARR = [
  [  # 1 Mở đầu
    ("Cụ ông 85 tuổi · sốt, viêm phổi 3 ngày · lơ mơ", "Cụ ông tám mươi lăm tuổi ở viện dưỡng lão, sốt do viêm phổi ba ngày, nay lơ mơ."),
    ("Na⁺ 162 mmol/L", "Na tri máu một trăm sáu mươi hai."),
    ("Tăng natri = THIẾU NƯỚC + không uống được", "Tăng na tri gần như luôn là thiếu nước, cộng với không uống được."),
  ],
  [  # 2 Định nghĩa
    ("Tăng natri: Na⁺ > 145 · nặng > 155", "Tăng na tri là na tri máu trên một trăm bốn mươi lăm, nặng khi trên một trăm năm mươi lăm."),
    ("Khát là hàng rào bảo vệ mạnh nhất", "Bình thường, cơn khát là hàng rào bảo vệ mạnh nhất."),
    ("Người già · trẻ nhỏ · rối loạn ý thức · thở máy", "Nên người dễ bị là người già, trẻ nhỏ, người rối loạn ý thức, bệnh nhân thở máy hay an thần."),
    ("Không tự khát, không tự uống được", "Những người không tự khát, hoặc không tự uống được."),
  ],
  [  # 3 Não
    ("Máu đặc → nước rút khỏi tế bào não → TEO", "Khi máu đặc, nước rút khỏi tế bào não, tế bào teo lại."),
    ("Lơ mơ · kích thích · co giật", "Gây lơ mơ, kích thích, co giật."),
    ("~48 giờ: não thích nghi, giữ lại chất thẩm thấu", "Sau khoảng bốn mươi tám giờ, não thích nghi bằng cách giữ lại chất thẩm thấu."),
    ("Mạn tính: bù nước quá nhanh → có thể PHÙ NÃO", "Vì vậy ở thể mạn, bù nước quá nhanh có thể gây phù não."),
  ],
  [  # 4 Nguyên nhân
    ("MẤT NƯỚC (đa số)", "Nguyên nhân thứ nhất, chiếm đa số: mất nước."),
    ("Da, hô hấp: sốt, thở nhanh · tiêu hoá: tiêu chảy thẩm thấu", "Qua da và hô hấp khi sốt, thở nhanh. Qua tiêu hoá khi tiêu chảy thẩm thấu."),
    ("Thận: lợi tiểu thẩm thấu (glucose, urê, mannitol) · đái tháo nhạt", "Qua thận khi lợi tiểu thẩm thấu do glu cô, u rê, ma ni tôn, hoặc đái tháo nhạt."),
    ("THỪA MUỐI: NaCl 3%, natri bicarbonat, nước biển", "Nguyên nhân thứ hai, ít gặp hơn: thừa muối, do truyền na tri clo rua ba phần trăm, na tri bi các bô nát, hoặc uống nước biển."),
  ],
  [  # 5 ALTT niệu
    ("Chẩn đoán: ALTT niệu", "Chẩn đoán dựa vào áp lực thẩm thấu niệu."),
    ("> 600 → thận giữ nước tốt → mất ngoài thận / không uống", "Trên sáu trăm: thận đang giữ nước tốt, vậy nước mất ngoài thận, hoặc không được uống."),
    ("< 300 → nước tiểu loãng dù máu đặc → ĐÁI THÁO NHẠT", "Dưới ba trăm: nước tiểu vẫn loãng dù máu đặc, nghĩ đến đái tháo nhạt."),
    ("300–600 → lợi tiểu thẩm thấu hoặc đái tháo nhạt một phần", "Từ ba trăm đến sáu trăm: lợi tiểu thẩm thấu, hoặc đái tháo nhạt một phần."),
  ],
  [  # 6 Desmopressin
    ("Nghiệm pháp desmopressin", "Để phân biệt, làm nghiệm pháp đét mô prét xin."),
    ("ALTT niệu TĂNG rõ → thiếu ADH → trung ương", "Áp lực thẩm thấu niệu tăng rõ: cơ thể thiếu a đê hát, đái tháo nhạt trung ương."),
    ("KHÔNG đổi → thận không đáp ứng → do thận", "Không thay đổi: thận không đáp ứng, đái tháo nhạt do thận."),
  ],
  [  # 7 Đái tháo nhạt
    ("Trung ương: chấn thương, phẫu thuật tuyến yên, u", "Đái tháo nhạt trung ương: do chấn thương, phẫu thuật vùng tuyến yên, hoặc khối u."),
    ("Do thận: lithium · tăng canxi · hạ kali", "Đái tháo nhạt do thận: do li ti, tăng can xi, hoặc hạ ka li máu."),
    ("Tên mới (2022): thiếu hụt AVP · kháng AVP", "Từ năm hai nghìn không trăm hai mươi hai, đái tháo nhạt được đổi tên thành thiếu hụt a vê pê và kháng a vê pê."),
  ],
  [  # 8 Lượng nước thiếu
    ("Lượng nước thiếu = nước cơ thể × (Na⁺ ÷ 140 − 1)", "Tính lượng nước thiếu: bằng nước cơ thể nhân với, na tri chia một trăm bốn mươi, trừ một."),
    ("Nước cơ thể ≈ 50% cân nặng (người già)", "Nước cơ thể ở người già chiếm khoảng năm mươi phần trăm cân nặng."),
    ("60 kg → 30 L × (162 ÷ 140 − 1) ≈ 4,7 L", "Cụ ông sáu mươi ký: ba mươi lít nhân với, một trăm sáu mươi hai chia một trăm bốn mươi, trừ một, khoảng bốn phẩy bảy lít."),
    ("+ lượng đang mất (sốt, thở nhanh, tiểu)", "Cộng thêm lượng nước đang tiếp tục mất do sốt, thở nhanh, nước tiểu."),
  ],
  [  # 9 Bù gì
    ("Sốc → NaCl 0,9% trước", "Nếu có sốc, bù na tri clo rua không phẩy chín phần trăm trước để ổn định huyết động."),
    ("Ưu tiên nước lọc: uống / qua ống thông dạ dày", "Sau đó bù nước tự do, ưu tiên nước lọc qua đường uống hoặc ống thông dạ dày."),
    ("Tĩnh mạch: glucose 5% · theo dõi đường máu", "Đường tĩnh mạch: truyền glu cô năm phần trăm, nhớ theo dõi đường máu."),
  ],
  [  # 10 Tốc độ
    ("Mạn (> 48 giờ): hạ ~10 mmol/L trong 24 giờ", "Tốc độ: thể mạn, trên bốn mươi tám giờ, hạ khoảng mười mi li mol trên lít trong hai mươi bốn giờ."),
    ("Cấp (< 48 giờ): có thể hạ nhanh ~1 mmol/L/giờ", "Thể cấp, dưới bốn mươi tám giờ, có thể hạ nhanh, khoảng một mi li mol mỗi giờ."),
    ("Bằng chứng mới: hạ nhanh hơn không tăng phù não ở người lớn", "Bằng chứng mới: ở người lớn, hạ nhanh hơn không làm tăng phù não."),
    ("Hạ quá chậm → tử vong cao hơn → đừng quá rụt rè", "Còn hạ quá chậm liên quan tử vong cao hơn. Vậy đừng quá rụt rè."),
  ],
  [  # 11 Giải ca + ôn tập
    ("Cụ ông: ALTT niệu 750 → mất ngoài thận + không uống", "Quay lại cụ ông: áp lực thẩm thấu niệu bảy trăm năm mươi, mất nước ngoài thận và không uống được."),
    ("Thiếu ~4,7 L → bù dần trong ~48 giờ (ống thông + glucose 5%)", "Thiếu khoảng bốn phẩy bảy lít, bù dần trong khoảng bốn mươi tám giờ, qua ống thông dạ dày và glu cô năm phần trăm, cộng lượng đang mất."),
    ("Mục tiêu 24 giờ: 162 → ~152 · thử Na⁺ mỗi 4–6 giờ", "Mục tiêu sau hai mươi bốn giờ khoảng một trăm năm mươi hai, thử na tri mỗi bốn đến sáu giờ."),
    ("Bài 5: Hạ kali máu", "Bài sau: hạ ka li máu."),
  ],
]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
