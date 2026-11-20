# Giải mã điện giải · Bài 8: Điện giải trong hồi sức — ca DKA (11 cảnh, bài cuối)
NARR = [
  [  # 1 Mở đầu
    ("Nam 24 tuổi · ĐTĐ type 1 · bỏ insulin 2 ngày", "Nam hai mươi bốn tuổi, đái tháo đường típ một, bỏ in su lin hai ngày."),
    ("Nôn · thở nhanh sâu · glucose 30 · pH 7,05 · HCO₃⁻ 6", "Nôn ói, thở nhanh sâu. Glu cô ba mươi, pê hát bảy phẩy không năm, bi các bô nát sáu."),
    ("Na⁺ 128 · K⁺ 5,6 · Cl⁻ 96 · ceton 5,8", "Na tri một trăm hai mươi tám, ka li năm phẩy sáu, clo chín mươi sáu, xê tôn máu năm phẩy tám."),
    ("DKA: điện giải thay đổi TỪNG GIỜ", "Trong nhiễm toan xê tôn, điện giải thay đổi từng giờ. Bài cuối này sẽ gom lại cả chuỗi."),
  ],
  [  # 2 Chẩn đoán
    ("D · glucose ≥ 11,1 hoặc đã biết ĐTĐ", "Chẩn đoán theo đồng thuận năm hai nghìn không trăm hai mươi tư. Đê: glu cô từ mười một phẩy một, hoặc đã biết đái tháo đường."),
    ("K · ceton máu ≥ 3,0", "Ka: xê tôn máu từ ba trở lên."),
    ("A · pH < 7,3 hoặc HCO₃⁻ < 18", "A: pê hát dưới bảy phẩy ba, hoặc bi các bô nát dưới mười tám."),
    ("AG = 128 − (96 + 6) = 26 → tăng", "Khoảng trống a ni on bằng một trăm hai mươi tám trừ, chín mươi sáu cộng sáu, bằng hai mươi sáu, tăng."),
    ("Ức chế SGLT2 → DKA dù đường máu gần bình thường", "Lưu ý: người dùng thuốc ức chế ét giê lờ tê hai có thể bị nhiễm toan xê tôn dù đường máu gần bình thường."),
  ],
  [  # 3 Natri giả thấp
    ("Na⁺ 128: có thật là hạ natri?", "Na tri một trăm hai mươi tám, có thật là hạ na tri?"),
    ("Glucose cao kéo nước ra khỏi tế bào → natri bị pha loãng", "Glu cô cao kéo nước ra khỏi tế bào, pha loãng na tri."),
    ("Glucose ↑ 5,5 → Na⁺ ↓ 1,6–2,4", "Như bài hai: cứ glu cô tăng năm phẩy năm, na tri giảm một phẩy sáu đến hai phẩy bốn."),
    ("Na⁺ hiệu chỉnh ≈ 135–139 · bình thường", "Na tri hiệu chỉnh khoảng một trăm ba mươi lăm đến một trăm ba mươi chín, thực ra bình thường."),
  ],
  [  # 4 Kali nghịch lý
    ("K⁺ 5,6: cao mà vẫn THIẾU", "Ka li năm phẩy sáu, cao, nhưng cơ thể lại đang thiếu ka li."),
    ("Thiếu insulin + toan → kali ra khỏi tế bào", "Thiếu in su lin và toan máu đẩy ka li ra khỏi tế bào."),
    ("Lợi niệu thẩm thấu → mất kali qua thận", "Rồi lợi niệu thẩm thấu làm ka li mất qua thận."),
    ("Tổng thiếu ~3–5 mmol/kg · tảng băng!", "Tổng lượng thiếu khoảng ba đến năm mi li mol mỗi ký. Đúng là tảng băng ka li."),
  ],
  [  # 5 Dịch
    ("① Dịch: NaCl 0,9% hoặc dịch cân bằng", "Bước một: bù dịch bằng na tri clo rua không phẩy chín phần trăm, hoặc dịch cân bằng."),
    ("500–1000 mL/giờ trong 2–4 giờ đầu", "Năm trăm đến một nghìn mi li lít mỗi giờ, trong hai đến bốn giờ đầu."),
    ("Ít hơn ở người già · suy tim · suy thận", "Truyền ít hơn ở người già, suy tim, suy thận."),
    ("Dịch cân bằng: hết DKA nhanh hơn (SMART)", "Phân tích từ thử nghiệm smát cho thấy dịch cân bằng giúp hết nhiễm toan xê tôn nhanh hơn."),
  ],
  [  # 6 Kali trước insulin
    ("② Kiểm tra KALI trước insulin", "Bước hai: kiểm tra ka li trước khi cho in su lin."),
    ("K⁺ < 3,5 → HOÃN insulin · bù 10 mmol/giờ", "Dưới ba phẩy năm: hoãn in su lin, bù ka li mười mi li mol mỗi giờ."),
    ("3,5–5,0 → bù kali song song · mục tiêu 4–5", "Từ ba phẩy năm đến năm: bù ka li song song với in su lin, mục tiêu bốn đến năm."),
    ("> 5,0 → chưa bù · thử lại sau 2 giờ", "Trên năm: chưa bù, thử lại sau hai giờ."),
  ],
  [  # 7 Insulin
    ("③ Insulin truyền 0,1 đơn vị/kg/giờ", "Bước ba: in su lin truyền tĩnh mạch không phẩy một đơn vị mỗi ký mỗi giờ."),
    ("Insulin kéo K⁺ vào tế bào → kali tụt nhanh", "In su lin kéo ka li vào tế bào, nên ka li tụt rất nhanh."),
    ("Glucose < 13,9 → thêm glucose 5–10%", "Khi glu cô dưới mười ba phẩy chín, truyền thêm glu cô năm đến mười phần trăm."),
    ("Tiếp tục insulin đến khi HẾT CETON", "Và tiếp tục in su lin cho đến khi hết xê tôn, không phải đến khi hết đường."),
  ],
  [  # 8 Theo giờ
    ("Theo dõi K⁺: lúc đầu · sau 2 giờ · mỗi 4 giờ", "Theo dõi ka li lúc đầu, sau hai giờ, rồi mỗi bốn giờ."),
    ("Glucose ↓ · K⁺ 5,6 → 3,8 · HCO₃⁻ ↑ dần", "Biểu đồ của ca bệnh: glu cô giảm, ka li từ năm phẩy sáu xuống ba phẩy tám, bi các bô nát tăng dần."),
    ("Cuối giai đoạn: toan tăng Clo do NaCl", "Cuối giai đoạn có thể còn toan tăng clo, do truyền nhiều na tri clo rua."),
    ("→ Nhìn CETON, đừng chỉ nhìn HCO₃⁻", "Đừng nhầm là còn nhiễm toan xê tôn: hãy nhìn xê tôn, đừng chỉ nhìn bi các bô nát."),
  ],
  [  # 9 Bicarbonat, phosphate, magie
    ("Bicarbonat: chỉ khi pH < 7,0", "Bi các bô nát: chỉ cân nhắc khi pê hát dưới bảy."),
    ("Phosphate: không bù thường quy", "Phốt phát: không bù thường quy."),
    ("Bù khi rất thấp · yếu cơ · suy hô hấp · suy tim", "Chỉ bù khi rất thấp, hoặc có yếu cơ, suy hô hấp, suy tim."),
    ("Kiểm tra magie", "Và nhớ kiểm tra ma giê."),
  ],
  [  # 10 Kết thúc DKA
    ("Hết DKA: ceton < 0,6", "Hết nhiễm toan xê tôn khi xê tôn máu dưới không phẩy sáu,"),
    ("và pH ≥ 7,3 hoặc HCO₃⁻ ≥ 18", "và pê hát từ bảy phẩy ba, hoặc bi các bô nát từ mười tám."),
    ("Insulin dưới da · chồng lấp 1–2 giờ rồi mới ngưng truyền", "Chuyển in su lin dưới da, chồng lấp một đến hai giờ rồi mới ngưng truyền."),
    ("Ca bệnh: hết DKA sau ~16 giờ", "Ca bệnh của chúng ta hết nhiễm toan xê tôn sau khoảng mười sáu giờ."),
  ],
  [  # 11 Tổng kết chuỗi
    ("Natri: chuyện của NƯỚC", "Tổng kết chuỗi tám bài. Na tri là chuyện của nước."),
    ("Kali: TẢNG BĂNG", "Ka li là tảng băng."),
    ("Canxi · magie · kali: luôn đi cùng nhau", "Can xi, ma giê, ka li luôn đi cùng nhau."),
    ("Cảm ơn bạn đã theo dõi “Giải mã điện giải”!", "Cảm ơn bạn đã theo dõi trọn chuỗi Giải mã điện giải!"),
  ],
]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
