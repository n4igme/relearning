<?php
session_start();
include 'koneksi.php'; // Pastikan ini terhubung ke database

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Ambil data dari form
    $id_kuis = 2; // ID kuis (sesuaikan dengan kuis yang sedang ditangani)
    $question = $_POST['question'];
    $option_a = $_POST['option_a'];
    $option_b = $_POST['option_b'];
    $option_c = $_POST['option_c'];
    $option_d = $_POST['option_d'];
    $correct_answer = $_POST['correct_answer'];

    // Masukkan data ke dalam database
    $sql = "INSERT INTO soal (id_kuis, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, jawaban_benar) 
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "issssss", $id_kuis, $question, $option_a, $option_b, $option_c, $option_d, $correct_answer);
    mysqli_stmt_execute($stmt);

    // Redirect kembali ke halaman kuis setelah menambah soal
    header("Location: quiz.php?id=$id_kuis");
    exit();
}
?>
