# Giải mã điện giải · Bài 6: Tăng kali máu — xử trí cấp cứu (11 cảnh)
NARR = [
  [  # 1 Mở đầu
    ("Ông 68 tuổi · bệnh thận mạn · ức chế men chuyển + spironolactone", "Ông sáu mươi tám tuổi, bệnh thận mạn, đang dùng thuốc ức chế men chuyển và xpi rô nô lắc tôn."),
    ("Mệt · nhịp chậm · K⁺ 7,1", "Nay mệt, nhịp tim chậm, ka li máu bảy phẩy một."),
    ("Tăng kali: kẻ giết người thầm lặng", "Tăng ka li là kẻ giết người thầm lặng: có thể gây ngừng tim mà gần như không báo trước."),
  ],
  [  # 2 Giả tăng kali
    ("Trước tiên: có phải GIẢ tăng kali?", "Trước tiên, hỏi: có phải giả tăng ka li không?"),
    ("Mẫu tan huyết · garô lâu · nắm tay khi lấy máu", "Mẫu máu bị tan huyết, garô quá lâu, hay bệnh nhân nắm tay khi lấy máu, đều làm ka li tăng giả."),
    ("ECG đã thay đổi → xử trí NGAY, không chờ thử lại", "Nhưng nếu điện tâm đồ đã thay đổi, phải xử trí ngay, không chờ thử lại."),
  ],
  [  # 3 Mức độ
    ("Nhẹ 5,5–5,9 · vừa 6,0–6,4 · nặng ≥ 6,5", "Theo hướng dẫn u ka ka a của Anh: nhẹ từ năm phẩy năm đến năm phẩy chín, vừa từ sáu đến sáu phẩy bốn, nặng từ sáu phẩy năm trở lên."),
    ("K⁺ ≥ 6,0 → ECG 12 chuyển đạo", "Từ sáu trở lên: làm điện tâm đồ mười hai chuyển đạo."),
    ("K⁺ ≥ 6,5 → monitor liên tục", "Từ sáu phẩy năm: gắn mô ni tơ liên tục."),
  ],
  [  # 4 ECG
    ("① T cao nhọn", "Điện tâm đồ tăng ka li thay đổi theo thứ tự. Một: sóng tê cao nhọn."),
    ("② P dẹt · PR kéo dài", "Hai: sóng pê dẹt, khoảng pê rờ kéo dài."),
    ("③ QRS giãn rộng", "Ba: phức bộ qui rờ ét giãn rộng."),
    ("④ Sóng hình sin → rung thất / vô tâm thu", "Bốn: sóng hình sin, rồi rung thất hoặc vô tâm thu."),
    ("ECG KHÔNG song song chặt với con số K⁺", "Lưu ý: điện tâm đồ không đi song song chặt với con số ka li."),
  ],
  [  # 5 4 bước
    ("4 bước xử trí", "Xử trí theo bốn bước."),
    ("① Bảo vệ tim · ② Đẩy kali vào tế bào", "Một: bảo vệ tim. Hai: đẩy ka li vào tế bào."),
    ("③ Thải kali ra · ④ Theo dõi & phòng ngừa", "Ba: thải ka li ra khỏi cơ thể. Bốn: theo dõi và phòng ngừa."),
  ],
  [  # 6 Canxi
    ("① Bảo vệ tim: CANXI (khi ECG thay đổi)", "Bước một, bảo vệ tim bằng can xi, khi điện tâm đồ có thay đổi."),
    ("Canxi gluconat 10% · 30 mL trong 10 phút", "Can xi glu cô nát mười phần trăm, ba mươi mi li lít, truyền trong mười phút."),
    ("Ngừng tim: canxi clorua 10% · 10 mL trong 5 phút", "Khi ngừng tim hoặc dọa ngừng tim, dùng can xi clo rua mười phần trăm, mười mi li lít trong năm phút."),
    ("Ổn định màng tim · KHÔNG hạ kali", "Can xi ổn định màng tế bào cơ tim, nhưng không làm hạ ka li."),
  ],
  [  # 7 Đẩy vào
    ("② Insulin 10 đơn vị + 25 g glucose tĩnh mạch", "Bước hai, đẩy ka li vào tế bào: in su lin mười đơn vị, kèm hai mươi lăm gam glu cô tĩnh mạch."),
    ("Đường máu < 7 → glucose 10% · 50 mL/giờ × 5 giờ", "Nếu đường máu trước điều trị dưới bảy, truyền thêm glu cô mười phần trăm, năm mươi mi li lít mỗi giờ, trong năm giờ."),
    ("Theo dõi đường máu trong 6 giờ", "Theo dõi đường máu trong sáu giờ, vì hạ đường huyết rất hay gặp."),
    ("Salbutamol khí dung 10–20 mg: chỉ HỖ TRỢ", "Xan bu ta mon khí dung mười đến hai mươi mi li gam, chỉ để hỗ trợ, không dùng đơn độc."),
  ],
  [  # 8 Thải ra
    ("③ Chất gắn kali: SZC 10 g × 3 lần/ngày", "Bước ba, thải ka li ra: chất gắn ka li ét dét xê, mười gam, ba lần mỗi ngày."),
    ("hoặc patiromer · resin cũ không còn khuyến cáo", "Hoặc pa ti rô me. Các loại nhựa trao đổi cũ không còn được khuyến cáo."),
    ("Lợi tiểu quai nếu còn nước tiểu", "Dùng lợi tiểu quai nếu bệnh nhân còn nước tiểu."),
    ("Lọc máu: kháng trị · BN chạy thận K⁺ ≥ 6,5", "Lọc máu khi kháng trị, hoặc bệnh nhân chạy thận có ka li từ sáu phẩy năm."),
  ],
  [  # 9 Theo dõi & nguyên nhân
    ("④ Thử K⁺ sau 1 · 2 · 4 · 6 · 24 giờ", "Bước bốn: thử lại ka li sau một, hai, bốn, sáu, và hai mươi bốn giờ."),
    ("Tổn thương thận · toan máu · tiêu cơ vân · ly giải u", "Tìm nguyên nhân: tổn thương thận, toan máu, tiêu cơ vân, ly giải u."),
    ("Thuốc: ƯCMC/CTTA · spironolactone · NSAID · trimethoprim", "Và thuốc: ức chế men chuyển, chẹn thụ thể, xpi rô nô lắc tôn, thuốc kháng viêm không steroid, tri mê tô prim."),
  ],
  [  # 10 Giải ca
    ("ECG: T cao nhọn + QRS giãn → canxi gluconat", "Quay lại ca bệnh: điện tâm đồ có sóng tê cao nhọn và qui rờ ét giãn, cho can xi glu cô nát."),
    ("Insulin + glucose · đường máu 5,8 → thêm glucose 10%", "Cho in su lin cộng glu cô. Đường máu năm phẩy tám, nên truyền thêm glu cô mười phần trăm."),
    ("+ salbutamol + SZC · ngưng spironolactone", "Thêm xan bu ta mon và ét dét xê, ngưng xpi rô nô lắc tôn."),
    ("Sau 2 giờ: K⁺ 5,8 · ECG cải thiện", "Sau hai giờ, ka li còn năm phẩy tám, điện tâm đồ cải thiện."),
  ],
  [  # 11 Ôn tập
    ("Bảo vệ → Đẩy vào → Thải ra → Theo dõi", "Ôn tập bốn bước: bảo vệ tim, đẩy vào tế bào, thải ra, theo dõi."),
    ("Canxi KHÔNG hạ kali!", "Nhớ: can xi không hạ ka li."),
    ("Bài 7: Canxi, magie, phosphate", "Bài sau: can xi, ma giê và phốt phát."),
  ],
]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
