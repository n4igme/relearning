<?php
session_start();

$correctAnswers = ["B", "A", "B"];
$totalQuestions = count($correctAnswers);

$score = 0;

foreach ($correctAnswers as $index => $answer) {
    if (isset($_SESSION['design_answers'][$index]) && $_SESSION['design_answers'][$index] === $answer) {
        $score++;
    }
}

session_destroy();

if ($score == $totalQuestions) {
    $message = "Awesome! 🎨✨";
} elseif ($score >= ceil($totalQuestions / 2)) {
    $message = "Good creativity! 🎨👍";
} else {
    $message = "Keep practicing your skills! 🎨💪";
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Design Quiz Result</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-pink-100 min-h-screen flex items-center justify-center p-6">

<div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">

    <h1 class="text-3xl font-bold text-pink-700 mb-4">Quiz Completed</h1>
    <p class="text-gray-700 text-lg mb-2">Your Score:</p>
    <p class="text-5xl font-extrabold text-pink-800 mb-6"><?= $score ?> / <?= $totalQuestions ?></p>
    <p class="text-xl font-semibold text-gray-600 mb-8"><?= $message ?></p>

    <a href="info.php" class="px-8 py-3 bg-pink-600 text-white text-lg rounded-full hover:bg-pink-700">
        Retake Quiz
    </a>

</div>

</body>
</html>
