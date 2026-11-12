# Giải mã khí máu · Short 8: Chỉnh tần số máy thở theo PaCO₂ (9:16)
NARR = [
  [("PaCO₂ 60, muốn về 40: tăng tần số bao nhiêu?", "Bệnh nhân thở máy, pê a xê ô hai sáu mươi. Muốn về bốn mươi, tăng tần số lên bao nhiêu?")],
  [("PaCO₂ tỉ lệ nghịch với thông khí phút", "Pê a xê ô hai tỉ lệ nghịch với thông khí phút.")],
  [("Tần số mới ≈ tần số cũ × PaCO₂ hiện tại ÷ PaCO₂ mục tiêu", "Công thức: tần số mới xấp xỉ tần số cũ, nhân pê a xê ô hai hiện tại, chia pê a xê ô hai mục tiêu.")],
  [("Ví dụ: 16 × 60 ÷ 40 = 24 lần/phút", "Ví dụ đang thở mười sáu lần: mười sáu nhân sáu mươi chia bốn mươi, bằng hai mươi tư lần mỗi phút.")],
  [("Chỉnh xong → đo lại khí máu", "Sau khi chỉnh, hãy đo lại khí máu để kiểm tra.")],
  [("Lưu ý: tần số quá cao → bẫy khí, auto-PEEP (COPD)", "Lưu ý: tần số quá cao có thể gây bẫy khí và bíp nội sinh, nhất là ở bệnh phổi tắc nghẽn.")],
  [("Lưu lại để ôn · xem Bài 8 đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài tám đầy đủ trên kênh nhé!")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
