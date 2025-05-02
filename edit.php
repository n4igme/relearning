<?php
include 'koneksi.php';

$id = $_GET['id'];
$sql = "SELECT * FROM materi WHERE id = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "i", $id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
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
  <title>Edit Materi</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote.min.css" rel="stylesheet">
</head>
<body>
<div class="container py-5">
  <h2>Edit Materi</h2>
  <form action="update.php" method="POST" enctype="multipart/form-data">
    <input type="hidden" name="id" value="<?= $row['id'] ?>">

    <div class="mb-3">
      <label for="judul" class="form-label">Judul</label>
      <input type="text" name="judul" class="form-control" value="<?= htmlspecialchars($row['judul']) ?>" required>
    </div>

    <div class="mb-3">
      <label for="deskripsi" class="form-label">Deskripsi</label>
      <input type="text" name="deskripsi" class="form-control" value="<?= htmlspecialchars($row['deskripsi']) ?>" required>
    </div>

    <div class="mb-3">
      <label for="isi_materi" class="form-label">Isi Materi</label>
      <textarea id="isi_materi" name="isi_materi" class="form-control" rows="6"><?= htmlspecialchars($row['isi_materi']) ?></textarea>
    </div>

    <div class="mb-3">
      <label for="gambar" class="form-label">Gambar Baru (jika ingin ganti)</label>
      <input type="file" name="gambar" class="form-control">
      <p class="mt-2">Gambar saat ini: <img src="images/<?= htmlspecialchars($row['gambar']) ?>" style="max-height: 100px;"></p>
    </div>

    <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
    <a href="info.php" class="btn btn-secondary">Batal</a>
  </form>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote.min.js"></script>
<script>
  $('#isi_materi').summernote({
    height: 300
  });
</script>
</body>
</html>
