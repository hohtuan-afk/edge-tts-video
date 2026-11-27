# Giải mã sốc · Short 8: 5 câu hỏi trước mọi ca sốc (9:16)
NARR = [
  [("5 CÂU HỎI trước MỌI ca sốc", "Năm câu hỏi trước mọi ca sốc.")],
  [("① Có sốc? · nhìn TƯỚI MÁU, không chỉ huyết áp", "Một: có sốc không? Nhìn tưới máu, không chỉ con số huyết áp.")],
  [("② Kiểu gì? · bơm · ống · nước · chặn", "Hai: sốc kiểu gì? Bơm hỏng, ống giãn, thiếu nước, hay bị chặn.")],
  [("③ Dịch hay vận mạch? · nâng chân trước", "Ba: cần dịch hay vận mạch? Nâng chân thử trước khi thêm dịch.")],
  [("④ Tưới máu cải thiện? · CRT · lactate", "Bốn: tưới máu có cải thiện không? Xem thời gian đổ đầy mao mạch và lắc tát.")],
  [("⑤ Nguyên nhân đã SỬA?", "Năm: nguyên nhân đã được sửa chưa?")],
  [("Lưu lại để ôn · xem trọn chuỗi Giải mã sốc!", "Lưu lại để ôn, và xem trọn chuỗi Giải mã sốc trên kênh nhé!")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
