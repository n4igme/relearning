<?php
include 'koneksi.php';
header('Content-Type: application/json');

// Ambil data JSON dari request
$data = json_decode(file_get_contents('php://input'), true);

// Validasi data
if (!isset($data['judul']) || !isset($data['deskripsi']) || !isset($data['pertanyaan'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Data tidak lengkap']);
    exit();
}

// Mulai transaction
mysqli_begin_transaction($conn);

try {
    // 1. Simpan data kuis utama
    $stmt = mysqli_prepare($conn, 
        "INSERT INTO kuis (judul, deskripsi, gambar) VALUES (?, ?, ?)");
    mysqli_stmt_bind_param($stmt, 'sss', 
        $data['judul'], 
        $data['deskripsi'], 
        $data['gambar']);
    mysqli_stmt_execute($stmt);
    
    $kuis_id = mysqli_insert_id($conn);
    
    // 2. Simpan semua pertanyaan
    foreach ($data['pertanyaan'] as $pertanyaan) {
        $stmt = mysqli_prepare($conn,
            "INSERT INTO soal (id_kuis, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, jawaban_benar)
             VALUES (?, ?, ?, ?, ?, ?, ?)");
        mysqli_stmt_bind_param($stmt, 'issssss',
            $kuis_id,
            $pertanyaan['pertanyaan'],
            $pertanyaan['opsi_a'],
            $pertanyaan['opsi_b'],
            $pertanyaan['opsi_c'],
            $pertanyaan['opsi_d'],
            $pertanyaan['jawaban_benar']);
        mysqli_stmt_execute($stmt);
    }
    
    // Commit transaction jika semua sukses
    mysqli_commit($conn);
    
    echo json_encode([
        'success' => true,
        'kuis_id' => $kuis_id
    ]);
    
} catch (Exception $e) {
    // Rollback jika ada error
    mysqli_rollback($conn);
    
    http_response_code(500);
    echo json_encode([
        'error' => 'Gagal menyimpan kuis',
        'detail' => $e->getMessage()
    ]);
}
?>