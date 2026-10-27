# SHORT (9:16) — Bài 1 · 6 bước đọc ECG không bỏ sót (YouTube Shorts / TikTok, ~45 s)
NARR = [
  [("Đọc ECG không bỏ sót? Chỉ cần 6 bước!", "Đọc điện tâm đồ mà không bỏ sót? Chỉ cần nhớ sáu bước.")],
  [("① KIỂM giấy: 25 mm/s · 10 mm/mV · aVR phải âm", "Một, kiểm giấy: hai mươi lăm mi li mét mỗi giây, chuẩn mười mi li mét, và a-vê-rờ phải âm.")],
  [("② xem NHỊP: Đều? Có P? P dương DII? → nhịp xoang", "Hai, xem nhịp: đều không, có P không, P có dương ở chuyển đạo hai không. Đủ ba là nhịp xoang.")],
  [("③ đếm SỐ: 300 – 150 – 100 – 75…", "Ba, đếm số: tìm R trên vạch đậm, rồi đếm ba trăm, một trăm năm mươi, một trăm, bảy mươi lăm.")],
  [("④ tìm TRỤC: DI 👍 + aVF 👍 = bình thường", "Bốn, tìm trục: chuyển đạo một dương, a-vê-ép dương, hai ngón cái cùng chỉ lên là bình thường.")],
  [("⑤ đo KHOẢNG: PR 3–5 ô · QRS < 3 ô · QTc < 450 ms", "Năm, đo khoảng: PR ba đến năm ô nhỏ, QRS dưới ba ô, QTc dưới bốn trăm năm mươi mi li giây.")],
  [("⑥ soi ST: nằm trên đường đẳng điện", "Sáu, soi ét tê: nằm ngang trên đường đẳng điện, sóng T cùng chiều QRS.")],
  [("KIỂM – NHỊP – SỐ – TRỤC – KHOẢNG – ST", "Nhắc lại nhé: kiểm, nhịp, số, trục, khoảng, ét tê.")],
  [("Lưu lại để ôn · xem bài đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài đầy đủ trên kênh nhé.")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
