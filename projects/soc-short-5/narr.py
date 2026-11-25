# Giải mã sốc · Short 5: Bậc thang vận mạch (9:16)
NARR = [
  [("Bậc thang vận mạch: 3 bước", "Sốc nhiễm khuẩn: bậc thang vận mạch chỉ có ba bước.")],
  [("① Norepinephrine: đầu tay · sớm · ngoại vi được", "Bước một: nô ơ e pi nê phrin, thuốc đầu tay, bắt đầu sớm, qua tĩnh mạch ngoại vi cũng được.")],
  [("② + Vasopressin 0,03 đơn vị/phút", "Bước hai: khi nô ơ e pi nê phrin tăng lên khoảng không phẩy hai lăm, thêm va sô prét xin không phẩy không ba đơn vị mỗi phút.")],
  [("③ + Epinephrine", "Bước ba: vẫn chưa đủ thì thêm e pi nê phrin.")],
  [("Đích MAP 65 · tránh dopamine", "Đích huyết áp trung bình sáu mươi lăm. Và tránh đô pa min.")],
  [("Lưu lại để ôn · xem Bài 5 đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài năm đầy đủ trên kênh nhé!")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
