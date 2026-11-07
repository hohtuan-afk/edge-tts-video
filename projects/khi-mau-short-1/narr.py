# Giải mã khí máu · Short 1: 4 điều để mẫu khí máu không sai (9:16)
NARR = [
  [("Một bọt khí nhỏ có thể làm sai cả phiếu khí máu!", "Chỉ một bọt khí nhỏ, có thể làm sai cả phiếu khí máu!")],
  [("① Lấy ở động mạch quay, rút kim đè ≥ 2 phút", "Một, lấy ở động mạch quay, rút kim xong đè ít nhất hai phút.")],
  [("② Đuổi hết bọt khí: CO₂ giảm, O₂ tăng giả", "Hai, đuổi hết bọt khí, vì bọt khí làm xê ô hai giảm và ô xy tăng giả.")],
  [("③ Đẩy bớt heparin thừa khỏi ống tiêm", "Ba, đẩy bớt hê pa rin thừa ra khỏi ống tiêm.")],
  [("④ Phân tích sớm, trong vòng 30 phút", "Bốn, phân tích càng sớm càng tốt, trong vòng ba mươi phút.")],
  [("Nhớ: BỌT · HEPARIN · THỜI GIAN", "Nhớ ba kẻ phá mẫu: bọt khí, hê pa rin, và thời gian.")],
  [("Lưu lại để ôn · xem bài đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài đầy đủ trên kênh nhé!")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
