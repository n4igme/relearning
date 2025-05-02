<?php
include 'koneksi.php';

if (!isset($_GET['id'])) {
  echo "ID kuis tidak ditemukan.";
  exit;
}

$id_kuis = intval($_GET['id']);

// Ambil data kuis
$kuis = mysqli_query($conn, "SELECT * FROM kuis WHERE id = $id_kuis");
$data_kuis = mysqli_fetch_assoc($kuis);
if (!$data_kuis) {
  echo "Kuis tidak ditemukan.";
  exit;
}

// Ambil semua soal untuk kuis ini
$soal = mysqli_query($conn, "SELECT * FROM soal WHERE id_kuis = $id_kuis");
?>

<!DOCTYPE html>
<html>
<head>
  <title><?= htmlspecialchars($data_kuis['judul']) ?></title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="container py-4">
  <h2><?= htmlspecialchars($data_kuis['judul']) ?></h2>
  <p><?= nl2br(htmlspecialchars($data_kuis['deskripsi'])) ?></p>

  <form method="post" action="hasil_kuis.php">
    <input type="hidden" name="id_kuis" value="<?= $id_kuis ?>">

    <?php
    $no = 1;
    while ($s = mysqli_fetch_assoc($soal)) :
    ?>
      <div class="mb-4">
        <strong><?= $no++ ?>. <?= htmlspecialchars($s['pertanyaan']) ?></strong>
        <div class="form-check">
          <input type="radio" name="jawaban[<?= $s['id'] ?>]" value="A" class="form-check-input" id="a<?= $s['id'] ?>">
          <label class="form-check-label" for="a<?= $s['id'] ?>"><?= htmlspecialchars($s['opsi_a']) ?></label>
        </div>
        <div class="form-check">
          <input type="radio" name="jawaban[<?= $s['id'] ?>]" value="B" class="form-check-input" id="b<?= $s['id'] ?>">
          <label class="form-check-label" for="b<?= $s['id'] ?>"><?= htmlspecialchars($s['opsi_b']) ?></label>
        </div>
        <div class="form-check">
          <input type="radio" name="jawaban[<?= $s['id'] ?>]" value="C" class="form-check-input" id="c<?= $s['id'] ?>">
          <label class="form-check-label" for="c<?= $s['id'] ?>"><?= htmlspecialchars($s['opsi_c']) ?></label>
        </div>
        <div class="form-check">
          <input type="radio" name="jawaban[<?= $s['id'] ?>]" value="D" class="form-check-input" id="d<?= $s['id'] ?>">
          <label class="form-check-label" for="d<?= $s['id'] ?>"><?= htmlspecialchars($s['opsi_d']) ?></label>
        </div>
      </div>
    <?php endwhile; ?>

    <button type="submit" class="btn btn-success">Selesai</button>
  </form>
</body>
</html>
