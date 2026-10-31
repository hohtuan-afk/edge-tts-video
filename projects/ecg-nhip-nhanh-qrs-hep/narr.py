# BÀI 7 · NHỊP NHANH QRS HẸP TRÊN ĐIỆN TÂM ĐỒ — ĐỀU HAY KHÔNG, P Ở ĐÂU
# Thần chú: ĐỀU? – P Ở ĐÂU? – RP DÀI HAY NGẮN?
# Khung 7 trạm: NGUYÊN TẮC → ĐỀU HAY KHÔNG → CUỒNG NHĨ → P Ở ĐÂU · RP → NHỊP NHANH XOANG → KHI KHÓ → ÔN TẬP
# Phạm vi: chỉ đọc ECG; nghiệm pháp phế vị/adenosine chỉ ở vai trò giúp chẩn đoán; không có phần trẻ em;
#          không đưa rung nhĩ có tiền kích thích (QRS rộng).
# Nguồn: 2019 ESC Guidelines for the management of patients with SVT (bản hiện hành, chưa có bản mới đến 10/2026);
#        2015 ACC/AHA/HRS Adult SVT Guideline; 2024 ESC AF Guidelines; 2023 ACC/AHA/ACCP/HRS AF Guideline;
#        EHRA consensus on atrial tachycardia (12/2025); AHA/ACCF/HRS ECG Standardization; LITFL; ecgbook.com.
NARR = [
  # 0 · Bìa
  [("Nhịp nhanh QRS hẹp trên điện tâm đồ — Đều hay không, P ở đâu",
    "Nhịp nhanh QRS hẹp trên điện tâm đồ: đều hay không, P ở đâu."),
   ("Thần chú: ĐỀU? – P Ở ĐÂU? – RP DÀI HAY NGẮN?",
    "Thần chú của bài hôm nay gồm ba câu hỏi: đều không, P ở đâu, và RP dài hay ngắn."),
   ("Mục tiêu: gọi đúng tên một nhịp nhanh QRS hẹp chỉ từ điện tâm đồ.",
    "Mục tiêu là gọi đúng tên một nhịp nhanh QRS hẹp, chỉ từ điện tâm đồ.")],
  # 1 · Nguyên tắc
  [("Trạm 1 · NGUYÊN TẮC — nhịp nhanh: tần số > 100 lần/phút.",
    "Trạm một, nguyên tắc. Nhịp nhanh là khi tần số tim trên một trăm lần mỗi phút."),
   ("QRS hẹp (< 0,12 s) → thất khử cực qua đường dẫn truyền bình thường.",
    "QRS hẹp, dưới không phẩy mười hai giây, nghĩa là thất được khử cực qua đường dẫn truyền bình thường."),
   ("→ nguồn gốc nhịp ở TRÊN thất: xoang, nhĩ, hoặc vòng vào lại qua nút nhĩ thất.",
    "Vì vậy nguồn gốc nhịp nằm ở trên thất: từ nút xoang, từ nhĩ, hoặc từ vòng vào lại có liên quan nút nhĩ thất."),
   ("Đọc theo 3 câu hỏi: ĐỀU? – P Ở ĐÂU? – RP DÀI HAY NGẮN?",
    "Hãy đọc theo ba câu hỏi: nhịp có đều không, sóng P ở đâu, và khoảng RP dài hay ngắn.")],
  # 2 · Không đều → rung nhĩ
  [("Trạm 2 · ĐỀU HAY KHÔNG — đo các khoảng RR.",
    "Trạm hai, đều hay không đều. Dùng compa đo các khoảng RR liên tiếp."),
   ("Không đều HOÀN TOÀN + không thấy sóng P → RUNG NHĨ.",
    "Nếu nhịp không đều hoàn toàn, và không thấy sóng P, đó là rung nhĩ."),
   ("Đường nền lăn tăn: sóng f, không đều, không có hình dạng cố định.",
    "Đường nền lăn tăn với các sóng f nhỏ, không đều, không có hình dạng cố định."),
   ("Tần số thất thay đổi liên tục · QRS vẫn hẹp.",
    "Tần số thất thay đổi liên tục, còn phức bộ QRS vẫn hẹp.")],
  # 3 · Không đều khác
  [("Không đều nhưng CÓ sóng P?",
    "Không đều nhưng vẫn thấy sóng P thì sao?"),
   ("Nhịp nhanh nhĩ đa ổ: ≥ 3 hình dạng P khác nhau · PR, RR thay đổi · hay gặp ở bệnh phổi.",
    "Đó có thể là nhịp nhanh nhĩ đa ổ: có từ ba hình dạng sóng P khác nhau trở lên, khoảng PR và RR thay đổi, hay gặp ở bệnh nhân bệnh phổi."),
   ("Cuồng nhĩ dẫn truyền thay đổi cũng có thể không đều — tìm sóng F.",
    "Cuồng nhĩ với tỉ lệ dẫn truyền thay đổi cũng có thể làm nhịp không đều. Khi đó hãy tìm sóng F.")],
  # 4 · Cuồng nhĩ
  [("Trạm 3 · CUỒNG NHĨ — sóng F hình răng cưa.",
    "Trạm ba, cuồng nhĩ. Dấu hiệu đặc trưng là sóng F hình răng cưa."),
   ("Tần số nhĩ khoảng 250 – 350, thường ~ 300 lần/phút.",
    "Tần số nhĩ khoảng hai trăm năm mươi đến ba trăm năm mươi, thường là khoảng ba trăm lần mỗi phút."),
   ("Cuồng nhĩ điển hình: F ÂM ở II, III, aVF · F DƯƠNG ở V1.",
    "Trong cuồng nhĩ điển hình, sóng F âm ở chuyển đạo hai, ba, a-vê-ép, và dương ở vê một."),
   ("Thường dẫn 2:1 → tần số thất ~ 150 lần/phút, đều.",
    "Thường dẫn truyền hai trên một, nên tần số thất khoảng một trăm năm mươi lần mỗi phút, và đều."),
   ("Mẹo: nhịp đều ~ 150 → luôn TÌM sóng F (có thể lẩn trong QRS hoặc T).",
    "Mẹo nhớ: nhịp nhanh đều khoảng một trăm năm mươi, hãy luôn đi tìm sóng F, vì sóng F có thể lẩn vào QRS hoặc sóng T.")],
  # 5 · P ở đâu
  [("Trạm 4 · P Ở ĐÂU — nhịp đều, không có sóng F: tìm sóng P.",
    "Trạm bốn, P ở đâu. Nếu nhịp đều và không thấy sóng F, hãy đi tìm sóng P."),
   ("RP: từ R đến P sau nó · PR: từ P đến R kế tiếp.",
    "Khoảng RP tính từ sóng R đến sóng P ngay sau nó. Khoảng PR tính từ sóng P đến sóng R kế tiếp."),
   ("RP NGẮN: RP < PR · RP DÀI: RP > PR.",
    "Gọi là RP ngắn khi RP nhỏ hơn PR, và RP dài khi RP lớn hơn PR."),
   ("P ÂM ở II, III, aVF → nhĩ khử cực NGƯỢC từ dưới lên.",
    "Sóng P âm ở chuyển đạo hai, ba, a-vê-ép cho biết nhĩ được khử cực ngược, từ dưới lên.")],
  # 6 · AVNRT
  [("RP RẤT NGẮN (< 90 ms) hoặc không thấy P → vòng vào lại nút nhĩ thất.",
    "RP rất ngắn, dưới chín mươi mi li giây, hoặc không thấy P, nghĩ đến nhịp nhanh vòng vào lại nút nhĩ thất."),
   ("P lẩn trong QRS hoặc ngay cuối QRS.",
    "Sóng P lẩn trong QRS, hoặc nằm ngay ở cuối QRS."),
   ("Dấu hiệu: r′ giả ở V1 · S giả ở II, III, aVF.",
    "Dấu hiệu gợi ý là sóng r phẩy giả ở vê một, và sóng S giả ở chuyển đạo hai, ba, a-vê-ép."),
   ("Thường gặp nhất trong nhịp nhanh trên thất kịch phát.",
    "Đây là dạng thường gặp nhất trong nhịp nhanh trên thất kịch phát.")],
  # 7 · AVRT
  [("RP NGẮN nhưng ≥ 90 ms → vòng vào lại nhĩ thất qua đường phụ.",
    "RP ngắn nhưng từ chín mươi mi li giây trở lên, nghĩ đến nhịp nhanh vòng vào lại nhĩ thất qua đường phụ."),
   ("P tách rõ khỏi QRS, nằm trên đoạn ST.",
    "Sóng P tách rõ khỏi QRS, thường nằm trên đoạn ét tê."),
   ("Dạng xuôi chiều: xuống thất qua nút nhĩ thất → QRS hẹp · ngược lên nhĩ qua đường phụ.",
    "Ở dạng xuôi chiều, xung đi xuống thất qua nút nhĩ thất nên QRS hẹp, rồi đi ngược lên nhĩ qua đường phụ."),
   ("Vòng đi xa hơn → P đến muộn hơn so với vòng vào lại nút.",
    "Vì vòng vào lại đi xa hơn, sóng P xuất hiện muộn hơn so với vòng vào lại nút nhĩ thất.")],
  # 8 · RP dài
  [("RP DÀI (RP > PR):",
    "Khi RP dài, nghĩa là RP lớn hơn PR."),
   ("Nhịp nhanh nhĩ · vòng vào lại nút nhĩ thất không điển hình · (hiếm) nhịp nhanh bộ nối vòng vào lại kéo dài.",
    "Nghĩ đến nhịp nhanh nhĩ, vòng vào lại nút nhĩ thất không điển hình, hoặc hiếm hơn là nhịp nhanh bộ nối vòng vào lại kéo dài."),
   ("Nhịp nhanh nhĩ: P đi trước QRS, hình dạng KHÁC P xoang.",
    "Trong nhịp nhanh nhĩ, sóng P đi trước QRS, nhưng có hình dạng khác với sóng P xoang.")],
  # 9 · Nhịp nhanh xoang
  [("Trạm 5 · NHỊP NHANH XOANG — đừng bỏ sót.",
    "Trạm năm, nhịp nhanh xoang. Đây là chẩn đoán không được bỏ sót."),
   ("P bình thường: dương ở I, II · đi trước MỖI QRS.",
    "Sóng P bình thường, dương ở chuyển đạo một và hai, và đi trước mỗi phức bộ QRS."),
   ("Tăng và giảm TỪ TỪ, không khởi phát đột ngột.",
    "Tần số tăng và giảm từ từ, không khởi phát hay kết thúc đột ngột."),
   ("Là phản ứng: sốt, đau, thiếu dịch, thiếu máu, sốc… → tìm nguyên nhân.",
    "Đây thường là phản ứng của cơ thể với sốt, đau, thiếu dịch, thiếu máu, hay sốc. Cần tìm nguyên nhân.")],
  # 10 · Khi khó
  [("Trạm 6 · KHI KHÓ — vài manh mối thêm.",
    "Trạm sáu, khi khó phân biệt, có thêm vài manh mối."),
   ("Khởi phát và kết thúc ĐỘT NGỘT → nghĩ vòng vào lại.",
    "Khởi phát và kết thúc đột ngột gợi ý nhịp nhanh vòng vào lại."),
   ("Nghiệm pháp phế vị / adenosine: block nhĩ thất thoáng qua → LỘ sóng F hoặc P (cuồng nhĩ, nhịp nhanh nhĩ).",
    "Nghiệm pháp phế vị hoặc adenosine gây block nhĩ thất thoáng qua, làm lộ sóng F hoặc sóng P, giúp chẩn đoán cuồng nhĩ hay nhịp nhanh nhĩ."),
   ("Nếu nhịp nhanh CẮT đột ngột → nghĩ vòng vào lại có nút nhĩ thất · luôn ghi ECG liên tục.",
    "Nếu nhịp nhanh cắt đột ngột, nghĩ đến vòng vào lại có liên quan nút nhĩ thất. Luôn ghi điện tâm đồ liên tục trong lúc làm.")],
  # 11 · Ôn tập
  [("Trạm 7 · ÔN TẬP — sơ đồ 3 bước.",
    "Trạm bảy, ôn tập bằng sơ đồ ba bước."),
   ("Không đều: không P → rung nhĩ · ≥ 3 dạng P → nhịp nhanh nhĩ đa ổ · có F → cuồng nhĩ dẫn truyền thay đổi.",
    "Không đều: không có P là rung nhĩ, có từ ba dạng P là nhịp nhanh nhĩ đa ổ, thấy sóng F là cuồng nhĩ dẫn truyền thay đổi."),
   ("Đều: có F → cuồng nhĩ · P xoang → nhịp nhanh xoang.",
    "Đều: thấy sóng F là cuồng nhĩ, sóng P xoang là nhịp nhanh xoang."),
   ("RP rất ngắn → vòng vào lại nút · RP ngắn ≥ 90 ms → qua đường phụ · RP dài → nhịp nhanh nhĩ…",
    "RP rất ngắn là vòng vào lại nút, RP ngắn nhưng từ chín mươi mi li giây là vòng vào lại qua đường phụ, RP dài nghĩ nhịp nhanh nhĩ.")],
  # 12 · Thực hành
  [("Thực hành: đọc 2 ECG.",
    "Thực hành: đọc hai điện tâm đồ."),
   ("ECG 1: đều, 150 lần/phút · II, III, aVF có sóng răng cưa âm.",
    "Điện tâm đồ một: nhịp đều, một trăm năm mươi lần mỗi phút, chuyển đạo hai, ba, a-vê-ép có sóng răng cưa âm."),
   ("→ Cuồng nhĩ điển hình, dẫn 2:1 ✓",
    "Kết luận: cuồng nhĩ điển hình, dẫn truyền hai trên một."),
   ("ECG 2: đều, 180 lần/phút · không thấy P rõ · r′ giả ở V1, S giả ở II.",
    "Điện tâm đồ hai: nhịp đều, một trăm tám mươi lần mỗi phút, không thấy sóng P rõ, có r phẩy giả ở vê một và S giả ở chuyển đạo hai."),
   ("→ Nhịp nhanh vòng vào lại nút nhĩ thất ✓",
    "Kết luận: nhịp nhanh vòng vào lại nút nhĩ thất.")],
  # 13 · 5 điều cần nhớ
  [("5 điều cần nhớ",
    "Năm điều cần nhớ."),
   ("① QRS hẹp + nhanh → trên thất · hỏi: ĐỀU? – P Ở ĐÂU? – RP?",
    "Một, QRS hẹp và nhanh là nhịp trên thất. Hãy hỏi: đều không, P ở đâu, RP dài hay ngắn."),
   ("② Không đều hoàn toàn, không P → rung nhĩ",
    "Hai, không đều hoàn toàn và không có P là rung nhĩ."),
   ("③ Đều ~ 150 → tìm sóng F (cuồng nhĩ 2:1)",
    "Ba, nhịp đều khoảng một trăm năm mươi, hãy tìm sóng F của cuồng nhĩ hai trên một."),
   ("④ Không thấy P, r′ giả V1 → vòng vào lại nút · P sau QRS, RP ≥ 90 ms → qua đường phụ",
    "Bốn, không thấy P, có r phẩy giả ở vê một là vòng vào lại nút. P sau QRS, RP từ chín mươi mi li giây là vòng vào lại qua đường phụ."),
   ("⑤ RP dài → nhịp nhanh nhĩ · P xoang, tăng giảm từ từ → nhịp nhanh xoang",
    "Năm, RP dài nghĩ nhịp nhanh nhĩ. P xoang, tăng giảm từ từ là nhịp nhanh xoang."),
   ("Cảm ơn bạn đã theo dõi!",
    "Cảm ơn bạn đã theo dõi.")],
]
STATION = [0, 1, 2, 2, 3, 4, 4, 4, 4, 5, 6, 7, 7, 7]
assert len(STATION) == len(NARR)
KEYS = [[2 * j for j in range(len(sc))] for sc in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
