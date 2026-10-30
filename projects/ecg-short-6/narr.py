# SHORT (9:16) — Bài 6 · Không chênh ≠ không tắc: de Winter · Wellens · thành sau · Sgarbossa
NARR = [
  [("Không chênh ≠ không tắc! 4 dạng ECG dễ bỏ sót", "Ét tê không chênh, chưa chắc mạch vành không tắc. Đây là bốn dạng điện tâm đồ dễ bỏ sót.")],
  [("① de Winter: ST↓ đi lên V1–V6 + T cao cân đối → tắc liên thất trước", "Một, dạng đơ Uyn-tơ: ét tê chênh xuống đi lên, kèm sóng T cao cân đối ở vê một đến vê sáu. Nghĩ tắc động mạch liên thất trước đoạn gần.")],
  [("② Wellens: T đảo sâu / hai pha V2–V3 khi hết đau → tránh gắng sức", "Hai, Uê-len: sóng T đảo sâu hoặc hai pha ở vê hai, vê ba khi đã hết đau. Hẹp nặng, cần tránh nghiệm pháp gắng sức.")],
  [("③ Thành sau: ST↓ tối đa V1–V4, R cao → gắn V7–V9", "Ba, thành sau: ét tê chênh xuống rõ nhất ở vê một đến vê bốn, sóng R cao. Gắn thêm vê bảy đến vê chín.")],
  [("④ Block nhánh trái: ST CÙNG chiều, hoặc ngược ≥ 25% S → Sgarbossa", "Bốn, block nhánh trái: ét tê cùng chiều QRS, hoặc ngược chiều từ hai mươi lăm phần trăm sóng S, là tiêu chuẩn Sgát-bô-sa cải tiến dương tính.")],
  [("Không chênh ≠ không tắc — nhìn T, soi gương, QRS rộng", "Nhớ nhé: không chênh không có nghĩa là không tắc. Nhìn sóng T, soi gương, và QRS rộng.")],
  [("Lưu lại để ôn · xem bài đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài đầy đủ trên kênh nhé.")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
