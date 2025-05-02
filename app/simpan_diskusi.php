<?php
include 'koneksi.php';

$judul = $_POST['judul'];
$isi = $_POST['isi'];
$tag = $_POST['tag'];

$query = "INSERT INTO diskusi (judul, isi, tag) 
          VALUES ('$judul', '$isi', '$tag')";

if ($conn->query($query)) {
    echo "Diskusi berhasil ditambahkan.";
} else {
    echo "Gagal menyimpan diskusi: " . $conn->error;
}
?>
