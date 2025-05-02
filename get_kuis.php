<?php
include 'koneksi.php';
header('Content-Type: application/json');

$query = "SELECT id, judul, deskripsi, gambar FROM kuis ORDER BY created_at DESC";
$result = mysqli_query($conn, $query);

$kuis = [];
while ($row = mysqli_fetch_assoc($result)) {
    $kuis[] = [
        'id' => $row['id'],
        'judul' => $row['judul'],
        'deskripsi' => $row['deskripsi'],
        'gambar' => $row['gambar'] ? $row['gambar'] : 'images/default-quiz.jpg'
    ];
}

echo json_encode($kuis);
?>