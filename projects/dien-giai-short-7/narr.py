# Giải mã điện giải · Short 7: Kali bù mãi không lên? Thủ phạm là magie (9:16)
NARR = [
  [("Kali bù mãi không lên?", "Bù ka li mãi mà ka li không lên?")],
  [("Thủ phạm: MAGIE thấp", "Thủ phạm thường là ma giê thấp.")],
  [("Mg²⁺ thấp → thận tiếp tục thải K⁺", "Thiếu ma giê, thận tiếp tục thải ka li ra nước tiểu.")],
  [("Canxi cũng bù không lên!", "Can xi cũng vậy, bù mãi không lên.")],
  [("→ Kiểm tra & bù magie cùng lúc", "Hãy kiểm tra và bù ma giê cùng lúc.")],
  [("Lưu lại để ôn · xem Bài 7 đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài bảy đầy đủ trên kênh nhé!")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
