# BÀI 6 · NHỒI MÁU CƠ TIM KHI ĐIỆN TÂM ĐỒ KHÔNG ĐIỂN HÌNH — CÁC DẠNG GỢI Ý TẮC MẠCH CẤP VÀ TIÊU CHUẨN SGARBOSSA
# Thần chú: KHÔNG CHÊNH ≠ KHÔNG TẮC  (phụ: Sgarbossa — CÙNG chiều là bệnh · NGƯỢC quá mức là bệnh)
# Khung 7 trạm: KHÁI NIỆM → T TỐI CẤP & DE WINTER → WELLENS → THÀNH SAU & ASLANGER → aVR LAN TOẢ → SGARBOSSA → ÔN TẬP
# Nguồn:
#  - Fifth Universal Definition of Myocardial Infarction (ESC/ACC/AHA/WHF, 2026): giữ STEMI/NSTEMI; liệt kê dạng gợi ý tắc mạch cấp
#    (de Winter, Wellens, thành sau, Aslanger, Sgarbossa cho block nhánh trái); ST chênh xuống lan toả + aVR chênh lên: không đặc hiệu.
#  - 2025 ACC/AHA/ACEP/NAEMSP/SCAI ACS Guideline; 2023 ESC ACS Guidelines.
#  - Sgarbossa EB et al. NEJM 1996;334:481–7. Smith SW et al. Ann Emerg Med 2012;60:766–76. Meyers HP et al. Am Heart J 2015
#    (Sgarbossa ≥ 3 điểm: nhạy 49%, đặc hiệu 100%; ST/S ≤ −0,25: nhạy 80%, đặc hiệu 99%).
#  - Dodd KW et al. Ann Emerg Med 2021 (nhịp máy tạo nhịp thất: Sgarbossa cải tiến nhạy 81%, đặc hiệu 96%).
#  - Di Marco A et al. J Am Heart Assoc 2020 (thuật toán Barcelona).
#  - de Winter RJ et al. NEJM 2008. de Zwaan C, Wellens HJ et al. Am Heart J 1982/1989. Aslanger E et al. 2020. LITFL ECG Library.
NARR = [
  # 0 · Bìa
  [("Nhồi máu cơ tim khi điện tâm đồ không điển hình — Các dạng gợi ý tắc mạch cấp và tiêu chuẩn Sgarbossa",
    "Nhồi máu cơ tim khi điện tâm đồ không điển hình, các dạng gợi ý tắc mạch cấp, và tiêu chuẩn Sgát-bô-sa."),
   ("Thần chú: KHÔNG CHÊNH ≠ KHÔNG TẮC",
    "Thần chú của bài hôm nay: không chênh, không có nghĩa là không tắc."),
   ("Mục tiêu: nhận ra tắc mạch vành cấp khi ST chưa đủ ngưỡng, hoặc QRS rộng che lấp.",
    "Mục tiêu là nhận ra tắc mạch vành cấp, khi ét tê chưa đủ ngưỡng, hoặc khi QRS rộng che lấp.")],
  # 1 · Khái niệm
  [("Trạm 1 · KHÁI NIỆM — có tắc mạch nhưng KHÔNG đủ tiêu chuẩn ST chênh lên.",
    "Trạm một, khái niệm. Có những trường hợp động mạch vành đang tắc, nhưng điện tâm đồ không đủ tiêu chuẩn ét tê chênh lên."),
   ("Vì: tắc ở vùng 12 chuyển đạo nhìn kém · tắc sớm, chưa hoàn toàn · QRS rộng che lấp.",
    "Lý do là vùng bị tắc nằm ở nơi mười hai chuyển đạo nhìn kém, hoặc tắc còn sớm, chưa hoàn toàn, hoặc QRS rộng che lấp đoạn ét tê."),
   ("Định nghĩa nhồi máu lần thứ 5 (2026): vẫn giữ STEMI/NSTEMI, nhưng liệt kê các dạng gợi ý tắc mạch cấp.",
    "Định nghĩa nhồi máu cơ tim lần thứ năm, năm hai nghìn không trăm hai mươi sáu, vẫn giữ cách chia có hay không có ét tê chênh lên, nhưng đã liệt kê các dạng điện tâm đồ gợi ý tắc mạch vành cấp."),
   ("Không chênh ≠ không tắc → đọc kỹ sóng T, soi gương, và QRS rộng.",
    "Vì vậy, không chênh không có nghĩa là không tắc. Hãy đọc kỹ sóng T, thay đổi soi gương, và các trường hợp QRS rộng.")],
  # 2 · T tối cấp
  [("Trạm 2 · SÓNG T TỐI CẤP — dấu hiệu sớm nhất của tắc mạch.",
    "Trạm hai. Sóng T tối cấp là dấu hiệu sớm nhất của tắc mạch."),
   ("T cao, RỘNG ĐÁY, cân đối, to so với QRS đi trước.",
    "Sóng T cao, rộng đáy, cân đối, và to bất thường so với phức bộ QRS đi trước."),
   ("Khác tăng kali máu: T cao, nhọn, HẸP đáy.",
    "Khác với tăng kali máu, khi sóng T cao, nhọn, nhưng hẹp đáy.")],
  # 3 · de Winter
  [("Dạng de Winter: ST chênh XUỐNG đi lên 1 – 3 mm tại điểm J ở V1 – V6.",
    "Dạng đơ Uyn-tơ: ét tê chênh xuống, đi lên dốc, từ một đến ba mi li mét tại điểm J, ở các chuyển đạo vê một đến vê sáu."),
   ("Kèm sóng T cao, cân đối ở cùng chuyển đạo.",
    "Kèm theo là sóng T cao, cân đối ở cùng các chuyển đạo đó."),
   ("Thường ST chênh lên nhẹ ở aVR (0,5 – 2 mm).",
    "Thường có ét tê chênh lên nhẹ ở a-vê-rờ, từ không phẩy năm đến hai mi li mét."),
   ("Gợi ý tắc động mạch liên thất trước đoạn gần · khoảng 2% nhồi máu thành trước.",
    "Dạng này gợi ý tắc động mạch liên thất trước đoạn gần, gặp trong khoảng hai phần trăm nhồi máu thành trước."),
   ("Không có ST chênh lên điển hình — nhưng là tắc mạch cấp.",
    "Không có ét tê chênh lên điển hình, nhưng đây là tắc mạch cấp.")],
  # 4 · Wellens
  [("Trạm 3 · WELLENS — sóng T ở V2 – V3 khi bệnh nhân HẾT đau.",
    "Trạm ba, hội chứng Uê-len. Thay đổi sóng T ở vê hai và vê ba, ghi được khi bệnh nhân đã hết đau."),
   ("Dạng A: T hai pha · Dạng B (thường gặp hơn): T đảo sâu, cân đối.",
    "Dạng A là sóng T hai pha. Dạng B, thường gặp hơn, là sóng T đảo sâu và cân đối."),
   ("ST đẳng điện hoặc chênh lên < 1 mm · sóng R còn · không có Q.",
    "Đoạn ét tê đẳng điện, hoặc chênh lên dưới một mi li mét. Sóng R vẫn còn, và không có sóng Q."),
   ("Ý nghĩa: hẹp nặng liên thất trước đoạn gần, đã tự tái thông — nguy cơ tắc lại rất cao.",
    "Ý nghĩa: hẹp nặng động mạch liên thất trước đoạn gần, mạch đã tự tái thông, nhưng nguy cơ tắc lại rất cao."),
   ("Tránh nghiệm pháp gắng sức — có thể gây nhồi máu, rối loạn nhịp.",
    "Cần tránh nghiệm pháp gắng sức, vì có thể gây nhồi máu cơ tim hoặc rối loạn nhịp.")],
  # 5 · Thành sau ẩn
  [("Trạm 4 · THÀNH SAU ẨN — ST chênh xuống tối đa ở V1 – V4.",
    "Trạm bốn. Nhồi máu thành sau thường ẩn dưới dạng ét tê chênh xuống, rõ nhất ở vê một đến vê bốn."),
   ("Kèm sóng R cao, T dương ở V1 – V3.",
    "Kèm sóng R cao và sóng T dương ở vê một đến vê ba."),
   ("Khác thiếu máu dưới nội mạc: ST chênh xuống thường tối đa ở V5 – V6.",
    "Khác với thiếu máu dưới nội mạc, khi ét tê chênh xuống thường rõ nhất ở vê năm, vê sáu."),
   ("Khẳng định bằng V7 – V9 (như bài 5).",
    "Khẳng định bằng cách gắn vê bảy đến vê chín, như đã học ở bài năm.")],
  # 6 · Aslanger
  [("Dạng Aslanger: nhồi máu vùng dưới kèm bệnh nhiều nhánh.",
    "Dạng Át-xlan-gơ: nhồi máu vùng dưới ở bệnh nhân có bệnh nhiều nhánh mạch vành."),
   ("① ST chênh lên CHỈ ở III (không ở II, aVF).",
    "Một, ét tê chênh lên chỉ ở chuyển đạo ba, không ở chuyển đạo hai và a-vê-ép."),
   ("② ST chênh xuống ở V4 – V6 (ít nhất 1 chuyển đạo), T dương · ③ ST ở V1 cao hơn V2.",
    "Hai, ét tê chênh xuống ở ít nhất một chuyển đạo từ vê bốn đến vê sáu, sóng T dương. Ba, ét tê ở vê một cao hơn vê hai."),
   ("Không đủ “2 chuyển đạo liên tiếp” → dễ bị bỏ sót.",
    "Vì không đủ hai chuyển đạo liên tiếp, dạng này rất dễ bị bỏ sót.")],
  # 7 · aVR lan toả
  [("Trạm 5 · ST chênh xuống LAN TOẢ + ST chênh lên aVR.",
    "Trạm năm. Ét tê chênh xuống lan toả ở nhiều chuyển đạo, kèm ét tê chênh lên ở a-vê-rờ."),
   ("Gợi ý thiếu máu dưới nội mạc lan toả: hẹp thân chung, bệnh 3 nhánh, hoặc do tăng nhu cầu.",
    "Dạng này gợi ý thiếu máu dưới nội mạc lan toả, do hẹp thân chung, bệnh ba nhánh, hoặc do tăng nhu cầu ô xy."),
   ("KHÔNG đặc hiệu cho tắc mạch cấp (định nghĩa nhồi máu 2026).",
    "Theo định nghĩa nhồi máu năm hai nghìn không trăm hai mươi sáu, dạng này không đặc hiệu cho tắc mạch cấp."),
   ("Phân biệt de Winter: de Winter có T cao cân đối ở V1 – V6.",
    "Phân biệt với dạng đơ Uyn-tơ: dạng đơ Uyn-tơ có sóng T cao, cân đối ở vê một đến vê sáu.")],
  # 8 · Sgarbossa nguyên tắc
  [("Trạm 6 · SGARBOSSA — block nhánh trái và nhịp máy tạo nhịp thất.",
    "Trạm sáu, tiêu chuẩn Sgát-bô-sa, dùng khi có block nhánh trái hoặc nhịp máy tạo nhịp thất."),
   ("Bình thường: ST – T NGƯỢC chiều QRS (nhắc bài 4) → không dùng ngưỡng ST thông thường.",
    "Bình thường, ét tê và sóng T ngược chiều với QRS, như đã học ở bài bốn, nên không dùng được ngưỡng ét tê thông thường."),
   ("Tìm cái BẤT THƯỜNG: CÙNG chiều là bệnh · NGƯỢC quá mức là bệnh.",
    "Hãy tìm điều bất thường: cùng chiều là bệnh, ngược chiều quá mức cũng là bệnh."),
   ("Tương hợp = ST cùng chiều QRS · bất tương hợp = ngược chiều.",
    "Tương hợp là ét tê cùng chiều với phần chính của QRS. Bất tương hợp là ngược chiều.")],
  # 9 · Sgarbossa 1996
  [("Tiêu chuẩn Sgarbossa (1996):",
    "Tiêu chuẩn Sgát-bô-sa gốc, công bố năm một chín chín sáu, có ba tiêu chí."),
   ("① ST chênh lên TƯƠNG HỢP ≥ 1 mm ở bất kỳ chuyển đạo: 5 điểm.",
    "Một, ét tê chênh lên tương hợp, từ một mi li mét ở bất kỳ chuyển đạo nào: năm điểm."),
   ("② ST chênh xuống ≥ 1 mm ở V1, V2 hoặc V3: 3 điểm · ③ ST chênh lên BẤT tương hợp > 5 mm: 2 điểm.",
    "Hai, ét tê chênh xuống từ một mi li mét ở vê một, vê hai hoặc vê ba: ba điểm. Ba, ét tê chênh lên bất tương hợp trên năm mi li mét: hai điểm."),
   ("≥ 3 điểm → nhồi máu: đặc hiệu rất cao, nhưng nhạy thấp (bỏ sót khoảng một nửa).",
    "Từ ba điểm trở lên là nhồi máu. Rất đặc hiệu, nhưng độ nhạy thấp, có thể bỏ sót khoảng một nửa số ca.")],
  # 10 · Smith cải tiến
  [("Sgarbossa cải tiến (Smith, 2012): giữ ① và ②, thay ③.",
    "Tiêu chuẩn Sgát-bô-sa cải tiến của Xmít, năm hai nghìn không trăm mười hai, giữ tiêu chí một và hai, chỉ thay tiêu chí ba."),
   ("③ mới: ST chênh lên bất tương hợp ≥ 1 mm VÀ ST/S ≥ 25% (tỉ lệ ≤ −0,25).",
    "Tiêu chí ba mới: ét tê chênh lên bất tương hợp từ một mi li mét, và bằng ít nhất hai mươi lăm phần trăm độ sâu sóng S đi trước."),
   ("Ví dụ: S sâu 12 mm, ST chênh lên 3 mm → 3/12 = 25% → dương tính.",
    "Ví dụ, sóng S sâu mười hai mi li mét, ét tê chênh lên ba mi li mét. Ba chia mười hai bằng hai mươi lăm phần trăm, là dương tính."),
   ("Vì sao tỉ lệ? QRS càng lớn, ST ngược chiều càng lớn — đo tương đối thì công bằng hơn.",
    "Vì sao dùng tỉ lệ? QRS càng lớn, ét tê ngược chiều càng lớn, nên đo tương đối sẽ công bằng hơn đo tuyệt đối."),
   ("Kiểm chứng: nhạy 80%, đặc hiệu 99% (so với 49% và 100% của bản gốc).",
    "Trong nghiên cứu kiểm chứng, tiêu chuẩn cải tiến có độ nhạy tám mươi phần trăm, độ đặc hiệu chín mươi chín phần trăm, so với bốn mươi chín và một trăm phần trăm của bản gốc.")],
  # 11 · Máy tạo nhịp + Barcelona
  [("Nhịp máy tạo nhịp thất: QRS rộng giống block nhánh trái → dùng được Sgarbossa cải tiến.",
    "Nhịp máy tạo nhịp thất cho QRS rộng, giống block nhánh trái, nên cũng dùng được tiêu chuẩn Sgát-bô-sa cải tiến."),
   ("Nghiên cứu 2021: nhạy 81%, đặc hiệu 96% trong nhịp máy tạo nhịp thất.",
    "Một nghiên cứu năm hai nghìn không trăm hai mươi mốt cho thấy độ nhạy tám mươi mốt phần trăm, đặc hiệu chín mươi sáu phần trăm."),
   ("Ngoài ra có thuật toán Barcelona (2020) cho block nhánh trái — nhạy hơn, cần thêm kiểm chứng.",
    "Ngoài ra còn có thuật toán Bác-xê-lô-na, năm hai nghìn không trăm hai mươi, cho block nhánh trái, nhạy hơn nhưng cần thêm kiểm chứng.")],
  # 12 · Bảng ôn tập
  [("Trạm 7 · ÔN TẬP — các dạng gợi ý tắc mạch cấp.",
    "Trạm bảy, ôn tập các dạng gợi ý tắc mạch cấp."),
   ("T tối cấp · de Winter → liên thất trước đoạn gần.",
    "Sóng T tối cấp và dạng đơ Uyn-tơ gợi ý tắc động mạch liên thất trước đoạn gần."),
   ("Wellens → hẹp nặng liên thất trước, đã tái thông · Thành sau: ST↓ V1 – V4 · Aslanger: chỉ III + ST↓ V4 – V6.",
    "Uê-len là hẹp nặng liên thất trước đã tái thông. Thành sau có ét tê chênh xuống vê một đến vê bốn. Át-xlan-gơ có ét tê chênh lên chỉ ở chuyển đạo ba, và chênh xuống vê bốn đến vê sáu."),
   ("Block nhánh trái / máy tạo nhịp → Sgarbossa cải tiến · aVR + chênh xuống lan toả: không đặc hiệu.",
    "Block nhánh trái và máy tạo nhịp thì dùng Sgát-bô-sa cải tiến. Còn a-vê-rờ chênh lên kèm chênh xuống lan toả thì không đặc hiệu.")],
  # 13 · Thực hành
  [("Thực hành: đọc 2 ECG.",
    "Thực hành: đọc hai điện tâm đồ."),
   ("ECG 1: đau ngực · V1 – V6 ST chênh xuống đi lên 2 mm, T cao cân đối · aVR chênh lên 1 mm.",
    "Điện tâm đồ một: bệnh nhân đau ngực, vê một đến vê sáu có ét tê chênh xuống đi lên hai mi li mét, sóng T cao cân đối, a-vê-rờ chênh lên một mi li mét."),
   ("→ Dạng de Winter · gợi ý tắc liên thất trước đoạn gần ✓",
    "Kết luận: dạng đơ Uyn-tơ, gợi ý tắc động mạch liên thất trước đoạn gần."),
   ("ECG 2: block nhánh trái · V3: S sâu 15 mm, ST chênh lên 5 mm · V5: ST chênh lên tương hợp 1 mm.",
    "Điện tâm đồ hai: block nhánh trái. Ở vê ba, sóng S sâu mười lăm mi li mét, ét tê chênh lên năm mi li mét. Ở vê năm, ét tê chênh lên tương hợp một mi li mét."),
   ("→ 5/15 = 33% ≥ 25% và có ST chênh lên tương hợp → Sgarbossa cải tiến dương tính ✓",
    "Năm chia mười lăm bằng ba mươi ba phần trăm, lớn hơn hai mươi lăm phần trăm, lại có ét tê chênh lên tương hợp. Tiêu chuẩn Sgát-bô-sa cải tiến dương tính.")],
  # 14 · 5 điều cần nhớ
  [("5 điều cần nhớ",
    "Năm điều cần nhớ."),
   ("① Không chênh ≠ không tắc — đọc sóng T, soi gương, QRS rộng",
    "Một, không chênh không có nghĩa là không tắc. Hãy đọc sóng T, soi gương, và QRS rộng."),
   ("② T tối cấp, de Winter → nghĩ liên thất trước đoạn gần",
    "Hai, sóng T tối cấp và dạng đơ Uyn-tơ, nghĩ đến tắc liên thất trước đoạn gần."),
   ("③ Wellens: T ở V2 – V3 khi hết đau → hẹp nặng, tránh gắng sức",
    "Ba, Uê-len: sóng T ở vê hai, vê ba khi hết đau, là hẹp nặng, cần tránh gắng sức."),
   ("④ ST↓ tối đa V1 – V4 → thành sau · chỉ III chênh + ST↓ V4 – V6 → Aslanger",
    "Bốn, ét tê chênh xuống rõ nhất ở vê một đến vê bốn, nghĩ thành sau. Chỉ chuyển đạo ba chênh lên kèm vê bốn đến vê sáu chênh xuống, nghĩ dạng Át-xlan-gơ."),
   ("⑤ Block nhánh trái / máy tạo nhịp: cùng chiều là bệnh, ngược quá mức (ST/S ≥ 25%) là bệnh",
    "Năm, với block nhánh trái và máy tạo nhịp: cùng chiều là bệnh, ngược chiều quá mức, từ hai mươi lăm phần trăm sóng S, cũng là bệnh."),
   ("Cảm ơn bạn đã theo dõi!",
    "Cảm ơn bạn đã theo dõi.")],
]
STATION = [0, 1, 2, 2, 3, 4, 4, 5, 6, 6, 6, 6, 7, 7, 7]
assert len(STATION) == len(NARR)
KEYS = [[2 * j for j in range(len(sc))] for sc in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
