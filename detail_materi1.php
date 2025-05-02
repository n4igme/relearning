<?php
// Data materi pemrograman dasar
$materi = [
    [
        'icon' => 'fa-code',
        'nomor' => '01',
        'judul' => 'Pengenalan Variabel',
        'deskripsi' => 'Pelajari konsep dasar variabel dalam pemrograman, tipe data, dan cara pendeklarasiannya dalam berbagai bahasa pemrograman.'
    ],
    [
        'icon' => 'fa-project-diagram',
        'nomor' => '02',
        'judul' => 'Struktur Kontrol',
        'deskripsi' => 'Memahami percabangan (if-else) dan perulangan (for, while) sebagai dasar logika pemrograman.'
    ],
    [
        'icon' => 'fa-cube',
        'nomor' => '03',
        'judul' => 'Fungsi dan Prosedur',
        'deskripsi' => 'Konsep modularisasi kode dengan fungsi dan prosedur untuk membuat program yang lebih terstruktur.'
    ],
    [
        'icon' => 'fa-database',
        'nomor' => '04',
        'judul' => 'Struktur Data Dasar',
        'deskripsi' => 'Pengenalan array, list, dan struktur data sederhana lainnya untuk pengelolaan data.'
    ],
    [
        'icon' => 'fa-bug',
        'nomor' => '05',
        'judul' => 'Debugging Dasar',
        'deskripsi' => 'Teknik identifikasi dan perbaikan kesalahan umum dalam kode pemrograman.'
    ],
    [
        'icon' => 'fa-file-code',
        'nomor' => '06',
        'judul' => 'Best Practices',
        'deskripsi' => 'Pola penulisan kode yang baik dan prinsip-prinsip dasar clean code untuk pemula.'
    ]
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Materi Pemrograman Dasar</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        
        :root {
            --primary-color: #8F90FF;
            --secondary-color: #6c757d;
            --accent-color: #E0E1FF;
            --text-dark: #212529;
            --text-light: #f8f9fa;
            --background-light: #f8f9fa;
            --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            --transition-speed: 0.3s;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: var(--text-dark);
            background-color: var(--background-light);
            -webkit-font-smoothing: antialiased;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }

        /* Header Styles */
        .header {
            background-color: var(--primary-color);
            color: var(--text-light);
            padding: 3rem 0;
            position: relative;
            overflow: hidden;
        }

        .header-content {
            position: relative;
            z-index: 2;
        }

        .header::after {
            content: '';
            position: absolute;
            bottom: -50px;
            left: 0;
            right: 0;
            height: 100px;
            background: var(--background-light);
            transform: skewY(-2deg);
            z-index: 1;
        }

        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
            max-width: 600px;
            margin: 0 auto;
        }

        /* Navigation */
        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 0;
            margin-bottom: 1rem;
        }

        .back-button {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background-color: var(--primary-color);
            color: white;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 500;
            transition: all var(--transition-speed) ease;
            border: 2px solid transparent;
        }

        .back-button:hover {
            background-color: transparent;
            color: var(--primary-color);
            border-color: var(--primary-color);
            transform: translateX(-5px);
        }

        /* Materi Grid */
        .materi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 1.5rem;
            margin: 3rem 0;
        }

        .materi-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: var(--card-shadow);
            transition: all var(--transition-speed) ease;
            border: 1px solid rgba(0, 0, 0, 0.05);
            position: relative;
        }

        .materi-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(143, 144, 255, 0.15);
        }

        .card-number {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            font-size: 3rem;
            font-weight: 700;
            color: rgba(143, 144, 255, 0.1);
            line-height: 1;
            z-index: 1;
        }

        .card-content {
            padding: 2rem;
            position: relative;
            z-index: 2;
        }

        .card-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 50px;
            height: 50px;
            background-color: var(--accent-color);
            color: var(--primary-color);
            border-radius: 12px;
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
        }

        .card-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--primary-color);
        }

        .card-desc {
            color: var(--secondary-color);
            font-size: 0.95rem;
        }

        /* Footer */
        .footer {
            background-color: var(--secondary-color);
            color: var(--text-light);
            text-align: center;
            padding: 2rem 0;
            margin-top: 3rem;
        }

        .footer p {
            opacity: 0.8;
            font-size: 0.9rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .header h1 {
                font-size: 2rem;
            }
            
            .materi-grid {
                grid-template-columns: 1fr;
            }
            
            .card-content {
                padding: 1.5rem;
            }
        }

        /* Micro-interactions */
        .materi-card:hover .card-icon {
            transform: rotate(5deg) scale(1.1);
            transition: transform var(--transition-speed) ease;
        }

        /* Accessibility Focus */
        a:focus, button:focus {
            outline: 2px solid var(--primary-color);
            outline-offset: 2px;
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="container header-content">
            <h1>Pemrograman Dasar</h1>
            <p>Pelajari konsep-konsep fundamental yang menjadi pondasi dalam dunia pemrograman</p>
        </div>
    </header>

    <main class="container">
        <nav class="nav">
            <a href="info.php" class="back-button">
                <i class="fas fa-arrow-left"></i>
                Kembali ke Beranda
            </a>
        </nav>

        <div class="materi-grid">
            <?php foreach ($materi as $item): ?>
                <article class="materi-card">
                    <div class="card-number"><?php echo $item['nomor']; ?></div>
                    <div class="card-content">
                        <div class="card-icon">
                            <i class="fas <?php echo $item['icon']; ?>"></i>
                        </div>
                        <h3 class="card-title"><?php echo $item['judul']; ?></h3>
                        <p class="card-desc"><?php echo $item['deskripsi']; ?></p>
                    </div>
                </article>
            <?php endforeach; ?>
        </div>
    </main>

    <footer class="footer">
        <div class="container">
            <p>© <?php echo date('Y'); ?> E-Learning Pemrograman Dasar. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>