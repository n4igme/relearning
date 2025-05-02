<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "dbonline";

$conn = mysqli_connect($host, $user, $pass, $db);

if (!$conn) {
    die("Koneksi gagal: " . mysqli_connect_error());
}

$sql = "CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

$query = mysqli_query($conn, $sql) or die("SQL Error: " . mysqli_error($conn));

if ($query) {
    echo "Tabel berhasil dibuat (atau sudah ada)";
} else {
    echo "Tabel gagal dibuat";
}
?>
