<?php
include 'koneksi.php';

$id = $_POST['id'];
$judul = $_POST['judul'];
$deskripsi = $_POST['deskripsi'];
$isi_materi = $_POST['isi_materi'];

// Cek apakah user upload gambar baru
if ($_FILES['gambar']['name']) {
  $gambar = $_FILES['gambar']['name'];
  $tmp = $_FILES['gambar']['tmp_name'];
  $path = 'images/' . $gambar;

  if (move_uploaded_file($tmp, $path)) {
    // Update dengan gambar baru
    $sql = "UPDATE materi SET judul=?, deskripsi=?, isi_materi=?, gambar=? WHERE id=?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "ssssi", $judul, $deskripsi, $isi_materi, $gambar, $id);
  } else {
    echo "Gagal upload gambar.";
    exit;
  }
} else {
  // Update tanpa mengganti gambar
  $sql = "UPDATE materi SET judul=?, deskripsi=?, isi_materi=? WHERE id=?";
  $stmt = mysqli_prepare($conn, $sql);
  mysqli_stmt_bind_param($stmt, "sssi", $judul, $deskripsi, $isi_materi, $id);
}

mysqli_stmt_execute($stmt);
header("Location: info.php");
