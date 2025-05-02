<?php
// Simulasi data diskusi utama
$diskusi = [
  'judul' => 'Bagaimana cara memulai proyek pertama?',
  'pengirim' => 'Mario',
  'waktu' => '1 hari yang lalu',
  'isi' => "Hi team, saya ingin memulai proyek pertama saya di dunia programming. Ada tips untuk pemula?",
  'like' => 3
];

// Simulasi komentar
$komentar = [
  [
    'pengirim' => 'Roxanne',
    'waktu' => '44 menit yang lalu',
    'isi' => 'Sure, Mario. Mulailah dengan membuat project kecil dan banyak belajar sambil praktek!'
  ]
];
?>

<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Detail Diskusi</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    .notify-tag {
      background: #e7e7e7;
      border-radius: 20px;
      padding: 5px 10px;
      margin-right: 5px;
      display: inline-flex;
      align-items: center;
    }
  </style>
</head>
<body class="bg-light">

<div class="container py-5">
  
  <div class="card mb-4">
    <div class="card-body">
      <h3 class="card-title"><?= htmlspecialchars($diskusi['judul']) ?></h3>
      <p class="text-muted"><?= htmlspecialchars($diskusi['pengirim']) ?> • <?= $diskusi['waktu'] ?></p>
      <p class="card-text"><?= nl2br(htmlspecialchars($diskusi['isi'])) ?></p>

      <div class="d-flex align-items-center mt-3">
        <button class="btn btn-outline-primary btn-sm me-2">
          👍 <?= $diskusi['like'] ?>
        </button>
        <button class="btn btn-outline-secondary btn-sm">
          +
        </button>
      </div>
    </div>
  </div>

  <h5>Komentar</h5>

  <?php foreach($komentar as $k) : ?>
  <div class="card mb-3">
    <div class="card-body">
      <p class="text-muted"><?= htmlspecialchars($k['pengirim']) ?> • <?= $k['waktu'] ?></p>
      <p><?= nl2br(htmlspecialchars($k['isi'])) ?></p>
    </div>
  </div>
  <?php endforeach; ?>

  <div class="card mt-4">
    <div class="card-body">
      <h6>Tambah Komentar</h6>

      <div class="mb-2">
        <label class="form-label">Notify:</label>
        <div class="d-flex flex-wrap mb-2">
          <div class="notify-tag">Roxanne ✖</div>
          <div class="notify-tag">Mario ✖</div>
          <div class="notify-tag">Design (6) ✖</div>
        </div>
        <input type="text" class="form-control" placeholder="Tambahkan nama untuk notify (optional)">
      </div>

      <div class="mb-2">
        <textarea class="form-control" rows="4" placeholder="Tulis komentar Anda di sini..."></textarea>
      </div>

      <div class="text-end">
        <button class="btn btn-primary">Post Comment</button>
      </div>

    </div>
  </div>

</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
