<?php
session_start();
include 'koneksi.php';

// Ambil ID kuis dari URL
$id_kuis = isset($_GET['id_kuis']) ? (int)$_GET['id_kuis'] : 1;

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
    echo "Tidak ada soal untuk kuis ini.";
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $_SESSION['answers'][$id_kuis][$currentQuestion] = $_POST['answer'] ?? null;

    if (isset($_POST['next'])) {
        header("Location: ?id_kuis=$id_kuis&q=" . ($currentQuestion + 1));
        exit();
    } elseif (isset($_POST['prev'])) {
        header("Location: ?id_kuis=$id_kuis&q=" . ($currentQuestion - 1));
        exit();
    } elseif (isset($_POST['submit'])) {
        $_SESSION['questions'][$id_kuis] = $questions;
        header("Location: result.php?id_kuis=$id_kuis");
        exit();
    }
}

$currentQuestion = max(0, min($currentQuestion, $totalQuestions - 1));
?>

<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Detail Kuis</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    function validateForm() {
      const radios = document.querySelectorAll('input[name="answer"]');
      let valid = false;
      radios.forEach(radio => { if (radio.checked) valid = true; });
      if (!valid) {
        alert("Silakan pilih jawaban terlebih dahulu.");
      }
      return valid;
    }
  </script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center p-6">

<div class="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-8">

  <div class="flex justify-between items-center mb-8">
    <h1 class="text-2xl font-bold text-blue-600">Kuis Pemrogaraman Dasar <?= $id_kuis ?></h1>
    <span class="text-gray-600"><?= ($currentQuestion + 1) ?> / <?= $totalQuestions ?></span>
  </div>

  <div class="w-full bg-gray-300 rounded-full h-2.5 mb-8">
    <div class="bg-blue-500 h-2.5 rounded-full" style="width: <?= (($currentQuestion + 1) / $totalQuestions) * 100 ?>%"></div>
  </div>

  <form method="post" action="?id_kuis=<?= $id_kuis ?>&q=<?= $currentQuestion ?>" onsubmit="return validateForm()" class="space-y-6">
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
            class="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300"
            <?= (isset($_SESSION['answers'][$id_kuis][$currentQuestion]) && $_SESSION['answers'][$id_kuis][$currentQuestion] === $key) ? 'checked' : '' ?>
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
          Sebelumnya
        </button>
      <?php else: ?>
        <div></div>
      <?php endif; ?>

      <?php if ($currentQuestion < $totalQuestions - 1): ?>
        <button name="next" class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Selanjutnya
        </button>
      <?php else: ?>
        <button name="submit" class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
          Selesai
        </button>
      <?php endif; ?>
    </div>
  </form>

</div>

</body>
</html>
