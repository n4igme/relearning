<?php
include 'koneksi.php';

// Ambil ID kuis dari URL
$id_kuis = $_GET['id'];

// Query untuk mengambil data kuis
$sql_kuis = "SELECT * FROM kuis WHERE id = ?";
$stmt_kuis = mysqli_prepare($conn, $sql_kuis);
mysqli_stmt_bind_param($stmt_kuis, "i", $id_kuis);
mysqli_stmt_execute($stmt_kuis);
$result_kuis = mysqli_stmt_get_result($stmt_kuis);
$kuis = mysqli_fetch_assoc($result_kuis);

// Cek apakah kuis ditemukan
if (!$kuis) {
    echo "Kuis tidak ditemukan.";
    exit;
}

// Query untuk mengambil soal kuis
$sql_soal = "SELECT * FROM soal WHERE id_kuis = ?";
$stmt_soal = mysqli_prepare($conn, $sql_soal);
mysqli_stmt_bind_param($stmt_soal, "i", $id_kuis);
mysqli_stmt_execute($stmt_soal);
$result_soal = mysqli_stmt_get_result($stmt_soal);
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Detail Kuis - <?= htmlspecialchars($kuis['judul']) ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container py-5">
        <h2 class="text-center"><?= htmlspecialchars($kuis['judul']) ?></h2>
        <p class="text-center text-muted"><?= htmlspecialchars($kuis['deskripsi']) ?></p>

        <!-- Gambar Kuis -->
        <div class="text-center mb-4">
            <img src="images/<?= htmlspecialchars($kuis['gambar']) ?>" class="img-fluid rounded shadow" style="max-height: 400px;">
        </div>

        <h3>Soal Kuis</h3>
        <div class="list-group">
            <?php while ($soal = mysqli_fetch_assoc($result_soal)): ?>
                <div class="list-group-item">
                    <h5><?= htmlspecialchars($soal['pertanyaan']) ?></h5>
                    <ul>
                        <li><?= htmlspecialchars($soal['opsi_a']) ?></li>
                        <li><?= htmlspecialchars($soal['opsi_b']) ?></li>
                        <li><?= htmlspecialchars($soal['opsi_c']) ?></li>
                        <li><?= htmlspecialchars($soal['opsi_d']) ?></li>
                    </ul>
                    <p><strong>Jawaban Benar:</strong> <?= htmlspecialchars($soal['jawaban_benar']) ?></p>
                </div>
            <?php endwhile; ?>
        </div>

        <div class="mt-5 text-center">
            <a href="info.php" class="btn btn-secondary">Kembali</a>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
