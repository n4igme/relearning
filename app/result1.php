<?php
session_start();

// Jawaban benar
$correctAnswers = ["A", "C", "D"];
$totalQuestions = count($correctAnswers);

$score = 0;

// Hitung score
foreach ($correctAnswers as $index => $answer) {
    if (isset($_SESSION['answers'][$index]) && $_SESSION['answers'][$index] === $answer) {
        $score++;
    }
}

// Setelah hitung, hapus session
session_destroy();

// Tentukan pesan berdasarkan score
if ($score == $totalQuestions) {
    $message = "Perfect! 🎉";
} elseif ($score >= ceil($totalQuestions / 2)) {
    $message = "Good job! 👍";
} else {
    $message = "Keep practicing! 💪";
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Quiz Result</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-green-100 min-h-screen flex items-center justify-center p-6">

<div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">

    <h1 class="text-3xl font-bold text-green-700 mb-4">Quiz Completed</h1>
    <p class="text-gray-700 text-lg mb-2">Your Score:</p>
    <p class="text-5xl font-extrabold text-green-800 mb-6"><?= $score ?> / <?= $totalQuestions ?></p>
    <p class="text-xl font-semibold text-gray-600 mb-8"><?= $message ?></p>

    <a href="info.php" class="px-8 py-3 bg-indigo-600 text-white text-lg rounded-full hover:bg-indigo-700">
        Retake Quiz
    </a>

</div>

</body>
</html>
