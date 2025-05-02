<?php
include 'koneksi.php';

$judul = $_POST['judul'];
$deskripsi = $_POST['deskripsi'];
$isi_materi = $_POST['isi_materi'];

$gambar = $_FILES['gambar']['name'];
$tmp = $_FILES['gambar']['tmp_name'];
$path = 'images/' . $gambar;

if (move_uploaded_file($tmp, $path)) {
  $sql = "INSERT INTO materi (judul, deskripsi, isi_materi, gambar) VALUES (?, ?, ?, ?)";
  $stmt = mysqli_prepare($conn, $sql);
  mysqli_stmt_bind_param($stmt, "ssss", $judul, $deskripsi, $isi_materi, $gambar);
  mysqli_stmt_execute($stmt);
  header("Location: info.php");
} else {
  echo "Gagal upload gambar";
}
