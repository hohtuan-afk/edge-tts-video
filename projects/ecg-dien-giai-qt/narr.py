# BÀI 12 · ĐIỆN GIẢI & QT — KALI, CANXI, QT DÀI, XOẮN ĐỈNH (bài cuối chuỗi)
# Thần chú: NHÌN T – TÌM U – ĐO QT
# Khung 7 trạm: NHÌN T → TĂNG KALI → TÌM U → CANXI → ĐO QT → XOẮN ĐỈNH → ÔN TẬP
# Nguồn: 2025 AHA Guidelines Part 10 (Special Circumstances: tăng kali — dấu hiệu ECG, độ nhạy/đặc hiệu thấp);
#        2025 AHA Part 9 (nhịp nhanh thất đa hình, QT dài); 2022 ESC Ventricular Arrhythmias (QT dài bẩm sinh: QTc ≥ 480 ms);
#        AHA/ACCF Scientific Statement — Prevention of Torsade de Pointes in Hospital Settings (QTc > 500 ms, tăng > 60 ms);
#        AHA/ACCF/HRS 2009 Standardization of ECG (ngưỡng QTc); LITFL (hình thái hạ kali, canxi).
# Quy tắc đọc: ST → "ét tê"; Bazett → "Ba-dét"; Fridericia → "Phri-đơ-ri-xi-a".
NARR = [
  # 0 · Bìa
  [("Điện giải & QT — Kali, Canxi, QT dài, xoắn đỉnh",
    "Điện giải và Q T: kali, canxi, Q T dài, và xoắn đỉnh."),
   ("Bài 11: tăng kali có thể giả ST chênh · Hôm nay học kỹ.",
    "Ở bài mười một, ta đã thấy tăng kali có thể giả ét tê chênh lên. Hôm nay ta học kỹ."),
   ("Thần chú: NHÌN T – TÌM U – ĐO QT",
    "Thần chú gồm ba bước: nhìn T, tìm U, đo Q T.")],
  # 1 · Nhìn T
  [("Trạm 1 · NHÌN T — điện giải đổi TÁI CỰC trước tiên.",
    "Trạm một, nhìn T. Rối loạn điện giải làm thay đổi tái cực trước tiên, nên hãy nhìn sóng T."),
   ("T CAO, NHỌN, hẹp đáy, cân đối → nghĩ TĂNG KALI.",
    "Sóng T cao, nhọn, hẹp đáy và cân đối: nghĩ đến tăng kali."),
   ("T DẸT, thấp → nghĩ HẠ KALI.",
    "Sóng T dẹt và thấp: nghĩ đến hạ kali."),
   ("So sánh với ECG cũ · theo dõi nối tiếp.",
    "Luôn so sánh với điện tâm đồ cũ, và theo dõi nối tiếp.")],
  # 2 · Tăng kali: tiến triển
  [("Trạm 2 · TĂNG KALI: tiến triển trên cùng một dải.",
    "Trạm hai, tăng kali. Hãy xem sự tiến triển trên cùng một dải điện tâm đồ."),
   ("① T cao nhọn, hẹp đáy.",
    "Một, sóng T cao nhọn, hẹp đáy."),
   ("② P dẹt dần, PR dài ra · P có thể mất.",
    "Hai, sóng P dẹt dần, PR dài ra, và P có thể mất hẳn."),
   ("③ QRS giãn rộng · nhịp chậm, block.",
    "Ba, QRS giãn rộng, kèm nhịp chậm hoặc block."),
   ("④ QRS hoà vào T → HÌNH SIN.",
    "Bốn, QRS hoà vào sóng T, tạo thành hình sin."),
   ("⑤ Rung thất hoặc vô tâm thu.",
    "Năm, rung thất hoặc vô tâm thu.")],
  # 3 · Tăng kali: bẫy
  [("Thứ tự trên chỉ GẦN ĐÚNG — không phải lúc nào cũng đi đủ từng bậc.",
    "Thứ tự trên chỉ gần đúng. Không phải lúc nào tim cũng đi đủ từng bậc."),
   ("AHA 2025: dấu hiệu ECG có độ nhạy, độ đặc hiệu THẤP → ECG bình thường KHÔNG loại trừ.",
    "Theo hướng dẫn của Hội Tim mạch Hoa Kỳ năm hai nghìn không trăm hai mươi lăm, các dấu hiệu điện tâm đồ có độ nhạy và độ đặc hiệu thấp. Điện tâm đồ bình thường không loại trừ tăng kali."),
   ("Kẻ giả dạng: ST chênh · block nhánh · nhịp chậm · QRS rộng như nhịp nhanh thất.",
    "Tăng kali còn là kẻ giả dạng: giả ét tê chênh lên, giả block nhánh, gây nhịp chậm, hoặc QRS rộng như nhịp nhanh thất.")],
  # 4 · Tìm U: hạ kali, hạ magie
  [("Trạm 3 · TÌM U — HẠ KALI.",
    "Trạm ba, tìm U, gặp trong hạ kali."),
   ("T dẹt hoặc đảo · sóng U nổi rõ sau T (rõ ở V2 – V3).",
    "Sóng T dẹt hoặc đảo ngược, và sóng U nổi rõ ngay sau T, rõ nhất ở vê hai, vê ba."),
   ("ST chênh xuống nhẹ.",
    "Đoạn ét tê chênh xuống nhẹ."),
   ("T và U nhập nhau → trông như QT dài (thực ra là QU).",
    "Khi T và U nhập vào nhau, trông như Q T dài, thực ra là khoảng Q U."),
   ("HẠ MAGIE: hình ảnh giống hệt, hay đi kèm hạ kali · cả hai dễ gây XOẮN ĐỈNH.",
    "Hạ ma-giê cho hình ảnh giống hệt, và hay đi kèm hạ kali. Cả hai đều dễ gây xoắn đỉnh.")],
  # 5 · Canxi
  [("Trạm 4 · CANXI đổi đoạn ST.",
    "Trạm bốn, canxi. Canxi làm thay đổi đoạn ét tê."),
   ("TĂNG canxi: ST NGẮN → QT ngắn.",
    "Tăng canxi: đoạn ét tê ngắn lại, nên Q T ngắn."),
   ("HẠ canxi: ST KÉO DÀI → QT dài · sóng T vẫn bình thường.",
    "Hạ canxi: đoạn ét tê kéo dài, nên Q T dài, trong khi sóng T vẫn bình thường."),
   ("Mẹo: KALI đổi sóng T · CANXI đổi đoạn ST.",
    "Mẹo nhớ: kali đổi sóng T, canxi đổi đoạn ét tê.")],
  # 6 · Đo QT
  [("Trạm 5 · ĐO QT: từ ĐẦU QRS đến CUỐI T · đo ở II hoặc V5.",
    "Trạm năm, đo Q T. Đo từ đầu QRS đến cuối sóng T, ở chuyển đạo hai hoặc vê năm."),
   ("Cuối T: kẻ tiếp tuyến ở sườn xuống dốc nhất, cắt đường đẳng điện · không tính sóng U.",
    "Để tìm cuối sóng T, kẻ đường tiếp tuyến ở sườn xuống dốc nhất, cắt đường đẳng điện. Không tính sóng U."),
   ("Tim nhanh → QT ngắn lại → hiệu chỉnh: QTc = QT ÷ √RR (Bazett).",
    "Tim càng nhanh, Q T càng ngắn, nên phải hiệu chỉnh. Q T c bằng Q T chia căn bậc hai của R R, theo công thức Ba-dét."),
   ("Tim nhanh: Bazett ước quá cao → dùng Fridericia (÷ căn bậc ba RR).",
    "Khi tim nhanh, công thức Ba-dét ước quá cao. Lúc đó dùng công thức Phri-đơ-ri-xi-a, chia cho căn bậc ba của R R."),
   ("Mẹo nhanh: QT > ½ RR → nghi QT dài (khi tần số bình thường).",
    "Mẹo nhanh: nếu Q T dài hơn một nửa khoảng R R, hãy nghi Q T dài, khi tần số tim bình thường."),
   ("QTc dài: ≥ 450 ms (nam) · ≥ 460 ms (nữ) · > 500 ms → NGUY CƠ CAO.",
    "Q T c được coi là dài khi từ bốn trăm năm mươi mi li giây ở nam, và bốn trăm sáu mươi mi li giây ở nữ. Trên năm trăm mi li giây là nguy cơ cao.")],
  # 7 · QT dài
  [("QT dài MẮC PHẢI: thuốc + hạ kali, hạ magie, nhịp chậm.",
    "Q T dài mắc phải thường do thuốc, cộng thêm hạ kali, hạ ma-giê, hoặc nhịp chậm."),
   ("Thuốc hay gặp: macrolid, quinolon · chống loạn thần · ondansetron · amiodaron.",
    "Các thuốc hay gặp: kháng sinh nhóm ma-cờ-rô-lít và quy-nô-lôn, thuốc chống loạn thần, on-đan-xê-tron, và a-mi-ô-đa-rôn."),
   ("QTc tăng > 60 ms so với trước dùng thuốc → cũng nguy cơ cao.",
    "Q T c tăng hơn sáu mươi mi li giây so với trước khi dùng thuốc cũng là nguy cơ cao."),
   ("QT dài BẨM SINH: QTc ≥ 480 ms (ESC 2022) · ngất khi gắng sức, gia đình đột tử.",
    "Q T dài bẩm sinh được chẩn đoán khi Q T c từ bốn trăm tám mươi mi li giây trở lên, theo hướng dẫn châu Âu năm hai nghìn không trăm hai mươi hai. Gợi ý khi ngất lúc gắng sức, hoặc gia đình có người đột tử.")],
  # 8 · Xoắn đỉnh
  [("Trạm 6 · XOẮN ĐỈNH: nhịp nhanh thất ĐA HÌNH trên nền QT dài.",
    "Trạm sáu, xoắn đỉnh. Đây là nhịp nhanh thất đa hình trên nền Q T dài."),
   ("QRS “xoắn” quanh đường đẳng điện · biên độ to – nhỏ – to.",
    "Các QRS như xoắn quanh đường đẳng điện, biên độ to, rồi nhỏ, rồi lại to."),
   ("Khởi phát kiểu NGẮN – DÀI – NGẮN: nhát sớm, nghỉ dài, nhát sớm rơi vào T.",
    "Thường khởi phát kiểu ngắn, dài, ngắn: một nhát sớm, một khoảng nghỉ dài, rồi nhát sớm rơi đúng vào sóng T."),
   ("Có thể tự hết · hoặc chuyển RUNG THẤT.",
    "Cơn có thể tự hết, hoặc chuyển thành rung thất.")],
  # 9 · Ôn tập
  [("Ôn tập · NHÌN T – TÌM U – ĐO QT",
    "Ôn tập: nhìn T, tìm U, đo Q T."),
   ("T cao nhọn → TĂNG KALI · P mất, QRS rộng, hình sin → NẶNG",
    "Sóng T cao nhọn: tăng kali. P mất, QRS rộng, hình sin: tăng kali nặng."),
   ("T dẹt + sóng U → HẠ KALI / HẠ MAGIE",
    "Sóng T dẹt kèm sóng U: hạ kali hoặc hạ ma-giê."),
   ("ST ngắn → TĂNG canxi · ST dài → HẠ canxi",
    "Đoạn ét tê ngắn: tăng canxi. Đoạn ét tê dài: hạ canxi."),
   ("QTc > 500 ms → nguy cơ XOẮN ĐỈNH",
    "Q T c trên năm trăm mi li giây: nguy cơ xoắn đỉnh.")],
  # 10 · Luyện đọc
  [("Luyện đọc · 3 ca",
    "Luyện đọc ba ca."),
   ("Ca 1: trẻ suy thận, mệt lả · T cao nhọn, P mất, QRS rộng.",
    "Ca một: trẻ suy thận, mệt lả. Sóng T cao nhọn, P mất, QRS rộng."),
   ("→ TĂNG KALI NẶNG ✓",
    "Kết luận: tăng kali nặng."),
   ("Ca 2: tiêu chảy nhiều ngày · T dẹt, sóng U rõ ở V2 – V3, ST chênh xuống nhẹ.",
    "Ca hai: tiêu chảy nhiều ngày. Sóng T dẹt, sóng U rõ ở vê hai, vê ba, ét tê chênh xuống nhẹ."),
   ("→ HẠ KALI (kiểm tra cả magie) ✓",
    "Kết luận: hạ kali, và nhớ kiểm tra cả ma-giê."),
   ("Ca 3: đang dùng thuốc kéo dài QT · QT 0,52 s, RR 1,0 s.",
    "Ca ba: đang dùng thuốc kéo dài Q T. Q T không phẩy năm mươi hai giây, R R một giây."),
   ("→ QTc = 0,52 ÷ √1,0 = 520 ms → NGUY CƠ XOẮN ĐỈNH ✓",
    "Q T c bằng không phẩy năm mươi hai chia căn của một, bằng năm trăm hai mươi mi li giây. Nguy cơ xoắn đỉnh.")],
  # 11 · 5 điều cần nhớ
  [("5 điều cần nhớ",
    "Năm điều cần nhớ."),
   ("① NHÌN T – TÌM U – ĐO QT",
    "Một, nhìn T, tìm U, đo Q T."),
   ("② Tăng kali: T nhọn → P mất → QRS rộng → hình sin",
    "Hai, tăng kali: T nhọn, rồi P mất, rồi QRS rộng, rồi hình sin."),
   ("③ ECG bình thường KHÔNG loại trừ tăng kali",
    "Ba, điện tâm đồ bình thường không loại trừ tăng kali."),
   ("④ Kali đổi sóng T · Canxi đổi đoạn ST",
    "Bốn, kali đổi sóng T, canxi đổi đoạn ét tê."),
   ("⑤ QTc > 500 ms hoặc tăng > 60 ms → nguy cơ xoắn đỉnh",
    "Năm, Q T c trên năm trăm mi li giây, hoặc tăng hơn sáu mươi mi li giây, là nguy cơ xoắn đỉnh."),
   ("Cảm ơn bạn đã theo dõi chuỗi Tiếp cận điện tâm đồ cơ bản!",
    "Cảm ơn bạn đã theo dõi chuỗi Tiếp cận điện tâm đồ cơ bản.")],
]
STATION = [0, 1, 2, 2, 3, 4, 5, 5, 6, 7, 7, 7]
assert len(STATION) == len(NARR)
KEYS = [[2 * j for j in range(len(sc))] for sc in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]

TITLES = ["Bìa", "Nhìn T", "Tăng kali: tiến triển", "Tăng kali: bẫy", "Tìm U: hạ kali, hạ magie", "Canxi",
          "Đo QT", "QT dài", "Xoắn đỉnh", "Ôn tập", "Luyện đọc", "5 điều cần nhớ"]
VIS = [
  "Bìa: monitor ICU chạy dải tăng kali (T nhọn); 3 chip thần chú NHÌN T · TÌM U · ĐO QT; dòng nối bài 11.",
  "3 nhát cạnh nhau trên giấy hồng: T bình thường · T cao nhọn (vàng, kali ↑) · T dẹt (xanh, kali ↓); kính lúp soi sóng T.",
  "Cảnh chủ đạo: 1 dải giấy dài, nhát bóp ‘biến hình’ dần theo 5 bậc (T nhọn → P dẹt, PR dài → QRS rộng → hình sin → rung thất); thanh bậc 1–5 sáng dần ở trên.",
  "Thẻ ‘thứ tự chỉ gần đúng’; khung AHA 2025 ‘độ nhạy, đặc hiệu thấp’; 3 dải nhỏ minh hoạ tăng kali giả ST chênh / giả block nhánh / QRS rộng.",
  "Dải V2 hạ kali: T dẹt, sóng U khoanh tím, ST chênh xuống; thước đo QU vs QT; thẻ hạ magie ‘giống hệt’.",
  "3 nhát chồng thời gian: canxi cao (ST ngắn) · bình thường · canxi thấp (ST kéo dài, T bình thường); thước đo QT dưới mỗi nhát; chip ‘KALI → T · CANXI → ST’.",
  "Phóng to 1 nhát II: đánh dấu đầu QRS, tiếp tuyến cuối T, thước QT; công thức Bazett và Fridericia hiện dần; mẹo ‘QT > ½ RR’ với compa; bảng ngưỡng QTc.",
  "Danh sách thuốc dạng thẻ; đồng hồ ‘+60 ms’; khung QT dài bẩm sinh ≥ 480 ms.",
  "Monitor ICU: dải xoắn đỉnh (biên độ to – nhỏ – to), khởi phát ngắn – dài – ngắn đánh dấu trên dải trước cơn.",
  "Bảng ôn 4 dòng có mini-ECG.",
  "3 ca lần lượt, câu hỏi + dải ECG, đáp án bật sau với dấu ✓; ca 3 hiện phép tính QTc.",
  "5 thẻ ghi nhớ; dòng cảm ơn kết thúc chuỗi.",
]
assert len(VIS) == len(NARR) == len(TITLES)
