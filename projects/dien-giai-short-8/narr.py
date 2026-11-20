# Giải mã điện giải · Short 8: DKA — K⁺ 5,6 mà vẫn thiếu kali (9:16)
NARR = [
  [("DKA: K⁺ 5,6 mà vẫn THIẾU kali?", "Nhiễm toan xê tôn: ka li năm phẩy sáu, mà cơ thể vẫn thiếu ka li?")],
  [("Thiếu insulin + toan → kali ra khỏi tế bào", "Thiếu in su lin và toan máu đẩy ka li ra khỏi tế bào, nên ka li máu trông cao.")],
  [("Lợi niệu thẩm thấu → mất kali qua thận", "Nhưng ka li lại mất dần qua nước tiểu.")],
  [("Cho insulin → kali tụt NHANH", "Khi cho in su lin, ka li chui vào tế bào và tụt rất nhanh.")],
  [("K⁺ < 3,5 → HOÃN insulin, bù kali trước", "Nên nếu ka li dưới ba phẩy năm, hoãn in su lin, bù ka li trước.")],
  [("Lưu lại để ôn · xem Bài 8 đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài tám đầy đủ trên kênh nhé!")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
