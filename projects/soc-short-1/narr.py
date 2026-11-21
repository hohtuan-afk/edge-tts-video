# Giải mã sốc · Short 1: Huyết áp bình thường vẫn có thể đang sốc? (9:16)
NARR = [
  [("Huyết áp bình thường vẫn có thể ĐANG SỐC?", "Huyết áp bình thường, mà vẫn có thể đang sốc?")],
  [("Sốc = tế bào thiếu oxy, không chỉ là tụt huyết áp", "Sốc là khi tế bào không nhận đủ ô xy, chứ không chỉ là tụt huyết áp.")],
  [("Tim đập nhanh + co mạch → huyết áp vẫn giữ", "Lúc đầu, tim đập nhanh và mạch máu co lại, nên huyết áp vẫn còn giữ được.")],
  [("Nhìn 3 cửa sổ: da · thận · não", "Hãy nhìn ba cửa sổ: da lạnh nổi bông, nước tiểu ít, và lơ mơ.")],
  [("Lactate > 2 · CRT > 3 giây", "Kèm lắc tát trên hai, và thời gian đổ đầy mao mạch trên ba giây.")],
  [("Lưu lại để ôn · xem Bài 1 đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài một đầy đủ trên kênh nhé!")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
