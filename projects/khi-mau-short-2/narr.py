# Giải mã khí máu · Short 2: Vì sao thở nhanh lại làm kiềm máu? (9:16)
NARR = [
  [("Vì sao thở quá nhanh lại làm máu bị kiềm?", "Vì sao thở quá nhanh lại có thể làm máu bị kiềm?")],
  [("CO₂ là một acid, được thải qua phổi", "Xê ô hai trong máu là một a xít, và nó được thải ra qua phổi.")],
  [("Thở nhanh, sâu → thải nhiều CO₂ → PaCO₂ giảm", "Khi thở nhanh và sâu, phổi thải ra nhiều xê ô hai, nên pê a xê ô hai giảm.")],
  [("pH theo tỉ số HCO₃⁻ / CO₂ · bình thường 20 : 1", "Pê hát phụ thuộc vào tỉ số bi các bô nát trên xê ô hai, bình thường là hai mươi trên một.")],
  [("CO₂ giảm → tỉ số tăng → pH tăng: kiềm hô hấp", "Xê ô hai giảm làm tỉ số tăng, pê hát tăng. Đó là kiềm hô hấp.")],
  [("Gặp khi: lo âu, đau, sốt, thở máy quá nhanh", "Hay gặp khi lo âu, đau, sốt, hoặc khi cài máy thở quá nhanh.")],
  [("Lưu lại để ôn · xem Bài 2 đầy đủ trên kênh!", "Lưu lại để ôn, và xem bài hai đầy đủ trên kênh nhé!")],
]
KEYS = [[0] for _ in NARR]
STEP = 3.0
SCENE_DUR = [STEP * len(sc) + 3 for sc in NARR]
