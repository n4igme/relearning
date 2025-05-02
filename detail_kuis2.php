<?php
session_start();
include 'koneksi.php'; // pastikan file ini terhubung ke database

$id_kuis = 2; // ID kuis untuk Desain Grafis
$sql = "SELECT * FROM soal WHERE id_kuis = $id_kuis ORDER BY id ASC";
$result = mysqli_query($conn, $sql);
$questions = [];

while ($row = mysqli_fetch_assoc($result)) {
    $questions[] = [
        'question' => $row['pertanyaan'],
        'options' => [
            'A' => $row['opsi_a'],
            'B' => $row['opsi_b'],
            'C' => $row['opsi_c'],
            'D' => $row['opsi_d']
        ],
        'correct' => $row['jawaban_benar']
    ];
}

$totalQuestions = count($questions);
$currentQuestion = isset($_GET['q']) ? (int)$_GET['q'] : 0;

if ($totalQuestions === 0) {
    echo "Belum ada soal untuk kuis ini.";
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $_SESSION['design_answers'][$currentQuestion] = $_POST['answer'] ?? null;

    if (isset($_POST['next'])) {
        header("Location: ?q=" . ($currentQuestion + 1));
        exit();
    } elseif (isset($_POST['prev'])) {
        header("Location: ?q=" . ($currentQuestion - 1));
        exit();
    } elseif (isset($_POST['submit'])) {
        $_SESSION['questions'] = $questions;
        header("Location: result2.php");
        exit();
    }
}

$currentQuestion = max(0, min($currentQuestion, $totalQuestions - 1));
?>

<!-- HTML & Tailwind UI tetap seperti sebelumnya -->


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Graphic Design Quiz</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        function validateForm() {
            const radios = document.querySelectorAll('input[name="answer"]');
            let formValid = false;
            for (let i = 0; i < radios.length; i++) {
                if (radios[i].checked) {
                    formValid = true;
                    break;
                }
            }
            if (!formValid) {
                alert("Please select an answer before proceeding.");
                return false;
            }
            return true;
        }
    </script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center p-6">

<div class="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-8">

    <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold text-pink-600">Graphic Design Quiz</h1>
        <span class="text-gray-600"><?= ($currentQuestion + 1) ?> / <?= $totalQuestions ?></span>
    </div>

    <div class="w-full bg-gray-300 rounded-full h-2.5 mb-8">
        <div class="bg-pink-500 h-2.5 rounded-full" style="width: <?= (($currentQuestion + 1) / $totalQuestions) * 100 ?>%"></div>
    </div>

    <form method="post" action="?q=<?= $currentQuestion ?>" onsubmit="return validateForm()" class="space-y-6">
        <div>
            <h2 class="text-xl font-semibold text-gray-800 mb-6">
                <?= htmlspecialchars($questions[$currentQuestion]['question']) ?>
            </h2>

            <?php foreach ($questions[$currentQuestion]['options'] as $key => $option): ?>
                <div class="flex items-center mb-4">
                    <input 
                        type="radio" 
                        id="option_<?= $key ?>" 
                        name="answer" 
                        value="<?= $key ?>" 
                        class="w-5 h-5 text-pink-600 focus:ring-pink-500 border-gray-300"
                        <?= (isset($_SESSION['design_answers'][$currentQuestion]) && $_SESSION['design_answers'][$currentQuestion] === $key) ? 'checked' : '' ?>
                    >
                    <label for="option_<?= $key ?>" class="ml-3 text-gray-700 text-lg">
                        <?= $key ?>. <?= htmlspecialchars($option) ?>
                    </label>
                </div>
            <?php endforeach; ?>
        </div>

        <div class="flex justify-between mt-8">
            <?php if ($currentQuestion > 0): ?>
                <button name="prev" class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                    Previous
                </button>
            <?php else: ?>
                <div></div>
            <?php endif; ?>

            <?php if ($currentQuestion < $totalQuestions - 1): ?>
                <button name="next" class="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
                    Next
                </button>
            <?php else: ?>
                <button name="submit" class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                    Submit
                </button>
            <?php endif; ?>
        </div>
    </form>

</div>

</body>
</html>
