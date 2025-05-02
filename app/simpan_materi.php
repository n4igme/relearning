<?php
include 'koneksi.php';

$judul = $_POST['judul'];
$deskripsi = $_POST['deskripsi'];
$gambar = 'default.jpg'; // fallback

// Proses upload jika ada file
if (isset($_FILES['gambar']) && $_FILES['gambar']['error'] == 0) {
    $target_dir = "images/";
    $nama_file = basename($_FILES["gambar"]["name"]);
    $target_file = $target_dir . time() . "_" . $nama_file;

    // Cek ekstensi valid
    $ekstensi_valid = ['jpg', 'jpeg', 'png', 'gif'];
    $ekstensi = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

    if (in_array($ekstensi, $ekstensi_valid)) {
        if (move_uploaded_file($_FILES["gambar"]["tmp_name"], $target_file)) {
            $gambar = basename($target_file);
        }
    }
}

$sql = "INSERT INTO materi (judul, deskripsi, gambar) VALUES ('$judul', '$deskripsi', '$gambar')";
mysqli_query($conn, $sql);

header("Location: info.php");
exit;
?>
