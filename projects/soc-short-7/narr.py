# Giải mã sốc · Short 7: 60 phút đầu (9:16)
NARR = [
  [("Sốc nhiễm khuẩn: 60 PHÚT ĐẦU", "Sốc nhiễm khuẩn: sáu mươi phút đầu, theo hướng dẫn mới.")],
  [("0' · Sàng lọc NEWS (không dùng riêng qSOFA)", "Phút không: sàng lọc bằng điểm cảnh báo sớm Niu, không dùng riêng quích Sô pha.")],
  [("15' · Cấy máu 2 bộ + lactate", "Phút mười lăm: cấy máu hai bộ, và đo lắc tát.")],
  [("30' · Kháng sinh phổ rộng (≤ 1 giờ)", "Phút ba mươi: kháng sinh phổ rộng, chậm nhất trong một giờ.")],
  [("45' · Dịch · 60' · Norepinephrine", "Phút bốn mươi lăm: truyền dịch. Phút sáu mươi: nô ơ e pi nê phrin nếu huyết áp vẫn thấp.")],
  [("Kiểm soát ổ · đánh giá LẠI", "Đừng quên kiểm soát ổ nhiễm, và đánh giá lại liên tục.")],
  [("Lưu lại để ôn · xem Bài 7 đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài bảy đầy đủ trên kênh nhé!")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
