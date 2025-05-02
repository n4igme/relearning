<?php
$host = "db";
$user = "root";
$pass = "root";
$db   = "simpan_mt"; // ganti sesuai nama database kamu

$conn = mysqli_connect($host, $user, $pass, $db);

if (!$conn) {
    die("Koneksi gagal: " . mysqli_connect_error());
}
?>
