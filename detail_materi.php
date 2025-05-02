<?php
include 'koneksi.php';

$id = $_GET['id'];
$sql = "SELECT * FROM materi WHERE id = $id";
$result = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($result);

if (!$row) {
  echo "Materi tidak ditemukan.";
  exit;
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title><?= htmlspecialchars($_POST['isi_materi'])
 ?></title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<style>
  .materi-detail-card {
    border-left: 5px solid #8F90FF;
    transition: all 0.3s ease;
  }

  .materi-detail-card h2, 
  .materi-detail-card h3 {
    color: #8F90FF;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
  }

  .materi-detail-card p {
    font-size: 1.05rem;
    line-height: 1.8;
    color: #333;
    margin-bottom: 1rem;
  }

  .materi-detail-card ul {
    padding-left: 1.5rem;
    margin-bottom: 1rem;
  }

  .materi-detail-card li {
    margin-bottom: 0.5rem;
  }

  .materi-detail-card pre {
    background-color: #2d3436;
    color: #f1f2f6;
    padding: 1rem;
    border-radius: 8px;
    font-size: 0.95rem;
    overflow-x: auto;
    margin-bottom: 1.5rem;
  }

  .materi-detail-card img,
  .materi-detail-card iframe {
    max-width: 100%;
    border-radius: 12px;
    margin: 1.5rem 0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  @media (max-width: 768px) {
    .materi-detail-card {
      padding: 2rem 1.5rem;
    }
  }
</style>
<body>
  <div class="container py-5">
    <div class="text-center mb-4">
      <h1><?= htmlspecialchars($row['judul']) ?></h1>
      <p class="text-muted"><?= htmlspecialchars($row['deskripsi']) ?></p>
    </div>
    <div class="container my-5">
    <div class="text-center mb-4">
      <img src="images/<?= htmlspecialchars($row['gambar']) ?>" class="img-fluid rounded shadow" style="max-height: 400px;">
    </div>
    <div class="container my-5">
    <div class="materi-detail-card p-4 shadow-sm rounded bg-white">
    <?= nl2br(htmlspecialchars($row['isi_materi'])) ?>
  </div>
</div>
</div>
    <div class="mt-5 text-center">
      <a href="info.php" class="btn btn-secondary">Kembali</a>
    </div>
  </div>
</body>
</html>
