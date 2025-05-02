<?php
include 'koneksi.php';

if (!isset($_POST['jawaban']) || !isset($_POST['id_kuis'])) {
  echo "Data tidak lengkap.";
  exit;
}

$jawaban_user = $_POST['jawaban'];
$id_kuis = intval($_POST['id_kuis']);

// Ambil semua soal dari kuis ini
$soal_query = mysqli_query($conn, "SELECT * FROM soal WHERE id_kuis = $id_kuis");

$total_soal = 0;
$jawaban_benar = 0;

while ($s = mysqli_fetch_assoc($soal_query)) {
  $id_soal = $s['id'];
  $jawaban_benar_soal = strtoupper($s['jawaban_benar']);

  $total_soal++;
  if (isset($jawaban_user[$id_soal]) && strtoupper($jawaban_user[$id_soal]) === $jawaban_benar_soal) {
    $jawaban_benar++;
  }
}

$skor = $jawaban_benar / $total_soal * 100;
?>

<!DOCTYPE html>
<html>
<head>
  <title>Hasil Kuis</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="container py-4">
  <h2>Hasil Kuis</h2>
  <p>Jumlah Soal: <?= $total_soal ?></p>
  <p>Jawaban Benar: <?= $jawaban_benar ?></p>
  <h4>Skor Akhir: <?= round($skor) ?>%</h4>

  <a href="info.php" class="btn btn-primary mt-3">Kembali ke Daftar Kuis</a>
</body>
</html>
