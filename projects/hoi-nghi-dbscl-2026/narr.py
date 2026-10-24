# TikTok 9:16 ~75s – Hội nghị KH Hồi sức Cấp cứu & Chống độc ĐBSCL lần II (Cần Thơ, 24/10/2026)
# (phụ_đề, lời_đọc) – giọng vi-VN-NamMinhNeural
NARR = [
 [("Thứ Bảy này, mình không đi chơi. Mình đi HỌC!", "Thứ Bảy này, mình không đi chơi. Mình đi học!")],
 [("Hôm nay mình có mặt tại TP. Cần Thơ, dự Hội nghị khoa học Hồi sức cấp cứu & Chống độc ĐBSCL lần II",
   "Hôm nay, mình có mặt tại thành phố Cần Thơ, dự Hội nghị khoa học Hồi sức cấp cứu và Chống độc, Đồng bằng sông Cửu Long lần thứ hai."),
  ("Mở màn là tiết mục văn nghệ rực rỡ, đưa cả hội trường đi qua những miền đất Tổ quốc",
   "Mở màn là tiết mục văn nghệ rực rỡ, đưa cả hội trường đi qua những miền đất của Tổ quốc.")],
 [("Cờ đỏ sao vàng tung bay, tà áo dài thướt tha – một khởi đầu thật tự hào",
   "Cờ đỏ sao vàng tung bay, tà áo dài thướt tha, một khởi đầu thật tự hào.")],
 [("Phát biểu khai mạc hội nghị", "Tiếp theo là phần phát biểu khai mạc hội nghị."),
  ("Ban tổ chức tri ân các đơn vị đồng hành", "Và ban tổ chức tri ân các đơn vị đã đồng hành cùng hội nghị.")],
 [("Phiên toàn thể đầu tiên: cập nhật Surviving Sepsis Campaign 2026",
   "Phiên toàn thể đầu tiên cập nhật hướng dẫn Chiến dịch Sống còn Nhiễm khuẩn huyết, năm hai nghìn không trăm hai mươi sáu."),
  ("129 khuyến cáo – chắt lọc để áp dụng ngay tại giường bệnh",
   "Một trăm hai mươi chín khuyến cáo, được chắt lọc để áp dụng ngay tại giường bệnh.")],
 [("Huyết động: Noradrenaline ảnh hưởng thế nào lên cung lượng tim và tương hợp thất – động mạch (VAC)?",
   "Rồi đến phần huyết động. Nô a đrê na lin ảnh hưởng thế nào lên cung lượng tim, và tương hợp giữa tâm thất với động mạch?"),
  ("Khi nào trái tim bắt đầu giảm hiệu suất?", "Và khi nào, trái tim bắt đầu giảm hiệu suất?")],
 [("Hội trường chuyên đề: thở máy", "Ở hội trường chuyên đề, câu chuyện chuyển sang thở máy."),
  ("Mechanical power – công suất cơ học có những hạn chế gì?",
   "Công suất cơ học, có những hạn chế gì, khi ta dùng nó để bảo vệ phổi?")],
 [("Hội trường kín chỗ, thảo luận sôi nổi đến phút cuối", "Hội trường kín chỗ, thảo luận sôi nổi đến tận phút cuối."),
  ("Vì sau mỗi slide là một bệnh nhân đang chờ ta ở khoa", "Vì sau mỗi trang trình chiếu, là một bệnh nhân đang chờ ta ở khoa.")],
 [("HỌC ĐỂ CỨU NGƯỜI", "Học, để cứu người."),
  ("Cảm ơn Ban tổ chức và quý thầy cô vì một ngày thật nhiều giá trị",
   "Cảm ơn ban tổ chức và quý thầy cô, vì một ngày thật nhiều giá trị."),
  ("Bạn cũng làm Hồi sức? Thả ❤️ và lưu lại nhé!", "Bạn cũng làm hồi sức? Thả tim, và lưu lại nhé!")],
]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
