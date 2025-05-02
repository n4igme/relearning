<?php
include 'koneksi.php';

// Pastikan data ada di POST
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Cek apakah ada gambar yang di-upload
    $gambar = null;
    if (isset($_FILES['gambar']) && $_FILES['gambar']['name']) {
        $gambar = $_FILES['gambar']['name'];
        $tmp = $_FILES['gambar']['tmp_name'];
        $path = 'images/' . $gambar;
        move_uploaded_file($tmp, $path);
    }

    // Ambil data dari form
    $judul = $_POST['judul'];
    $deskripsi = $_POST['deskripsi'];
    $pertanyaan1 = $_POST['pertanyaan1'];
    $opsi_a1 = $_POST['opsi_a1'];
    $opsi_b1 = $_POST['opsi_b1'];
    $opsi_c1 = $_POST['opsi_c1'];
    $opsi_d1 = $_POST['opsi_d1'];
    $jawaban_benar1 = $_POST['jawaban_benar1'];

    // Insert data ke dalam tabel kuis
    $sql = "INSERT INTO kuis (judul, deskripsi, gambar) VALUES ('$judul', '$deskripsi', '$gambar')";
    if (mysqli_query($conn, $sql)) {
        // Ambil ID kuis yang baru saja dimasukkan
        $id_kuis = mysqli_insert_id($conn);

        // Insert soal pertama ke tabel soal
        $sql_soal = "INSERT INTO soal (id_kuis, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, jawaban_benar) 
                     VALUES ('$id_kuis', '$pertanyaan1', '$opsi_a1', '$opsi_b1', '$opsi_c1', '$opsi_d1', '$jawaban_benar1')";
        mysqli_query($conn, $sql_soal);

        echo "Kuis berhasil ditambahkan!";
    } else {
        echo "Gagal menambahkan kuis: " . mysqli_error($conn);
    }
}
?>
