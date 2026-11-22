# Giải mã sốc · Short 3: Lactate hay CRT? (9:16)
NARR = [
  [("Lactate hay CRT: cái nào báo hồi sức đủ NHANH hơn?", "Lắc tát hay thời gian đổ đầy mao mạch, cái nào báo hồi sức đủ nhanh hơn?")],
  [("Lactate: giảm CHẬM · đo lại mỗi 2 giờ", "Lắc tát giảm chậm, vì gan cần thời gian thanh thải, nên phải đo lại mỗi hai giờ.")],
  [("CRT: đổi NHANH · vài chục phút", "Thời gian đổ đầy mao mạch thay đổi chỉ sau vài chục phút truyền dịch.")],
  [("Ấn đầu ngón 10 giây · > 3 giây là bất thường", "Ấn đầu ngón tay mười giây, thả ra. Trên ba giây là bất thường.")],
  [("Dùng CẢ HAI: CRT báo nhanh · lactate xác nhận", "Hãy dùng cả hai: thời gian đổ đầy mao mạch báo nhanh, lắc tát xác nhận xu hướng.")],
  [("Lưu lại để ôn · xem Bài 3 đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài ba đầy đủ trên kênh nhé!")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
