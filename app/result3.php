<?php
session_start();

$correctAnswers = ["C", "B", "C"];
$totalQuestions = count($correctAnswers);

$score = 0;

foreach ($correctAnswers as $index => $answer) {
    if (isset($_SESSION['project_answers'][$index]) && $_SESSION['project_answers'][$index] === $answer) {
        $score++;
    }
}

session_destroy();

if ($score == $totalQuestions) {
    $message = "Project Success! 🎯🏆";
} elseif ($score >= ceil($totalQuestions / 2)) {
    $message = "Good Project Management! 👍";
} else {
    $message = "Keep Improving Your Skills! 💪";
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Project Quiz Result</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-blue-100 min-h-screen flex items-center justify-center p-6">

<div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">

    <h1 class="text-3xl font-bold text-blue-700 mb-4">Quiz Completed</h1>
    <p class="text-gray-700 text-lg mb-2">Your Score:</p>
    <p class="text-5xl font-extrabold text-blue-800 mb-6"><?= $score ?> / <?= $totalQuestions ?></p>
    <p class="text-xl font-semibold text-gray-600 mb-8"><?= $message ?></p>

    <a href="info.php" class="px-8 py-3 bg-blue-600 text-white text-lg rounded-full hover:bg-blue-700">
        Retake Quiz
    </a>

</div>

</body>
</html>
