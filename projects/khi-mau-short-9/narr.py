# Giải mã khí máu · Short 9: Truyền NaCl 0,9% nhiều sao lại toan? (9:16)
NARR = [
  [("Truyền nhiều NaCl 0,9% sao lại toan máu?", "Truyền nhiều na tri clo rua không phẩy chín phần trăm, sao máu lại bị toan?")],
  [("Stewart: nhìn hiệu số ion mạnh (SID)", "Theo xtiu vớt, hãy nhìn hiệu số i on mạnh, ét ai đi.")],
  [("Máu: SID ≈ Na⁺ − Cl⁻ ≈ 35", "Trong máu, ét ai đi xấp xỉ na tri trừ clo, khoảng ba mươi lăm.")],
  [("NaCl 0,9%: Na⁺ 154 · Cl⁻ 154 → SID = 0", "Na tri clo rua không phẩy chín phần trăm có na tri và clo bằng nhau, nên ét ai đi bằng không.")],
  [("Truyền nhiều → SID máu giảm → toan tăng Clo", "Truyền nhiều làm ét ai đi của máu giảm xuống, gây toan tăng clo.")],
  [("Ringer lactat: SID hiệu dụng ≈ 28 → ít toan hơn", "Ring gơ lắc tát có ét ai đi hiệu dụng khoảng hai mươi tám, nên ít gây toan hơn.")],
  [("Lưu lại để ôn · xem trọn chuỗi 9 bài trên kênh!", "Lưu lại để ôn, và xem trọn chuỗi chín bài trên kênh nhé!")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
