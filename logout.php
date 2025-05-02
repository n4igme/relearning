<?php
session_start();

// Tandai sesi sebagai tidak aktif
$_SESSION['status'] = 'inactive';

// Hancurkan semua data sesi
session_destroy();

// Arahkan kembali ke halaman login
header('Location: index.php');
exit;
?>
