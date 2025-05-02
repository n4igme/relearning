<?php
session_start();
include 'koneksi.php';

$id_kuis = (int)$_POST['id_kuis'];
$answers = $_POST['answers'];

// Ambil jawaban benar dari database
$soal = mysqli_query($conn, "SELECT * FROM soal WHERE id_kuis = $id_kuis");
$correctAnswers = [];
while ($s = mysqli_fetch_assoc($soal)) {
    $correctAnswers[] = strtoupper($s['jawaban_benar']);
}

$score = 0;
foreach ($correctAnswers as $index => $correct) {
    if (isset($answers[$index]) && strtoupper($answers[$index]) === $correct) {
        $score++;
    }
}

$totalQuestions = count($correctAnswers);

// Simpan skor ke database
mysqli_query($conn, "INSERT INTO hasil_kuis (id_kuis, skor, total_soal) VALUES ($id_kuis, $score, $totalQuestions)");

// Tampilkan hasil
if ($score == $totalQuestions) {
    $message = "Perfect! 🎉";
} elseif ($score >= ceil($totalQuestions / 2)) {
    $message = "Good job! 👍";
} else {
    $message = "Keep practicing! 💪";
}
?>

<!-- (lanjut ke bagian tampilan HTML hasil seperti sebelumnya) -->
