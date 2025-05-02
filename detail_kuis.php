<?php
include 'koneksi.php';

if (!isset($_GET['id'])) {
    echo "Kuis tidak ditemukan.";
    exit;
}

$id_kuis = (int)$_GET['id'];

// Ambil data kuis
$kuis = mysqli_query($conn, "SELECT * FROM kuis WHERE id = $id_kuis");
$data_kuis = mysqli_fetch_assoc($kuis);

// Ambil soal
$soal = mysqli_query($conn, "SELECT * FROM soal WHERE id_kuis = $id_kuis");
$daftar_soal = [];
while ($row = mysqli_fetch_assoc($soal)) {
    $daftar_soal[] = $row;
}
?>

<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title><?= $data_kuis['judul'] ?></title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 p-6">
  <div class="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-6">
    <h2 class="text-2xl font-bold text-indigo-700 mb-4"><?= $data_kuis['judul'] ?></h2>
    <p class="mb-6 text-gray-600"><?= $data_kuis['deskripsi'] ?></p>

    <form action="hasil_kuis.php" method="post">
      <?php foreach ($daftar_soal as $index => $s): ?>
        <div class="mb-6">
          <p class="font-semibold mb-2"><?= ($index + 1) ?>. <?= $s['pertanyaan'] ?></p>

          <?php foreach (['a', 'b', 'c', 'd'] as $opsi): ?>
            <label class="block mb-1">
              <input type="radio" name="answers[<?= $index ?>]" value="<?= strtoupper($opsi) ?>" class="mr-2">
              <?= $s['{"opsi_" . $opsi}'] ?>
            </label>
          <?php endforeach; ?>
        </div>
      <?php endforeach; ?>

      <input type="hidden" name="id_kuis" value="<?= $id_kuis ?>">
      <button type="submit" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
        Kirim Jawaban
      </button>
    </form>
  </div>
</body>
</html>
