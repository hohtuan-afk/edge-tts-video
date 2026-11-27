# Giải mã sốc · Short 6: 5 giai đoạn SCAI (9:16)
NARR = [
  [("Sốc tim: 5 giai đoạn SCAI A → E", "Sốc tim có năm giai đoạn, từ A đến E.")],
  [("A · CÓ NGUY CƠ: chưa có dấu hiệu sốc", "A, có nguy cơ: ví dụ nhồi máu rộng, nhưng chưa có dấu hiệu sốc.")],
  [("B · BẮT ĐẦU: HA thấp, tưới máu còn", "B, bắt đầu: huyết áp thấp hoặc mạch nhanh, nhưng tưới máu còn ổn.")],
  [("C · ĐIỂN HÌNH: giảm tưới máu", "C, điển hình: đã giảm tưới máu, cần thuốc hoặc hỗ trợ cơ học.")],
  [("D · XẤU ĐI · E · NGUY KỊCH", "D, xấu đi dù đã điều trị. E, nguy kịch: trụy mạch, ngừng tim.")],
  [("SCAI 2026: nhìn TƯỚI MÁU · đánh giá LẠI liên tục", "Bản cập nhật năm hai nghìn không trăm hai mươi sáu nhấn mạnh: nhìn tưới máu, và đánh giá lại liên tục.")],
  [("Lưu lại để ôn · xem Bài 6 đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài sáu đầy đủ trên kênh nhé!")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
