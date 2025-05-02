<?php
include 'koneksi.php';

$kuis = mysqli_query($conn, "SELECT * FROM kuis ORDER BY id DESC LIMIT 1");
if ($k = mysqli_fetch_assoc($kuis)) {
?>
  <div class="col-md-4 mb-4">
    <div class="card">
      <img src="gambar/<?= htmlspecialchars($k['gambar']) ?>" class="card-img-top" alt="gambar">
      <div class="card-body">
        <h5 class="card-title"><?= htmlspecialchars($k['judul']) ?></h5>
        <p class="card-text"><?= htmlspecialchars($k['deskripsi']) ?></p>
        <a href="detail_kuis.php?id=<?= $k['id'] ?>" class="btn btn-sm btn-success">Buka Kuis</a>
      </div>
    </div>
  </div>
<?php
}
?>
